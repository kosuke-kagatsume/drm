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
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'progress' | 'integrated'>(
    'overview'
  );

  useEffect(() => {
    if (ledgerId) {
      fetchLedger();
    }
  }, [ledgerId]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/construction-ledgers?id=${ledgerId}`);
      const data = await response.json();

      if (data.success && data.ledger) {
        setLedger(data.ledger);
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
          </div>
        )}

        {/* 予算・原価タブ */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
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
