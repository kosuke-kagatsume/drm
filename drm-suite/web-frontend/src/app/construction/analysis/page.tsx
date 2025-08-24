'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  Users,
  Truck,
  Calculator,
  RefreshCw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import {
  constructionLedgerService,
  ConstructionLedger,
  ProfitAnalysis,
  CostVarianceReport,
} from '@/services/construction-ledger.service';

// Chart.jsのインポート（動的インポート）
import dynamic from 'next/dynamic';

const Chart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Chart),
  {
    ssr: false,
  },
);

// Chart.jsの設定をクライアントサイドでのみ実行
if (typeof window !== 'undefined') {
  import('chart.js/auto');
}

export default function ConstructionAnalysisPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [ledgers, setLedgers] = useState<ConstructionLedger[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current'); // current, 3months, 6months, 1year
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      loadAnalysisData();
    }
  }, [user, isLoading, selectedPeriod]);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      const ledgerData = await constructionLedgerService.getLedgers();
      setLedgers(ledgerData);

      // 分析データの生成
      const analysis = await generateAnalysisData(ledgerData);
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysisData = async (ledgerData: ConstructionLedger[]) => {
    const totalProjects = ledgerData.length;
    const activeProjects = ledgerData.filter(
      (l) => l.status === 'in_progress',
    ).length;
    const completedProjects = ledgerData.filter(
      (l) => l.status === 'completed',
    ).length;

    // 全体の原価分析
    let totalBudgetCost = 0;
    let totalActualCost = 0;
    let totalContractAmount = 0;

    const categoryTotals = {
      materialCost: { budget: 0, actual: 0 },
      laborCost: { budget: 0, actual: 0 },
      subcontractCost: { budget: 0, actual: 0 },
      expenseCost: { budget: 0, actual: 0 },
      overhead: { budget: 0, actual: 0 },
    };

    const projectAnalyses = [];

    for (const ledger of ledgerData) {
      const profitAnalysis =
        await constructionLedgerService.analyzeProfitability(ledger.contractId);
      if (profitAnalysis) {
        totalBudgetCost += profitAnalysis.totalBudgetCost;
        totalActualCost += profitAnalysis.totalActualCost;
        totalContractAmount += profitAnalysis.contractAmount;

        // カテゴリ別集計
        categoryTotals.materialCost.budget +=
          ledger.budgetBreakdown.materialCost;
        categoryTotals.materialCost.actual += ledger.actualCosts.materialCost;
        categoryTotals.laborCost.budget += ledger.budgetBreakdown.laborCost;
        categoryTotals.laborCost.actual += ledger.actualCosts.laborCost;
        categoryTotals.subcontractCost.budget +=
          ledger.budgetBreakdown.subcontractCost;
        categoryTotals.subcontractCost.actual +=
          ledger.actualCosts.subcontractCost;
        categoryTotals.expenseCost.budget += ledger.budgetBreakdown.expenseCost;
        categoryTotals.expenseCost.actual += ledger.actualCosts.expenseCost;
        categoryTotals.overhead.budget += ledger.budgetBreakdown.overhead;
        categoryTotals.overhead.actual += ledger.actualCosts.overhead;

        projectAnalyses.push({
          ...ledger,
          profitAnalysis,
        });
      }
    }

    // 月別分析データ
    const monthlyData = generateMonthlyData(ledgerData);

    // 原価差異分析
    const varianceAnalysis = Object.entries(categoryTotals).map(
      ([key, values]) => ({
        category: getCategoryName(key),
        budgetAmount: values.budget,
        actualAmount: values.actual,
        variance: values.actual - values.budget,
        variancePercent:
          values.budget > 0
            ? ((values.actual - values.budget) / values.budget) * 100
            : 0,
      }),
    );

    return {
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalContractAmount,
        totalBudgetCost,
        totalActualCost,
        totalProfit: totalContractAmount - totalActualCost,
        averageProfitMargin:
          totalContractAmount > 0
            ? ((totalContractAmount - totalActualCost) / totalContractAmount) *
              100
            : 0,
        costOverrun: totalActualCost - totalBudgetCost,
        costOverrunPercent:
          totalBudgetCost > 0
            ? ((totalActualCost - totalBudgetCost) / totalBudgetCost) * 100
            : 0,
      },
      categoryTotals,
      varianceAnalysis,
      monthlyData,
      projectAnalyses,
    };
  };

  const generateMonthlyData = (ledgerData: ConstructionLedger[]) => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      months.push({
        month: monthKey,
        label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
        revenue: 0,
        cost: 0,
        profit: 0,
      });
    }

    // 実際のデータをマッピング（簡略化）
    return months;
  };

  const getCategoryName = (key: string) => {
    const names: { [key: string]: string } = {
      materialCost: '材料費',
      laborCost: '労務費',
      subcontractCost: '外注費',
      expenseCost: '経費',
      overhead: '諸経費',
    };
    return names[key] || key;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  // チャートデータの生成
  const getCostComparisonChartData = () => {
    if (!analysisData) return null;

    return {
      labels: ['材料費', '労務費', '外注費', '経費', '諸経費'],
      datasets: [
        {
          label: '予算原価',
          data: [
            analysisData.categoryTotals.materialCost.budget,
            analysisData.categoryTotals.laborCost.budget,
            analysisData.categoryTotals.subcontractCost.budget,
            analysisData.categoryTotals.expenseCost.budget,
            analysisData.categoryTotals.overhead.budget,
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: '実際原価',
          data: [
            analysisData.categoryTotals.materialCost.actual,
            analysisData.categoryTotals.laborCost.actual,
            analysisData.categoryTotals.subcontractCost.actual,
            analysisData.categoryTotals.expenseCost.actual,
            analysisData.categoryTotals.overhead.actual,
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
        },
      ],
    };
  };

  const getProfitTrendChartData = () => {
    if (!analysisData) return null;

    return {
      labels: analysisData.monthlyData.map((d: any) => d.label),
      datasets: [
        {
          label: '売上',
          data: analysisData.monthlyData.map((d: any) => d.revenue),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
        },
        {
          label: '原価',
          data: analysisData.monthlyData.map((d: any) => d.cost),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
        },
        {
          label: '利益',
          data: analysisData.monthlyData.map((d: any) => d.profit),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
        },
      ],
    };
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
              <BarChart3 className="h-8 w-8 text-dandori-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  原価分析・収益性管理
                </h1>
                <p className="text-gray-600 mt-1">
                  予算原価vs実際原価の詳細分析
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="current">現在進行中</option>
                <option value="3months">3ヶ月間</option>
                <option value="6months">6ヶ月間</option>
                <option value="1year">1年間</option>
              </select>
              <button
                onClick={loadAnalysisData}
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
        </div>

        {analysisData && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      総契約額
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analysisData.summary.totalContractAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calculator className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      実際原価
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analysisData.summary.totalActualCost)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {analysisData.summary.totalProfit >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総利益</p>
                    <p
                      className={`text-2xl font-bold ${
                        analysisData.summary.totalProfit >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(analysisData.summary.totalProfit)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {analysisData.summary.costOverrun <= 0 ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      原価差異
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        analysisData.summary.costOverrun <= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {analysisData.summary.costOverrun > 0 ? '+' : ''}
                      {formatCurrency(analysisData.summary.costOverrun)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({analysisData.summary.costOverrunPercent > 0 ? '+' : ''}
                      {analysisData.summary.costOverrunPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 原価比較チャート */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    予算vs実際原価比較
                  </h2>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-80">
                  {getCostComparisonChartData() && (
                    <Chart
                      type="bar"
                      data={getCostComparisonChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value: any) {
                                return `¥${value.toLocaleString()}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              {/* 月別推移チャート */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    月別推移
                  </h2>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-80">
                  {getProfitTrendChartData() && (
                    <Chart
                      type="line"
                      data={getProfitTrendChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value: any) {
                                return `¥${value.toLocaleString()}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 詳細分析テーブル */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  カテゴリ別原価差異分析
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        カテゴリ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        予算原価
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        実際原価
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        差異
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        差異率
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysisData.varianceAnalysis.map(
                      (item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {item.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(item.budgetAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(item.actualAmount)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                              item.variance > 0
                                ? 'text-red-600'
                                : item.variance < 0
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {item.variance > 0 ? '+' : ''}
                            {formatCurrency(item.variance)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                              item.variancePercent > 0
                                ? 'text-red-600'
                                : item.variancePercent < 0
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {item.variancePercent > 0 ? '+' : ''}
                            {item.variancePercent.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {item.variance > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                予算超過
                              </span>
                            ) : item.variance < 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                予算内
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                予算通り
                              </span>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
