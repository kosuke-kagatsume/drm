'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PDFClientService } from '@/services/pdf-client.service';
import { getConstructionMasters } from '@/data/construction-masters';
import { Download, FileText } from 'lucide-react';
import { invoiceService } from '@/services/invoice.service';
import TemplateSelector from '@/components/pdf/TemplateSelector';
import { PdfTemplate } from '@/types/pdf-template';
import { logger } from '@/lib/logger';

interface Estimate {
  id: string;
  estimateNo: string;
  customerName: string;
  companyName: string;
  projectName: string;
  projectType: string;
  totalAmount: number;
  status:
    | 'draft'
    | 'submitted'
    | 'negotiating'
    | 'won'
    | 'lost'
    | 'expired'
    | 'cancelled';
  createdAt: string;
  validUntil: string;
  createdBy: string;
  lastModified: string;
  version: number;
  tags: string[];
  // 新規追加フィールド
  proposalType?: 'A' | 'B' | 'C'; // 提案タイプ（A案/B案/C案）
  parentEstimateId?: string; // 親見積ID（複数案の場合）
  childEstimateIds?: string[]; // 子見積ID（複数案の場合）
  lostReason?: 'price' | 'spec' | 'delivery' | 'competitor' | 'other'; // 失注理由
  lostReasonDetail?: string; // 失注理由詳細
  competitorName?: string; // 競合他社名
  wonDate?: string; // 受注日
  lostDate?: string; // 失注日
  contractAmount?: number; // 契約金額（受注時）
  profitRate?: number; // 粗利率（%）
  orderProbability?: number; // 受注確度（%）
}

