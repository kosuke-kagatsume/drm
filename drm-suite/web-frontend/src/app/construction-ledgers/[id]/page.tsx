'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Package,
  Receipt,
  AlertCircle,
  Edit,
  CheckCircle,
  Clock,
  Users,
  RefreshCw,
  Download,
  FileDown,
  BarChart3,
} from 'lucide-react';
import CostDetailsTab from './CostDetailsTab';

interface ConstructionLedger {
  id: string;
  constructionNo: string;
  constructionName: string;
  constructionType: string;
  constructionCategory: string;
  customerName: string;
  customerCompany?: string;
  customerContact: string;
  constructionAddress: string;
  constructionCity: string;
  constructionPrefecture: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  constructionDays: number;
  contractAmount: number;
  taxAmount: number;
  totalContractAmount: number;
  estimateId?: string;
  estimateNo?: string;
  contractId?: string;
  contractNo?: string;
  executionBudget?: {
    materialCost: number;
    laborCost: number;
    outsourcingCost: number;
    expenseCost: number;
    totalBudget: number;
    expectedProfit: number;
    expectedProfitRate: number;
  };
  actualCost?: {
    materialCost: number;
    laborCost: number;
    outsourcingCost: number;
    expenseCost: number;
    totalCost: number;
    actualProfit: number;
    actualProfitRate: number;
  };
  costAnalysis?: {
    budgetVsActual: {
      materialVariance: number;
      laborVariance: number;
      outsourcingVariance: number;
      expenseVariance: number;
      totalVariance: number;
      varianceRate: number;
    };
    profitAnalysis: {
      profitVariance: number;
      profitVarianceRate: number;
    };
  };
  alerts?: Array<{
    type: 'cost_overrun' | 'profit_decline' | 'loss_making';
    severity: 'warning' | 'critical';
    message: string;
  }>;
  progress: {
    status: string;
    progressRate: number;
    completedWorkValue: number;
    billedAmount: number;
    receivedAmount: number;
  };
  orders?: Array<{
    orderId: string;
    orderNo: string;
    partnerName: string;
    orderAmount: number;
    status: string;
  }>;
  invoices?: Array<{
    invoiceId: string;
    invoiceNo: string;
    invoiceDate: string;
    amount: number;
    status: string;
  }>;
  salesPerson: string;
  constructionManager: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export default function ConstructionLedgerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ledgerId = params.id as string;

  const [ledger, setLedger] = useState<ConstructionLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'budget' | 'cost-details' | 'progress' | 'integrated'
  >('overview');

