'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Estimate {
  id: string;
  estimateNo: string;
  customerName: string;
  companyName: string;
  projectName: string;
  projectType: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  validUntil: string;
  createdBy: string;
  lastModified: string;
  version: number;
  tags: string[];
}

export default function EstimatesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: '1',
      estimateNo: 'EST-2024-001',
      customerName: '田中太郎',
      companyName: '田中建設株式会社',
      projectName: '田中様邸新築工事',
      projectType: '新築住宅',
      totalAmount: 15500000,
      status: 'pending',
      createdAt: '2024-08-01',
      validUntil: '2024-08-31',
      createdBy: '佐藤次郎',
      lastModified: '2024-08-10',
      version: 2,
      tags: ['木造', '2階建て', '緊急'],
    },
    {
      id: '2',
      estimateNo: 'EST-2024-002',
      customerName: '山田花子',
      companyName: '山田商事株式会社',
      projectName: '山田ビル外壁改修',
      projectType: '外壁塗装',
      totalAmount: 3200000,
      status: 'approved',
      createdAt: '2024-08-03',
      validUntil: '2024-09-03',
      createdBy: '鈴木一郎',
      lastModified: '2024-08-05',
      version: 1,
      tags: ['塗装', 'ビル'],
    },
    {
      id: '3',
      estimateNo: 'EST-2024-003',
      customerName: '鈴木明',
      companyName: '鈴木不動産',
      projectName: 'マンションリフォーム',
      projectType: 'リフォーム',
      totalAmount: 8500000,
      status: 'draft',
      createdAt: '2024-08-05',
      validUntil: '2024-09-05',
      createdBy: '佐藤次郎',
      lastModified: '2024-08-09',
      version: 3,
      tags: ['マンション', '水回り'],
    },
    {
      id: '4',
      estimateNo: 'EST-2024-004',
      customerName: '高橋一郎',
      companyName: '',
      projectName: '高橋様邸増築工事',
      projectType: '増築',
      totalAmount: 12000000,
      status: 'rejected',
      createdAt: '2024-07-20',
      validUntil: '2024-08-20',
      createdBy: '山田太郎',
      lastModified: '2024-07-25',
      version: 2,
      tags: ['増築', '個人宅'],
    },
    {
      id: '5',
      estimateNo: 'EST-2024-005',
      customerName: '渡辺美穂',
      companyName: '渡辺コーポレーション',
      projectName: '店舗内装工事',
      projectType: '店舗内装',
      totalAmount: 5500000,
      status: 'expired',
      createdAt: '2024-06-01',
      validUntil: '2024-07-01',
      createdBy: '鈴木一郎',
      lastModified: '2024-06-15',
      version: 1,
      tags: ['飲食店', '内装'],
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: '下書き',
        icon: '📋',
      },
      pending: {
        bg: 'bg-dandori-yellow/20',
        text: 'text-dandori-orange',
        label: '承認待ち',
        icon: '⏳',
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: '承認済み',
        icon: '✅',
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: '却下',
        icon: '❌',
      },
      expired: {
        bg: 'bg-gray-200',
        text: 'text-gray-600',
        label: '期限切れ',
        icon: '⏰',
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

  // 統計情報
  const stats = {
    total: estimates.length,
    totalAmount: estimates.reduce((sum, e) => sum + e.totalAmount, 0),
    pending: estimates.filter((e) => e.status === 'pending').length,
    approved: estimates.filter((e) => e.status === 'approved').length,
    averageAmount:
      estimates.length > 0
        ? estimates.reduce((sum, e) => sum + e.totalAmount, 0) /
          estimates.length
        : 0,
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              新規見積作成
            </button>
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
                <p className="text-sm text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-dandori-orange">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-dandori-yellow/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均額</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{Math.round(stats.averageAmount).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
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
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
                <option value="expired">期限切れ</option>
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
                        <button
                          onClick={() =>
                            router.push(`/estimates/${estimate.id}`)
                          }
                          className="p-1.5 text-gray-600 hover:text-dandori-blue hover:bg-dandori-blue/10 rounded transition-colors"
                          title="詳細"
                        >
                          🔍
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/estimates/${estimate.id}/edit`)
                          }
                          className="p-1.5 text-gray-600 hover:text-dandori-blue hover:bg-dandori-blue/10 rounded transition-colors"
                          title="編集"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="複製"
                        >
                          📋
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="PDF出力"
                        >
                          📄
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="削除"
                        >
                          🗑
                        </button>
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
                      <p className="text-sm font-bold text-gray-900">
                        {estimate.estimateNo}
                      </p>
                      <p className="text-xs text-gray-500">
                        v{estimate.version}
                      </p>
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
                      router.push(`/estimates/${estimate.id}/edit`)
                    }
                    className="flex-1 py-1.5 bg-dandori-blue text-white text-sm rounded hover:bg-dandori-blue-dark transition-colors"
                  >
                    編集
                  </button>
                  <button className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
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
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-600 mb-4">該当する見積書がありません</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
            >
              新規見積を作成
            </button>
          </div>
        )}
      </div>

      {/* 見積作成選択モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-dandori text-white p-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">見積作成方法を選択</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {/* マスタ連携版への直接リンク - 目立つように上部に配置 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg mr-4">
                      🔗
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        マスタ連携版（推奨）
                      </h3>
                      <p className="text-sm text-gray-600">
                        マスタデータから商品・品目を選択して効率的に見積作成
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      router.push('/estimates/create-v2');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                  >
                    今すぐ使う →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 通常版 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl group-hover:blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      router.push('/estimates/create');
                    }}
                    className="relative w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-dandori-blue hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
                        📝
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        スタンダード
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      通常版
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      シンプルで使いやすい標準的な見積作成フォーム
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>基本的な項目入力</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>テンプレート機能</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>自動計算</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>PDF出力</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        作成時間: 約5分
                      </span>
                      <span className="text-dandori-blue font-bold">
                        選択 →
                      </span>
                    </div>
                  </button>
                </div>

                {/* プロ版 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl group-hover:blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      router.push('/estimates/create/enhanced');
                    }}
                    className="relative w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
                        🚀
                      </div>
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        プロフェッショナル
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      プロ版
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      建設業界特化の高機能見積作成システム
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>3階層の詳細分類</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>原価管理・利益分析</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>AIアシスタント</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>画像・図面添付</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        作成時間: 約10分
                      </span>
                      <span className="text-purple-600 font-bold">選択 →</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 比較表 */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">機能比較</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-medium text-gray-600">機能</div>
                  <div className="text-center font-medium text-blue-600">
                    通常版
                  </div>
                  <div className="text-center font-medium text-purple-600">
                    プロ版
                  </div>

                  <div className="py-2 border-t">基本情報入力</div>
                  <div className="py-2 border-t text-center">✓</div>
                  <div className="py-2 border-t text-center">✓</div>

                  <div className="py-2">テンプレート</div>
                  <div className="py-2 text-center">3種類</div>
                  <div className="py-2 text-center">10種類以上</div>

                  <div className="py-2">明細分類</div>
                  <div className="py-2 text-center">1階層</div>
                  <div className="py-2 text-center">3階層</div>

                  <div className="py-2">原価管理</div>
                  <div className="py-2 text-center">基本</div>
                  <div className="py-2 text-center">詳細</div>

                  <div className="py-2">AI支援</div>
                  <div className="py-2 text-center">-</div>
                  <div className="py-2 text-center">✓</div>

                  <div className="py-2">承認ワークフロー</div>
                  <div className="py-2 text-center">✓</div>
                  <div className="py-2 text-center">✓</div>

                  <div className="py-2">バージョン管理</div>
                  <div className="py-2 text-center">-</div>
                  <div className="py-2 text-center">✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
