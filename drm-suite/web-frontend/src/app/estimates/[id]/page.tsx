'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getConstructionMasters } from '@/data/construction-masters';
import EstimatePDFPreview from '@/components/EstimatePDFPreview';
import { PDFClientService } from '@/services/pdf-client.service';
import {
  ArrowLeft,
  Eye,
  BarChart3,
  Edit,
  Copy,
  FileText,
  Check,
  X,
  AlertCircle,
  Download,
  Send,
  MoreHorizontal,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  Wrench,
  Printer,
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface Estimate {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  date: string;
  validUntil: string;
  paymentTerms: string;
  items: any[];
  overheadSettings: any;
  totals: any;
  notes?: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
}

export default function EstimateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [masters, setMasters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'preview' | 'analysis'>('preview');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>(
    'approve',
  );
  const [approvalComment, setApprovalComment] = useState('');
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  useEffect(() => {
    const data = getConstructionMasters();
    setMasters(data);

    // LocalStorageから見積データを取得
    const estimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    const foundEstimate = estimates.find(
      (est: Estimate) => est.id === params.id,
    );
    setEstimate(foundEstimate);
  }, [params.id]);

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">見積データを読み込み中...</p>
        </div>
      </div>
    );
  }

  const customer = masters.customers?.find(
    (c: any) => c.id === estimate.customerId,
  );
  const paymentTerm = masters.paymentTerms?.find(
    (pt: any) => pt.id === estimate.paymentTerms,
  );

  // 見積複製
  const handleDuplicate = () => {
    const newEstimate = {
      ...estimate,
      id: `EST-${Date.now()}`,
      status: 'draft' as const,
      title: `${estimate.title}（複製）`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const estimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    estimates.push(newEstimate);
    localStorage.setItem('estimates', JSON.stringify(estimates));

    router.push(`/estimates/${newEstimate.id}`);
  };

  // 承認処理
  const handleApproval = () => {
    const newStatus = approvalAction === 'approve' ? 'approved' : 'rejected';
    const updatedEstimate = {
      ...estimate,
      status: newStatus,
      approvalDate: new Date().toISOString(),
      approvedBy: user?.email,
      approvalComment,
    };

    const estimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    const updatedEstimates = estimates.map((est: Estimate) =>
      est.id === estimate.id ? updatedEstimate : est,
    );
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
    setEstimate(updatedEstimate);
    setShowApprovalModal(false);
    setApprovalComment('');
  };

  // PDF出力処理
  const handlePDFExport = () => {
    logger.estimate.debug('PDF出力ボタンがクリックされました');
    setShowPDFPreview(true);
  };

  // PDFダウンロード（直接）
  const handleQuickPDFDownload = async () => {
    logger.estimate.debug('PDF即ダウンロードボタンがクリックされました');
    try {
      const estimateData = {
        ...estimate,
        customer,
        paymentTerm,
      };
      logger.estimate.debug('PDFダウンロード開始:', estimateData);
      await PDFClientService.downloadEstimatePDF(estimateData);
    } catch (error) {
      logger.estimate.error('PDFダウンロードエラー:', error);
      alert('PDFダウンロード中にエラーが発生しました');
    }
  };

  // ステータス表示
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { text: '下書き', className: 'bg-gray-100 text-gray-800' },
      submitted: { text: '提出済み', className: 'bg-blue-100 text-blue-800' },
      approved: { text: '承認済み', className: 'bg-green-100 text-green-800' },
      rejected: { text: '却下', className: 'bg-red-100 text-red-800' },
      expired: { text: '期限切れ', className: 'bg-orange-100 text-orange-800' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/estimates')}
                className="mr-4 hover:opacity-80 transition"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">見積詳細 - {estimate.id}</h1>
                <p className="text-sm opacity-90 mt-1">
                  {estimate.title} | {estimate.customerName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(estimate.status)}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    viewMode === 'preview'
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  プレビュー
                </button>
                <button
                  onClick={() => setViewMode('analysis')}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    viewMode === 'analysis'
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  分析
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* メインコンテンツ */}
          <div className="col-span-12 lg:col-span-8">
            {viewMode === 'preview' ? (
              // プレビューモード
              <div className="bg-white rounded-lg shadow">
                {/* 見積書ヘッダー */}
                <div className="p-8 border-b">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        見積書
                      </h2>
                      <p className="text-gray-600">見積番号: {estimate.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">見積日</p>
                      <p className="text-lg font-semibold">{estimate.date}</p>
                      <p className="text-sm text-gray-600 mt-2">有効期限</p>
                      <p className="text-lg font-semibold">
                        {estimate.validUntil}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-blue-600">
                      {estimate.title}
                    </h3>
                  </div>

                  {/* 顧客情報 */}
                  {customer && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3 text-gray-700">
                        お客様情報
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{customer.tel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>
                              {customer.prefecture}
                              {customer.city}
                              {customer.address}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 明細 */}
                <div className="p-8">
                  <h4 className="text-lg font-semibold mb-4">工事明細</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            項目名
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                            数量
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                            単位
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            単価
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            金額
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {estimate.items.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {item.itemType === 'product' ? (
                                  <Package className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Wrench className="h-4 w-4 text-green-500" />
                                )}
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {item.unit}
                            </td>
                            <td className="px-4 py-4 text-right">
                              ¥{item.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right font-medium">
                              ¥{item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 集計 */}
                  <div className="mt-8 border-t pt-6">
                    <div className="max-w-md ml-auto space-y-3">
                      <div className="flex justify-between">
                        <span>小計</span>
                        <span className="font-medium">
                          ¥{estimate.totals.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>現場管理費</span>
                        <span>
                          ¥{estimate.totals.overhead.管理費.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>一般管理費</span>
                        <span>
                          ¥
                          {estimate.totals.overhead.一般管理費.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>諸経費</span>
                        <span>
                          ¥{estimate.totals.overhead.諸経費.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>廃材処分費</span>
                        <span>
                          ¥
                          {estimate.totals.overhead.廃材処分費.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>税抜合計</span>
                        <span className="font-medium">
                          ¥{estimate.totals.beforeTax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>消費税（10%）</span>
                        <span className="font-medium">
                          ¥{estimate.totals.tax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-3">
                        <span>合計金額</span>
                        <span>¥{estimate.totals.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 支払条件・備考 */}
                  <div className="mt-8 space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">
                        支払条件
                      </h5>
                      <p className="text-gray-600">
                        {paymentTerm?.name || '現金'}
                      </p>
                    </div>
                    {estimate.notes && (
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">
                          備考
                        </h5>
                        <p className="text-gray-600">{estimate.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // 分析モード
              <div className="space-y-6">
                {/* 利益分析 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-6">収益性分析</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        売上高
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        ¥{estimate.totals.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-6 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium mb-2">
                        原価合計
                      </p>
                      <p className="text-3xl font-bold text-red-700">
                        ¥{estimate.totals.costTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium mb-2">
                        粗利益
                      </p>
                      <p className="text-3xl font-bold text-green-700">
                        ¥{estimate.totals.profit.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        利益率: {estimate.totals.profitRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {estimate.totals.profitRate < 20 && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">
                          利益率が目標（20%）を下回っています
                        </p>
                        <p className="mt-1">
                          単価調整や原価見直しを検討してください
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 項目別利益分析 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-6">項目別利益分析</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            項目名
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            売上
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            原価
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            粗利
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            利益率
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {estimate.items.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-4 font-medium">
                              {item.name}
                            </td>
                            <td className="px-4 py-4 text-right">
                              ¥{item.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right">
                              ¥
                              {(
                                item.costPrice * item.quantity
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right font-medium">
                              ¥{item.profitAmount.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span
                                className={`font-medium ${
                                  item.profitRate >= 25
                                    ? 'text-green-600'
                                    : item.profitRate >= 15
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                }`}
                              >
                                {item.profitRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* コスト構成分析 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-6">コスト構成分析</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">現場管理費</p>
                      <p className="text-lg font-bold">
                        ¥{estimate.totals.overhead.管理費.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (estimate.totals.overhead.管理費 /
                            estimate.totals.total) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">一般管理費</p>
                      <p className="text-lg font-bold">
                        ¥{estimate.totals.overhead.一般管理費.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (estimate.totals.overhead.一般管理費 /
                            estimate.totals.total) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">諸経費</p>
                      <p className="text-lg font-bold">
                        ¥{estimate.totals.overhead.諸経費.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (estimate.totals.overhead.諸経費 /
                            estimate.totals.total) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">廃材処分費</p>
                      <p className="text-lg font-bold">
                        ¥{estimate.totals.overhead.廃材処分費.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (estimate.totals.overhead.廃材処分費 /
                            estimate.totals.total) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* アクション */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">操作</h3>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    router.push(`/estimates/editor-v5/${estimate.id}`)
                  }
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 justify-center"
                >
                  <Edit className="h-4 w-4" />
                  編集
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 justify-center"
                >
                  <Copy className="h-4 w-4" />
                  複製
                </button>
                <button
                  onClick={() => {
                    console.log('PDF出力ボタン直接クリック');
                    alert('PDF出力ボタンがクリックされました！');
                    handlePDFExport();
                  }}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2 justify-center"
                >
                  <FileText className="h-4 w-4" />
                  PDF出力
                </button>
                <button
                  onClick={handleQuickPDFDownload}
                  className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2 justify-center"
                >
                  <Download className="h-4 w-4" />
                  PDF即ダウンロード
                </button>
                <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition flex items-center gap-2 justify-center">
                  <Send className="h-4 w-4" />
                  メール送信
                </button>
              </div>
            </div>

            {/* 承認フロー */}
            {estimate.status === 'submitted' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">承認処理</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setApprovalAction('approve');
                      setShowApprovalModal(true);
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2 justify-center"
                  >
                    <Check className="h-4 w-4" />
                    承認
                  </button>
                  <button
                    onClick={() => {
                      setApprovalAction('reject');
                      setShowApprovalModal(true);
                    }}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 justify-center"
                  >
                    <X className="h-4 w-4" />
                    却下
                  </button>
                </div>
              </div>
            )}

            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">基本情報</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">作成者:</span>
                  <span className="ml-2 font-medium">{estimate.createdBy}</span>
                </div>
                <div>
                  <span className="text-gray-600">作成日:</span>
                  <span className="ml-2 font-medium">
                    {new Date(estimate.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">有効期限:</span>
                  <span className="ml-2 font-medium">
                    {estimate.validUntil}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">項目数:</span>
                  <span className="ml-2 font-medium">
                    {estimate.items.length}項目
                  </span>
                </div>
              </div>
            </div>

            {/* 履歴 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">変更履歴</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">見積作成</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(estimate.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                {estimate.status !== 'draft' && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">
                        ステータス変更: {getStatusBadge(estimate.status)}
                      </p>
                      <p className="text-gray-500 text-xs">システム</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 承認モーダル */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">
                {approvalAction === 'approve' ? '見積承認' : '見積却下'}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">
                {approvalAction === 'approve'
                  ? 'この見積を承認しますか？'
                  : 'この見積を却下しますか？'}
              </p>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="コメント（任意）"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleApproval}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  approvalAction === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {approvalAction === 'approve' ? '承認する' : '却下する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF プレビューモーダル */}
      {showPDFPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-bold mb-4">PDF機能テスト</h2>
            <p className="mb-4">PDFプレビューモーダルが開きました！</p>
            <div className="space-y-2 mb-4">
              <p className="text-sm">見積ID: {estimate.id}</p>
              <p className="text-sm">顧客名: {estimate.customerName}</p>
              <p className="text-sm">
                合計: ¥{estimate.totals?.total?.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  console.log('PDFダウンロード実行');
                  await handleQuickPDFDownload();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                PDFダウンロード
              </button>
              <button
                onClick={() => {
                  console.log('モーダルを閉じる');
                  setShowPDFPreview(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