  useEffect(() => {
    if (ledgerId) {
      fetchLedger();
    }
  }, [ledgerId]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/construction-ledgers?id=${ledgerId}`, {
        cache: 'no-store', // キャッシュ無効化
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();

      if (data.success && data.ledger) {
        setLedger(data.ledger);
        console.log('📊 工事台帳データ取得:', {
          id: data.ledger.id,
          actualCost: data.ledger.actualCost?.totalCost,
          executionBudget: data.ledger.executionBudget?.totalBudget,
        });
      }
    } catch (error) {
      console.error('Error fetching construction ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      planning: '計画中',
      approved: '承認済み',
      in_progress: '施工中',
      completed: '完了',
      suspended: '中断',
      cancelled: 'キャンセル',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      planning: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      suspended: 'bg-orange-100 text-orange-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">工事台帳が見つかりません</p>
          <button
            onClick={() => router.push('/construction-ledgers')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/construction-ledgers')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{ledger.constructionName}</h1>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                      ledger.status
                    )}`}
                  >
                    {getStatusLabel(ledger.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  工事番号: {ledger.constructionNo} | {ledger.constructionType} |{' '}
                  {ledger.constructionCategory}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* クイックアクションボタン */}
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/orders/sync-from-dw?drmOrderId=${ledger.id}`,
                      { cache: 'no-store' }
                    );
                    if (res.ok) {
                      alert('DWからのデータ同期を開始しました');
                      await fetchLedger();
                    }
                  } catch (error) {
                    console.error('DW sync error:', error);
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                title="DWから最新原価を同期"
              >
                <RefreshCw className="h-4 w-4" />
                DW同期
              </button>
              <button
                onClick={() => {
                  // CSV出力処理
                  const csvData = [
                    ['工事番号', ledger.constructionNo],
                    ['工事名', ledger.constructionName],
                    ['契約金額', ledger.totalContractAmount],
                    ['予算金額', ledger.executionBudget?.totalBudget || 0],
                    ['実績原価', ledger.actualCost?.totalCost || 0],
                  ];
                  const csv = csvData.map((row) => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `construction_ledger_${ledger.constructionNo}.csv`;
                  a.click();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                title="CSV形式でエクスポート"
              >
                <FileDown className="h-4 w-4" />
                CSV出力
              </button>
              <button
                onClick={() => router.push(`/construction-ledgers/${ledgerId}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit className="h-5 w-5" />
                編集
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'budget'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              予算・原価
            </button>
            <button
              onClick={() => setActiveTab('cost-details')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'cost-details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              原価明細
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'progress'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              進捗管理
            </button>
            <button
              onClick={() => setActiveTab('integrated')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'integrated'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              統合ビュー
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 工事基本情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                工事基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">工事名称</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.constructionName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">工事種別</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.constructionType} / {ledger.constructionCategory}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    工事場所
                  </label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    〒{ledger.constructionPostalCode} {ledger.constructionPrefecture}
                    {ledger.constructionCity}
                    {ledger.constructionAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* 顧客情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                顧客情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">顧客名</label>
                  <p className="text-base font-medium text-gray-900 mt-1">{ledger.customerName}</p>
                </div>
                {ledger.customerCompany && (
                  <div>
                    <label className="text-sm text-gray-600">会社名</label>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {ledger.customerCompany}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">連絡先</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.customerContact}
                  </p>
                </div>
              </div>
            </div>

            {/* 工期情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                工期情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">着工予定日</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.scheduledStartDate}
                  </p>
                  {ledger.actualStartDate && (
                    <p className="text-sm text-blue-600 mt-1">
                      実際: {ledger.actualStartDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600">完了予定日</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.scheduledEndDate}
                  </p>
                  {ledger.actualEndDate && (
                    <p className="text-sm text-blue-600 mt-1">実際: {ledger.actualEndDate}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600">工期日数</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.constructionDays}日
                  </p>
                </div>
              </div>
            </div>

            {/* 契約金額 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                契約金額
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-gray-600">契約金額（税抜）</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ¥{ledger.contractAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">消費税</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ¥{ledger.taxAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">契約金額（税込）</label>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    ¥{ledger.totalContractAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 担当者 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                担当者
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">営業担当</label>
                  <p className="text-base font-medium text-gray-900 mt-1">{ledger.salesPerson}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">施工管理担当</label>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {ledger.constructionManager}
                  </p>
                </div>
              </div>
            </div>

            {/* メモ */}
            {ledger.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">備考</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{ledger.notes}</p>
              </div>
            )}

            {/* 🔥 発注サマリー */}
            {ledger.orders && ledger.orders.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    発注サマリー ({ledger.orders.length}件)
                  </h2>
                  <button
                    onClick={() => setActiveTab('integrated')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    詳細を見る →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ledger.orders.slice(0, 6).map((order) => (
                    <div
                      key={order.orderId}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition cursor-pointer"
                      onClick={() => router.push(`/orders/${order.orderId}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">{order.orderNo}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{order.partnerName}</div>
                      <div className="text-base font-bold text-gray-900">
                        ¥{order.orderAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                {ledger.orders.length > 6 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setActiveTab('integrated')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      他 {ledger.orders.length - 6} 件の発注を表示 →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 🔥 請求サマリー */}
            {ledger.invoices && ledger.invoices.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    請求サマリー ({ledger.invoices.length}件)
                  </h2>
                  <button
                    onClick={() => setActiveTab('integrated')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    詳細を見る →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ledger.invoices.slice(0, 6).map((invoice) => (
                    <div
                      key={invoice.invoiceId}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition cursor-pointer"
                      onClick={() => router.push(`/invoices/${invoice.invoiceId}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNo}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{invoice.invoiceDate}</div>
                      <div className="text-base font-bold text-gray-900">
                        ¥{invoice.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                {ledger.invoices.length > 6 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setActiveTab('integrated')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      他 {ledger.invoices.length - 6} 件の請求を表示 →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 予算・原価タブ */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* 🔥 アラート表示 */}
            {ledger.alerts && ledger.alerts.length > 0 && (
              <div className="space-y-3">
                {ledger.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 flex items-start gap-3 ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'bg-yellow-50 border-2 border-yellow-200'
                    }`}
                  >
                    <AlertCircle
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                          }`}
                        >
                          {alert.severity === 'critical' ? '🔴 重大' : '⚠️ 警告'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.type === 'cost_overrun'
                              ? 'bg-red-100 text-red-700'
                              : alert.type === 'profit_decline'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {alert.type === 'cost_overrun'
                            ? '原価超過'
                            : alert.type === 'profit_decline'
                            ? '粗利低下'
                            : '赤字案件'}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                        }`}
                      >
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 予算vs実績サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">契約金額</div>
                <div className="text-2xl font-bold text-gray-900">
                  ¥{ledger.totalContractAmount.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">予算金額</div>
                <div className="text-2xl font-bold text-blue-600">
                  ¥
                  {ledger.executionBudget
                    ? ledger.executionBudget.totalBudget.toLocaleString()
                    : '-'}
                </div>
                {ledger.executionBudget && (
                  <div className="text-sm text-gray-500 mt-1">
                    粗利率: {ledger.executionBudget.expectedProfitRate.toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">実績原価</div>
                <div className="text-2xl font-bold text-green-600">
                  ¥{ledger.actualCost ? ledger.actualCost.totalCost.toLocaleString() : '-'}
                </div>
                {ledger.actualCost && (
                  <div className="text-sm text-gray-500 mt-1">
                    粗利率: {ledger.actualCost.actualProfitRate.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* 🔥 予算vs実績 視覚化チャート */}
            {ledger.executionBudget && ledger.actualCost && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  予算vs実績 比較チャート
                </h2>
                <div className="space-y-6">
                  {/* 材料費 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">材料費</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-600">
                          予算: ¥{ledger.executionBudget.materialCost.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          実績: ¥{ledger.actualCost.materialCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-400 opacity-50 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.executionBudget.materialCost /
                              ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.actualCost.materialCost / ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* 労務費 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">労務費</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-600">
                          予算: ¥{ledger.executionBudget.laborCost.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          実績: ¥{ledger.actualCost.laborCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-400 opacity-50 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.executionBudget.laborCost / ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.actualCost.laborCost / ledger.executionBudget.totalBudget) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* 外注費 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">外注費</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-600">
                          予算: ¥{ledger.executionBudget.outsourcingCost.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          実績: ¥{ledger.actualCost.outsourcingCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-400 opacity-50 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.executionBudget.outsourcingCost /
                              ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.actualCost.outsourcingCost /
                              ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* 経費 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">経費</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-600">
                          予算: ¥{ledger.executionBudget.expenseCost.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          実績: ¥{ledger.actualCost.expenseCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-400 opacity-50 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.executionBudget.expenseCost /
                              ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded-lg transition-all"
                        style={{
                          width: `${Math.min(
                            (ledger.actualCost.expenseCost / ledger.executionBudget.totalBudget) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* 凡例 */}
                  <div className="flex gap-6 justify-center pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-400 opacity-50 rounded"></div>
                      <span className="text-sm text-gray-600">予算</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">実績</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 実行予算詳細 */}
            {ledger.executionBudget && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">実行予算</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">材料費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.executionBudget.materialCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">労務費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.executionBudget.laborCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">外注費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.executionBudget.outsourcingCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">経費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.executionBudget.expenseCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded">
                    <span className="font-semibold text-gray-900">予算合計</span>
                    <span className="font-bold text-blue-600 text-lg">
                      ¥{ledger.executionBudget.totalBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded">
                    <span className="font-semibold text-gray-900">予定粗利</span>
                    <span className="font-bold text-green-600 text-lg">
                      ¥{ledger.executionBudget.expectedProfit.toLocaleString()} (
                      {ledger.executionBudget.expectedProfitRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 実績原価詳細 */}
            {ledger.actualCost && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">実績原価</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">材料費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.actualCost.materialCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">労務費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.actualCost.laborCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">外注費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.actualCost.outsourcingCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">経費</span>
                    <span className="font-medium text-gray-900">
                      ¥{ledger.actualCost.expenseCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded">
                    <span className="font-semibold text-gray-900">実績合計</span>
                    <span className="font-bold text-green-600 text-lg">
                      ¥{ledger.actualCost.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-purple-50 px-4 rounded">
                    <span className="font-semibold text-gray-900">実績粗利</span>
                    <span className="font-bold text-purple-600 text-lg">
                      ¥{ledger.actualCost.actualProfit.toLocaleString()} (
                      {ledger.actualCost.actualProfitRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 原価差異分析 */}
            {ledger.costAnalysis && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">原価差異分析</h2>

                {/* 🔥 差異チャート */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-4">科目別差異（プラスが予算内、マイナスが予算超過）</div>
                  <div className="space-y-3">
                    {/* 材料費差異 */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">材料費</span>
                        <span className={`text-xs font-medium ${
                          ledger.costAnalysis.budgetVsActual.materialVariance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {ledger.costAnalysis.budgetVsActual.materialVariance >= 0 ? '+' : ''}
                          ¥{ledger.costAnalysis.budgetVsActual.materialVariance.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded">
                        <div
                          className={`absolute h-full rounded transition-all ${
                            ledger.costAnalysis.budgetVsActual.materialVariance >= 0
                              ? 'bg-green-500 left-1/2'
                              : 'bg-red-500 right-1/2'
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.abs(ledger.costAnalysis.budgetVsActual.materialVariance) /
                                (ledger.executionBudget?.totalBudget || 1) *
                                50,
                              50
                            )}%`,
                          }}
                        ></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
                      </div>
                    </div>

                    {/* 労務費差異 */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">労務費</span>
                        <span className={`text-xs font-medium ${
                          ledger.costAnalysis.budgetVsActual.laborVariance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {ledger.costAnalysis.budgetVsActual.laborVariance >= 0 ? '+' : ''}
                          ¥{ledger.costAnalysis.budgetVsActual.laborVariance.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded">
                        <div
                          className={`absolute h-full rounded transition-all ${
                            ledger.costAnalysis.budgetVsActual.laborVariance >= 0
                              ? 'bg-green-500 left-1/2'
                              : 'bg-red-500 right-1/2'
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.abs(ledger.costAnalysis.budgetVsActual.laborVariance) /
                                (ledger.executionBudget?.totalBudget || 1) *
                                50,
                              50
                            )}%`,
                          }}
                        ></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
                      </div>
                    </div>

                    {/* 外注費差異 */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">外注費</span>
                        <span className={`text-xs font-medium ${
                          ledger.costAnalysis.budgetVsActual.outsourcingVariance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {ledger.costAnalysis.budgetVsActual.outsourcingVariance >= 0 ? '+' : ''}
                          ¥{ledger.costAnalysis.budgetVsActual.outsourcingVariance.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded">
                        <div
                          className={`absolute h-full rounded transition-all ${
                            ledger.costAnalysis.budgetVsActual.outsourcingVariance >= 0
                              ? 'bg-green-500 left-1/2'
                              : 'bg-red-500 right-1/2'
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.abs(ledger.costAnalysis.budgetVsActual.outsourcingVariance) /
                                (ledger.executionBudget?.totalBudget || 1) *
                                50,
                              50
                            )}%`,
                          }}
                        ></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
                      </div>
                    </div>

                    {/* 経費差異 */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">経費</span>
                        <span className={`text-xs font-medium ${
                          ledger.costAnalysis.budgetVsActual.expenseVariance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {ledger.costAnalysis.budgetVsActual.expenseVariance >= 0 ? '+' : ''}
                          ¥{ledger.costAnalysis.budgetVsActual.expenseVariance.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded">
                        <div
                          className={`absolute h-full rounded transition-all ${
                            ledger.costAnalysis.budgetVsActual.expenseVariance >= 0
                              ? 'bg-green-500 left-1/2'
                              : 'bg-red-500 right-1/2'
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.abs(ledger.costAnalysis.budgetVsActual.expenseVariance) /
                                (ledger.executionBudget?.totalBudget || 1) *
                                50,
                              50
                            )}%`,
                          }}
                        ></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">材料費差異</span>
                    <span
                      className={`font-medium flex items-center gap-1 ${
                        ledger.costAnalysis.budgetVsActual.materialVariance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ledger.costAnalysis.budgetVsActual.materialVariance >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      ¥{Math.abs(ledger.costAnalysis.budgetVsActual.materialVariance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">労務費差異</span>
                    <span
                      className={`font-medium flex items-center gap-1 ${
                        ledger.costAnalysis.budgetVsActual.laborVariance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ledger.costAnalysis.budgetVsActual.laborVariance >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      ¥{Math.abs(ledger.costAnalysis.budgetVsActual.laborVariance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">外注費差異</span>
                    <span
                      className={`font-medium flex items-center gap-1 ${
                        ledger.costAnalysis.budgetVsActual.outsourcingVariance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ledger.costAnalysis.budgetVsActual.outsourcingVariance >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      ¥
                      {Math.abs(
                        ledger.costAnalysis.budgetVsActual.outsourcingVariance
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">経費差異</span>
                    <span
                      className={`font-medium flex items-center gap-1 ${
                        ledger.costAnalysis.budgetVsActual.expenseVariance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ledger.costAnalysis.budgetVsActual.expenseVariance >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      ¥{Math.abs(ledger.costAnalysis.budgetVsActual.expenseVariance).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center py-3 px-4 rounded ${
                      ledger.costAnalysis.budgetVsActual.totalVariance >= 0
                        ? 'bg-green-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">総差異</span>
                    <span
                      className={`font-bold text-lg flex items-center gap-2 ${
                        ledger.costAnalysis.budgetVsActual.totalVariance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ledger.costAnalysis.budgetVsActual.totalVariance >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      ¥{Math.abs(ledger.costAnalysis.budgetVsActual.totalVariance).toLocaleString()}{' '}
                      ({ledger.costAnalysis.budgetVsActual.varianceRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center py-3 px-4 rounded ${
                      ledger.costAnalysis.profitAnalysis.profitVariance >= 0
                        ? 'bg-green-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">粗利差異</span>
                    <span
                      className={`font-bold text-lg flex items-center gap-2 ${
                        ledger.costAnalysis.profitAnalysis.profitVariance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {ledger.costAnalysis.profitAnalysis.profitVariance >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      ¥{Math.abs(ledger.costAnalysis.profitAnalysis.profitVariance).toLocaleString()}{' '}
                      ({ledger.costAnalysis.profitAnalysis.profitVarianceRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 原価明細タブ */}
        {activeTab === 'cost-details' && <CostDetailsTab ledgerId={ledgerId} />}

        {/* 進捗管理タブ */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* 進捗状況 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                進捗状況
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">進捗率</span>
                    <span className="font-bold text-blue-600 text-xl">
                      {ledger.progress.progressRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${ledger.progress.progressRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-gray-600">出来高</label>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ¥{ledger.progress.completedWorkValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">請求済み金額</label>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ¥{ledger.progress.billedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">入金済み金額</label>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      ¥{ledger.progress.receivedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔥 工事タイムライン */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                工事タイムライン
              </h2>
              <div className="space-y-6">
                {/* タイムライン軸 */}
                <div className="relative">
                  {/* 横線 */}
                  <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200"></div>

                  {/* マイルストーン */}
                  <div className="relative grid grid-cols-4 gap-4">
                    {/* 予定開始 */}
                    <div className="relative">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md relative z-10"></div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-medium text-gray-900">予定開始</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {ledger.scheduledStartDate}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 実績開始 */}
                    <div className="relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-4 border-white shadow-md relative z-10 ${
                            ledger.actualStartDate ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        ></div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-medium text-gray-900">実績開始</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {ledger.actualStartDate || '未開始'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 現在 */}
                    <div className="relative">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 border-4 border-white shadow-md relative z-10 animate-pulse"></div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-medium text-gray-900">現在</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {new Date().toISOString().split('T')[0]}
                          </div>
                          <div className="text-xs font-bold text-blue-600 mt-1">
                            {ledger.progress.progressRate}%完了
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 予定完了 */}
                    <div className="relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-4 border-white shadow-md relative z-10 ${
                            ledger.actualEndDate
                              ? 'bg-green-500'
                              : ledger.progress.progressRate === 100
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}
                        ></div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-medium text-gray-900">
                            {ledger.actualEndDate ? '実績完了' : '予定完了'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {ledger.actualEndDate || ledger.scheduledEndDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 工期情報 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">予定工期</div>
                    <div className="text-lg font-bold text-blue-600">
                      {ledger.constructionDays}日間
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">経過日数</div>
                    <div className="text-lg font-bold text-green-600">
                      {ledger.actualStartDate
                        ? Math.floor(
                            (new Date().getTime() -
                              new Date(ledger.actualStartDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0}
                      日
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">残日数（予定）</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {Math.max(
                        0,
                        Math.floor(
                          (new Date(ledger.scheduledEndDate).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )}
                      日
                    </div>
                  </div>
                </div>

                {/* 進捗ステータス */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">工事ステータス</div>
                      <div className="text-base font-semibold text-gray-900 mt-1">
                        {ledger.status === 'planning'
                          ? '計画中'
                          : ledger.status === 'ongoing'
                          ? '施工中'
                          : ledger.status === 'completed'
                          ? '完了'
                          : ledger.status === 'suspended'
                          ? '中断'
                          : '不明'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">進捗状況</div>
                      <div className="text-base font-semibold text-blue-600 mt-1">
                        {ledger.progress.progressRate < 25
                          ? '着工初期'
                          : ledger.progress.progressRate < 50
                          ? '前半'
                          : ledger.progress.progressRate < 75
                          ? '中盤'
                          : ledger.progress.progressRate < 100
                          ? '終盤'
                          : '完工'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 統合ビュータブ */}
        {activeTab === 'integrated' && (
          <div className="space-y-6">
            {/* 見積・契約情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                見積・契約情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ledger.estimateId && (
                  <div>
                    <label className="text-sm text-gray-600">見積番号</label>
                    <p className="text-base font-medium text-gray-900 mt-1">{ledger.estimateNo}</p>
                    <button
                      onClick={() => router.push(`/estimates/${ledger.estimateId}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      見積詳細を見る →
                    </button>
                  </div>
                )}
                {ledger.contractId && (
                  <div>
                    <label className="text-sm text-gray-600">契約番号</label>
                    <p className="text-base font-medium text-gray-900 mt-1">{ledger.contractNo}</p>
                    <button
                      onClick={() => router.push(`/contracts/${ledger.contractId}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      契約詳細を見る →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 発注一覧 */}
            {ledger.orders && ledger.orders.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  発注一覧 ({ledger.orders.length}件)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          発注番号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          協力会社
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          発注金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ledger.orders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.partnerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{order.orderAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => router.push(`/orders/${order.orderId}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              詳細
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 請求一覧 */}
            {ledger.invoices && ledger.invoices.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  請求一覧 ({ledger.invoices.length}件)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          請求番号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          請求日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          請求金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ledger.invoices.map((invoice) => (
                        <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoiceNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.invoiceDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{invoice.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => router.push(`/invoices/${invoice.invoiceId}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              詳細
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