export default function EstimatesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(
    null,
  );
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [lostReason, setLostReason] = useState<string>('price');
  const [lostReasonDetail, setLostReasonDetail] = useState('');
  const [competitorName, setCompetitorName] = useState('');
  const [showPdfTemplateModal, setShowPdfTemplateModal] = useState(false);
  const [pdfTargetEstimate, setPdfTargetEstimate] = useState<Estimate | null>(
    null,
  );

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoadingEstimates, setIsLoadingEstimates] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // APIサーバーから見積データを読み込み
  useEffect(() => {
    const loadEstimates = async () => {
      try {
        setIsLoadingEstimates(true);
        setLoadError(null);
        logger.estimate.debug('APIから見積データを取得中...');
        const response = await fetch('/api/estimates');

        if (!response.ok) {
          logger.estimate.error('API取得エラー:', response.statusText);
          throw new Error(
            `見積データの取得に失敗しました (${response.status})`,
          );
        }

        const data = await response.json();
        logger.estimate.debug('API取得成功:', data);

        // APIデータをEstimate型に変換
        const formattedEstimates = data.estimates.map((est: any) => {
          logger.estimate.debug('見積データ:', est);

          // items から合計金額を計算
          // itemsはフラット配列で、isCategory=false の行の amount を合計する
          const totalAmount =
            est.items?.reduce((sum: number, item: any) => {
              // カテゴリー行と小計行は除外（isCategory: true または itemName が「小計」を含む）
              if (item.isCategory === true || item.itemName?.includes('小計')) {
                return sum;
              }
              // 明細行の amount を合計
              return sum + (item.amount || 0);
            }, 0) || 0;

          logger.estimate.debug('計算された合計金額:', totalAmount);

          // プロジェクト名を items から推測（最初のアイテムのカテゴリ名など）
          const projectName = est.items?.[0]?.category || '見積書';

          return {
            id: est.id,
            estimateNo: est.id,
            customerName: est.customerName || est.customer?.name || '未設定',
            companyName: est.customer?.company || '',
            projectName: projectName,
            projectType: '建設工事',
            totalAmount: totalAmount,
            status: est.status || 'draft',
            createdAt:
              est.savedAt?.split('T')[0] ||
              est.updatedAt?.split('T')[0] ||
              new Date().toISOString().split('T')[0],
            validUntil:
              est.validUntil ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            createdBy: 'システム',
            lastModified:
              est.updatedAt?.split('T')[0] ||
              new Date().toISOString().split('T')[0],
            version: 1,
            tags: [],
          };
        });

        logger.estimate.debug('フォーマット済みデータ:', formattedEstimates);
        setEstimates(formattedEstimates);
      } catch (error) {
        logger.estimate.error('データ読み込みエラー:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : '見積データの読み込み中にエラーが発生しました';
        setLoadError(errorMessage);
        // エラー時は空配列を設定
        setEstimates([]);
      } finally {
        setIsLoadingEstimates(false);
      }
    };

    loadEstimates();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: '下書き',
        icon: '📋',
      },
      submitted: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: '提出済み',
        icon: '📤',
      },
      negotiating: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: '交渉中',
        icon: '🤝',
      },
      won: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: '受注',
        icon: '🎉',
      },
      lost: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: '失注',
        icon: '😢',
      },
      expired: {
        bg: 'bg-gray-200',
        text: 'text-gray-600',
        label: '期限切れ',
        icon: '⏰',
      },
      cancelled: {
        bg: 'bg-gray-300',
        text: 'text-gray-700',
        label: 'キャンセル',
        icon: '🚫',
      },
      // pendingも互換性のため残す
      pending: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: '提出済み',
        icon: '📤',
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: '受注',
        icon: '🎉',
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: '失注',
        icon: '😢',
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1 inline-flex`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  // フィルタリングとソート
  const filteredEstimates = estimates
    .filter((estimate) => {
      const matchesSearch =
        searchTerm === '' ||
        estimate.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        estimate.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.estimateNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || estimate.status === filterStatus;
      const matchesType =
        filterType === 'all' || estimate.projectType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        case 'date':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  // PDF出力（テンプレート選択モーダル経由）
  const handlePdfDownload = (estimate: Estimate) => {
    setPdfTargetEstimate(estimate);
    setShowPdfTemplateModal(true);
  };

  const handleTemplateSelect = (template: PdfTemplate) => {
    if (!pdfTargetEstimate) return;

    const companyId = 'demo-tenant';
    const pdfUrl = `/api/pdf/generate/estimate/${pdfTargetEstimate.id}?companyId=${companyId}&templateId=${template.id}`;
    window.open(pdfUrl, '_blank');

    setShowPdfTemplateModal(false);
    setPdfTargetEstimate(null);
  };

  // 統計情報
  // 見積複製（A案/B案/C案として複製可能）
  const handleDuplicate = (estimate: Estimate) => {
    // 提案タイプを選択
    const proposalType = prompt(
      '提案タイプを選択してください（A/B/C）\n※同一顧客への別提案として管理されます',
      'B',
    );
    if (
      !proposalType ||
      !['A', 'B', 'C'].includes(proposalType.toUpperCase())
    ) {
      return;
    }

    const newEstimate = {
      ...estimate,
      id: `EST-${Date.now()}`,
      estimateNo: `${estimate.estimateNo}-${proposalType.toUpperCase()}`,
      status: 'draft' as const,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      version: 1,
      projectName: `${estimate.projectName}（${proposalType.toUpperCase()}案）`,
      proposalType: proposalType.toUpperCase() as 'A' | 'B' | 'C',
      parentEstimateId: estimate.parentEstimateId || estimate.id,
    };

    // 親見積の子見積リストを更新
    const updatedEstimates = estimates.map((e) => {
      if (e.id === (estimate.parentEstimateId || estimate.id)) {
        return {
          ...e,
          childEstimateIds: [...(e.childEstimateIds || []), newEstimate.id],
        };
      }
      return e;
    });

    const newEstimates = [newEstimate, ...updatedEstimates];
    setEstimates(newEstimates);

    // LocalStorageも更新
    const savedEstimates = localStorage.getItem('estimates');
    if (savedEstimates) {
      const parsed = JSON.parse(savedEstimates);
      parsed.push({
        ...newEstimate,
        title: newEstimate.projectName,
        date: newEstimate.createdAt,
      });
      localStorage.setItem('estimates', JSON.stringify(parsed));
    }

    alert(`${proposalType.toUpperCase()}案として複製しました`);
  };

  // 見積削除
  const handleDelete = (id: string) => {
    if (confirm('この見積を削除してもよろしいですか？')) {
      const newEstimates = estimates.filter((e) => e.id !== id);
      setEstimates(newEstimates);

      // LocalStorageも更新
      const savedEstimates = localStorage.getItem('estimates');
      if (savedEstimates) {
        const parsed = JSON.parse(savedEstimates);
        const filtered = parsed.filter((e: any) => e.id !== id);
        localStorage.setItem('estimates', JSON.stringify(filtered));
      }

      alert('見積を削除しました');
    }
  };

  // 契約書作成（自動マッピング対応）
  const handleCreateContract = async (estimate: Estimate) => {
    try {
      // workflow-settingsから自動マッピング設定を取得して契約データを生成
      const response = await fetch('/api/contracts/from-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimateId: estimate.id }),
      });

      if (!response.ok) {
        throw new Error('契約データの生成に失敗しました');
      }

      const { contract: contractData, settings } = await response.json();

      // 契約書作成画面へ遷移（自動生成されたデータを引き継ぎ）
      const params = new URLSearchParams({
        estimateId: estimate.id,
        autoMapped: 'true',
      });
      router.push(`/contracts/create?${params.toString()}`);
    } catch (error) {
      logger.estimate.error('契約書作成エラー:', error);
      alert('契約書の作成に失敗しました。管理者設定を確認してください。');
    }
  };

  const stats = {
    total: estimates.length,
    totalAmount: estimates.reduce((sum, e) => sum + e.totalAmount, 0),
    submitted: estimates.filter(
      (e) =>
        e.status === 'submitted' ||
        e.status === 'negotiating' ||
        e.status === 'pending',
    ).length,
    won: estimates.filter((e) => e.status === 'won' || e.status === 'approved')
      .length,
    lost: estimates.filter(
      (e) => e.status === 'lost' || e.status === 'rejected',
    ).length,
    winRate:
      estimates.filter(
        (e) =>
          e.status === 'won' ||
          e.status === 'lost' ||
          e.status === 'approved' ||
          e.status === 'rejected',
      ).length > 0
        ? (
            (estimates.filter(
              (e) => e.status === 'won' || e.status === 'approved',
            ).length /
              estimates.filter(
                (e) =>
                  e.status === 'won' ||
                  e.status === 'lost' ||
                  e.status === 'approved' ||
                  e.status === 'rejected',
              ).length) *
            100
          ).toFixed(1)
        : 0,
    averageAmount:
      estimates.length > 0
        ? estimates.reduce((sum, e) => sum + e.totalAmount, 0) /
          estimates.length
        : 0,
  };

  // ステータス変更処理
  const handleStatusChange = (newStatus: string) => {
    if (!selectedEstimate) return;

    if (newStatus === 'lost') {
      setShowStatusModal(false);
      setShowLostReasonModal(true);
      return;
    }

    const updatedEstimate = {
      ...selectedEstimate,
      status: newStatus as any,
      lastModified: new Date().toISOString().split('T')[0],
    };

    if (newStatus === 'won') {
      updatedEstimate.wonDate = new Date().toISOString().split('T')[0];
      updatedEstimate.contractAmount = selectedEstimate.totalAmount;
    }

    const updatedEstimates = estimates.map((e) =>
      e.id === selectedEstimate.id ? updatedEstimate : e,
    );
    setEstimates(updatedEstimates);

    // LocalStorageも更新
    const savedEstimates = localStorage.getItem('estimates');
    if (savedEstimates) {
      const parsed = JSON.parse(savedEstimates);
      const updated = parsed.map((e: any) =>
        e.id === selectedEstimate.id ? { ...e, status: newStatus } : e,
      );
      localStorage.setItem('estimates', JSON.stringify(updated));
    }

    setShowStatusModal(false);
    setSelectedEstimate(null);
  };

  // 失注理由を保存
  const handleLostReasonSave = () => {
    if (!selectedEstimate) return;

    const updatedEstimate = {
      ...selectedEstimate,
      status: 'lost' as any,
      lostDate: new Date().toISOString().split('T')[0],
      lostReason: lostReason as any,
      lostReasonDetail,
      competitorName,
      lastModified: new Date().toISOString().split('T')[0],
    };

    const updatedEstimates = estimates.map((e) =>
      e.id === selectedEstimate.id ? updatedEstimate : e,
    );
    setEstimates(updatedEstimates);

    // LocalStorageも更新
    const savedEstimates = localStorage.getItem('estimates');
    if (savedEstimates) {
      const parsed = JSON.parse(savedEstimates);
      const updated = parsed.map((e: any) =>
        e.id === selectedEstimate.id
          ? {
              ...e,
              status: 'lost',
              lostReason,
              lostReasonDetail,
              competitorName,
            }
          : e,
      );
      localStorage.setItem('estimates', JSON.stringify(updated));
    }

    setShowLostReasonModal(false);
    setSelectedEstimate(null);
    setLostReason('price');
    setLostReasonDetail('');
    setCompetitorName('');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 見積データのローディング中表示
  if (isLoadingEstimates) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  ← 戻る
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">見積管理</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    見積書の作成・管理・承認
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ローディング */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-dandori-blue mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">
              見積データを読み込み中...
            </p>
            <p className="mt-2 text-sm text-gray-500">しばらくお待ちください</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  ← 戻る
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">見積管理</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    見積書の作成・管理・承認
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">
              データの読み込みに失敗しました
            </h3>
            <p className="text-red-600 mb-6">{loadError}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 再読み込み
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ダッシュボードへ戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">見積管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  見積書の作成・管理・承認
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/estimates/analytics')}
                className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition flex items-center gap-2"
              >
                📊 営業分析
              </button>
              <button
                onClick={() => router.push('/estimates/templates')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                📋 テンプレート管理
              </button>
              <button
                onClick={() => router.push('/estimates/create-v2')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                新規見積作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総見積数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-dandori-blue/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総額</p>
                <p className="text-2xl font-bold text-dandori-blue">
                  ¥{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">提出中</p>
                <p className="text-2xl font-bold text-dandori-orange">
                  {stats.submitted}
                </p>
              </div>
              <div className="w-12 h-12 bg-dandori-yellow/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">受注率</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.winRate}%
                </p>
                <p className="text-xs text-gray-500">
                  受注{stats.won}/失注{stats.lost}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 顧客名、プロジェクト名、見積番号で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              >
                <option value="all">全てのステータス</option>
                <option value="draft">下書き</option>
                <option value="submitted">提出済み</option>
                <option value="negotiating">交渉中</option>
                <option value="won">受注</option>
                <option value="lost">失注</option>
                <option value="expired">期限切れ</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              >
                <option value="all">全ての種類</option>
                <option value="新築住宅">新築住宅</option>
                <option value="リフォーム">リフォーム</option>
                <option value="外壁塗装">外壁塗装</option>
                <option value="増築">増築</option>
                <option value="店舗内装">店舗内装</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'date' | 'amount' | 'customer')
                }
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              >
                <option value="date">日付順</option>
                <option value="amount">金額順</option>
                <option value="customer">顧客名順</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-l-lg transition-colors`}
                  title="リスト表示"
                >
                  📋
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-r-lg transition-colors`}
                  title="グリッド表示"
                >
                  🎲
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* リスト表示 */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    見積情報
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    顧客情報
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEstimates.map((estimate) => (
                  <tr
                    key={estimate.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">
                            {estimate.estimateNo}
                          </p>
                          {estimate.proposalType && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                              {estimate.proposalType}案
                            </span>
                          )}
                          <span className="text-xs bg-dandori-blue/10 text-dandori-blue px-2 py-0.5 rounded">
                            v{estimate.version}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">
                          {estimate.projectName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            🏢 {estimate.projectType}
                          </span>
                          <span className="text-xs text-gray-500">
                            📅 {estimate.createdAt}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {estimate.customerName}
                        </p>
                        {estimate.companyName && (
                          <p className="text-xs text-gray-600">
                            {estimate.companyName}
                          </p>
                        )}
                        <div className="flex gap-1 mt-1">
                          {estimate.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-lg font-bold text-dandori-blue">
                        ¥{estimate.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">税込</p>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        {getStatusBadge(estimate.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          有効期限: {estimate.validUntil}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEstimate(estimate);
                              setShowStatusModal(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            🔄
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            ステータス変更
                          </div>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() =>
                              router.push(`/estimates/${estimate.id}`)
                            }
                            className="p-1.5 text-gray-600 hover:text-dandori-blue hover:bg-dandori-blue/10 rounded transition-colors"
                          >
                            🔍
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            詳細表示
                          </div>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() =>
                              router.push(`/estimates/editor-v5/${estimate.id}`)
                            }
                            className="p-1.5 text-gray-600 hover:text-dandori-blue hover:bg-dandori-blue/10 rounded transition-colors"
                          >
                            ✏️
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            編集
                          </div>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleDuplicate(estimate)}
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            📋
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            複製（A/B/C案）
                          </div>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handlePdfDownload(estimate)}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            📄
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            PDF出力
                          </div>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleDelete(estimate.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            🗑
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            削除
                          </div>
                        </div>
                        {(estimate.status === 'won' ||
                          estimate.status === 'approved') && (
                          <div className="relative group">
                            <button
                              onClick={() => handleCreateContract(estimate)}
                              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              📑
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              契約書作成
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* グリッド表示 */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/estimates/${estimate.id}`)}
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {estimate.estimateNo}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {estimate.proposalType && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                              {estimate.proposalType}案
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            v{estimate.version}
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(estimate.status)}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {estimate.projectName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {estimate.customerName}
                  </p>
                  {estimate.companyName && (
                    <p className="text-xs text-gray-500">
                      {estimate.companyName}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">見積金額</span>
                    <span className="text-xl font-bold text-dandori-blue">
                      ¥{estimate.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>🏢 {estimate.projectType}</span>
                      <span>📅 {estimate.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>👤 {estimate.createdBy}</span>
                      <span>⏰ {estimate.validUntil}まで</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {estimate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className="px-4 pb-4 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      router.push(`/estimates/editor-v5/${estimate.id}`)
                    }
                    className="flex-1 py-1.5 bg-dandori-blue text-white text-sm rounded hover:bg-dandori-blue-dark transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handlePdfDownload(estimate)}
                    className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状態 */}
        {filteredEstimates.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? '🔍'
                : '📂'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? '検索結果が見つかりません'
                : '見積書がまだありません'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? '検索条件を変更するか、新しい見積書を作成してください'
                : '最初の見積書を作成して、営業活動を開始しましょう'}
            </p>
            <div className="flex gap-3 justify-center">
              {(searchTerm ||
                filterStatus !== 'all' ||
                filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  🔄 フィルターをリセット
                </button>
              )}
              <button
                onClick={() => router.push('/estimates/create-v2')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">+</span>
                  新規見積作成
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ステータス変更モーダル */}
        {showStatusModal && selectedEstimate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">ステータス変更</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  見積番号: {selectedEstimate.estimateNo}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  案件名: {selectedEstimate.projectName}
                </p>
                <p className="text-sm text-gray-600">
                  現在のステータス: {getStatusBadge(selectedEstimate.status)}
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange('submitted')}
                  className="w-full py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  📤 提出済みにする
                </button>
                <button
                  onClick={() => handleStatusChange('negotiating')}
                  className="w-full py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition flex items-center justify-center gap-2"
                >
                  🤝 交渉中にする
                </button>
                <button
                  onClick={() => handleStatusChange('won')}
                  className="w-full py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-2"
                >
                  🎉 受注にする
                </button>
                <button
                  onClick={() => handleStatusChange('lost')}
                  className="w-full py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  😢 失注にする
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  🚫 キャンセルにする
                </button>
              </div>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedEstimate(null);
                }}
                className="w-full mt-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* 失注理由入力モーダル */}
        {showLostReasonModal && selectedEstimate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">失注理由の記録</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  見積番号: {selectedEstimate.estimateNo}
                </p>
                <p className="text-sm text-gray-600">
                  案件名: {selectedEstimate.projectName}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    失注理由
                  </label>
                  <select
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="price">価格</option>
                    <option value="spec">仕様</option>
                    <option value="delivery">納期</option>
                    <option value="competitor">競合他社</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    競合他社名（分かれば）
                  </label>
                  <input
                    type="text"
                    value={competitorName}
                    onChange={(e) => setCompetitorName(e.target.value)}
                    placeholder="例: ○○建設"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詳細（任意）
                  </label>
                  <textarea
                    value={lostReasonDetail}
                    onChange={(e) => setLostReasonDetail(e.target.value)}
                    rows={3}
                    placeholder="詳細な理由や今後の改善点など"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleLostReasonSave}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  失注として記録
                </button>
                <button
                  onClick={() => {
                    setShowLostReasonModal(false);
                    setSelectedEstimate(null);
                    setLostReason('price');
                    setLostReasonDetail('');
                    setCompetitorName('');
                  }}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDFテンプレート選択モーダル */}
        {showPdfTemplateModal && pdfTargetEstimate && (
          <TemplateSelector
            companyId="demo-tenant"
            documentType="estimate"
            onTemplateSelect={handleTemplateSelect}
            onClose={() => {
              setShowPdfTemplateModal(false);
              setPdfTargetEstimate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
