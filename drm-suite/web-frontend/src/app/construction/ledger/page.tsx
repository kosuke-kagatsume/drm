'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Eye,
  BarChart3,
  Calculator,
  Package,
  Users,
  Truck,
  Receipt,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  constructionLedgerService,
  ConstructionLedger,
  ProfitAnalysis,
  CostVarianceReport,
} from '@/services/construction-ledger.service';
import { dwIntegrationService } from '@/services/dw-integration.service';

export default function ConstructionLedgerPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [ledgers, setLedgers] = useState<ConstructionLedger[]>([]);
  const [selectedLedger, setSelectedLedger] =
    useState<ConstructionLedger | null>(null);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis | null>(
    null,
  );
  const [costVariance, setCostVariance] = useState<CostVarianceReport[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      loadLedgers();
    }
  }, [user, isLoading]);

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const ledgerData = await constructionLedgerService.getLedgers();
      setLedgers(ledgerData);
    } catch (error) {
      console.error('Failed to load ledgers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerSelect = async (ledger: ConstructionLedger) => {
    setSelectedLedger(ledger);

    // 収益性分析とコスト差異分析を読み込み
    const [profit, variance] = await Promise.all([
      constructionLedgerService.analyzeProfitability(ledger.contractId),
      constructionLedgerService.analyzeCostVariance(ledger.contractId),
    ]);

    setProfitAnalysis(profit);
    setCostVariance(variance);
  };

  const handleSyncWithDW = async (contractId: string) => {
    setLoading(true);
    try {
      await constructionLedgerService.syncWithDWOrders(contractId);
      await loadLedgers();

      // 選択中の台帳を再読み込み
      if (selectedLedger && selectedLedger.contractId === contractId) {
        const updatedLedger =
          await constructionLedgerService.getLedgerByContract(contractId);
        if (updatedLedger) {
          await handleLedgerSelect(updatedLedger);
        }
      }

      alert('DWとの同期が完了しました');
    } catch (error) {
      console.error('Failed to sync with DW:', error);
      alert('DWとの同期に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { label: '計画中', color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: '施工中', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '完成', color: 'bg-green-100 text-green-800' },
      suspended: { label: '中断', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: '中止', color: 'bg-red-100 text-red-800' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.planning;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <ArrowDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-dandori-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  工事台帳管理
                </h1>
                <p className="text-gray-600 mt-1">
                  建設業法準拠の工事台帳・原価管理
                </p>
              </div>
            </div>
            <button
              onClick={loadLedgers}
              disabled={loading}
              className="bg-dandori-blue text-white px-4 py-2 rounded-lg hover:bg-dandori-blue-dark disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>更新</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 工事台帳一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  工事台帳一覧
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {ledgers.map((ledger) => (
                  <div
                    key={ledger.id}
                    onClick={() => handleLedgerSelect(ledger)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedLedger?.id === ledger.id
                        ? 'bg-blue-50 border-l-4 border-l-dandori-blue'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {ledger.projectName}
                      </h3>
                      {getStatusBadge(ledger.status)}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>契約額</span>
                        <span className="font-medium">
                          {formatCurrency(ledger.contractAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>進捗率</span>
                        <span className="font-medium">
                          {ledger.progressRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>実績原価</span>
                        <span className="font-medium">
                          {formatCurrency(ledger.actualCosts.total)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="bg-gray-200 rounded-full h-1.5 w-24">
                        <div
                          className="bg-dandori-blue rounded-full h-1.5"
                          style={{
                            width: `${Math.min(ledger.progressRate, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncWithDW(ledger.contractId);
                        }}
                        className="text-xs text-dandori-blue hover:text-dandori-blue-dark flex items-center space-x-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>DW同期</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 詳細表示エリア */}
          <div className="lg:col-span-2">
            {selectedLedger ? (
              <div className="space-y-6">
                {/* 基本情報 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedLedger.projectName}
                      </h2>
                      {getStatusBadge(selectedLedger.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">契約額</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(selectedLedger.contractAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">進捗率</p>
                        <p className="text-2xl font-bold text-dandori-blue">
                          {selectedLedger.progressRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">出来高</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedLedger.earnedValue)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">工期</p>
                        <p className="font-medium">
                          {selectedLedger.startDate} 〜{' '}
                          {selectedLedger.plannedEndDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">現場代理人</p>
                        <p className="font-medium">
                          {selectedLedger.projectManager}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* タブナビゲーション */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {[
                        { id: 'overview', label: '概要', icon: BarChart3 },
                        { id: 'costs', label: '原価管理', icon: Calculator },
                        { id: 'milestones', label: '工程管理', icon: Calendar },
                        { id: 'billing', label: '請求履歴', icon: Receipt },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-dandori-blue text-dandori-blue'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <tab.icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* 概要タブ */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* 収益性分析 */}
                        {profitAnalysis && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              収益性分析
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600">
                                    予算利益
                                  </span>
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatCurrency(
                                      profitAnalysis.budgetProfit,
                                    )}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  利益率:{' '}
                                  {profitAnalysis.profitMarginBudget.toFixed(1)}
                                  %
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600">
                                    実際利益
                                  </span>
                                  <span
                                    className={`text-lg font-bold ${
                                      profitAnalysis.actualProfit >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {formatCurrency(
                                      profitAnalysis.actualProfit,
                                    )}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  利益率:{' '}
                                  {profitAnalysis.profitMarginActual.toFixed(1)}
                                  %
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* コスト差異分析 */}
                        {costVariance.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              コスト差異分析
                            </h3>
                            <div className="space-y-2">
                              {costVariance.map((variance, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    {getVarianceIcon(variance.variance)}
                                    <span className="font-medium text-gray-900">
                                      {variance.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="text-gray-600">
                                      予算:{' '}
                                      {formatCurrency(variance.budgetAmount)}
                                    </span>
                                    <span className="text-gray-600">
                                      実績:{' '}
                                      {formatCurrency(variance.actualAmount)}
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        variance.variance > 0
                                          ? 'text-red-600'
                                          : variance.variance < 0
                                            ? 'text-green-600'
                                            : 'text-gray-600'
                                      }`}
                                    >
                                      {variance.variance > 0 ? '+' : ''}
                                      {formatCurrency(variance.variance)}(
                                      {variance.variancePercent > 0 ? '+' : ''}
                                      {variance.variancePercent.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 原価管理タブ */}
                    {activeTab === 'costs' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          原価内訳
                        </h3>
                        <div className="space-y-4">
                          {selectedLedger.costEntries.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      日付
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      分類
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      内容
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                      金額
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      仕入先
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {selectedLedger.costEntries
                                    .slice(0, 10)
                                    .map((entry) => (
                                      <tr
                                        key={entry.id}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          {entry.date}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          {entry.category}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          {entry.description}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                                          {formatCurrency(entry.amount)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">
                                          {entry.supplier || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>原価データがありません</p>
                              <p className="text-sm">
                                DWとの同期を実行してください
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 工程管理タブ */}
                    {activeTab === 'milestones' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          工程表
                        </h3>
                        <div className="space-y-3">
                          {selectedLedger.milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-shrink-0">
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : milestone.status === 'in_progress' ? (
                                  <Clock className="h-6 w-6 text-blue-500" />
                                ) : milestone.status === 'delayed' ? (
                                  <AlertTriangle className="h-6 w-6 text-red-500" />
                                ) : (
                                  <Clock className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-900">
                                  {milestone.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {milestone.description}
                                </p>
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                <div>予定: {milestone.plannedDate}</div>
                                {milestone.actualDate && (
                                  <div className="text-green-600">
                                    完了: {milestone.actualDate}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 請求履歴タブ */}
                    {activeTab === 'billing' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          請求履歴
                        </h3>
                        <div className="space-y-3">
                          {selectedLedger.billingHistory.length > 0 ? (
                            selectedLedger.billingHistory.map((billing) => (
                              <div
                                key={billing.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {billing.billingType}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    請求日: {billing.billingDate}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    進捗時: {billing.progressAtBilling}%
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">
                                    {formatCurrency(billing.billingAmount)}
                                  </p>
                                  {billing.paidDate ? (
                                    <p className="text-sm text-green-600">
                                      入金済: {billing.paidDate}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      未入金
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>請求履歴がありません</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center text-gray-500">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    工事台帳を選択してください
                  </h3>
                  <p>左側の一覧から工事台帳を選択すると詳細が表示されます</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
