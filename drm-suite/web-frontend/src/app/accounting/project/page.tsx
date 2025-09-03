'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calculator,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  accountingChartService,
  ChartOfAccount,
  ProfitAnalysisByAccount,
  BudgetAllocation,
} from '@/services/accounting-chart.service';
import {
  constructionLedgerService,
  ConstructionLedger,
} from '@/services/construction-ledger.service';

// Chart.jsの動的インポート
import dynamic from 'next/dynamic';

const Chart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Chart),
  {
    ssr: false,
  },
);

if (typeof window !== 'undefined') {
  import('chart.js/auto');
}

interface ProjectFinancialSummary {
  projectId: string;
  projectName: string;
  contractAmount: number;
  budgetCost: number;
  actualCost: number;
  grossProfit: number;
  grossProfitMargin: number;
  progressRate: number;
  status: 'planning' | 'in_progress' | 'completed';

  // 勘定科目別内訳
  accountBreakdown: {
    accountId: string;
    accountName: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    variancePercent: number;
  }[];
}

function ProjectAccountingPageContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<ConstructionLedger[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [financialSummaries, setFinancialSummaries] = useState<
    ProjectFinancialSummary[]
  >([]);
  const [profitAnalyses, setProfitAnalyses] = useState<
    ProfitAnalysisByAccount[]
  >([]);
  const [projectSpecificAccounts, setProjectSpecificAccounts] = useState<
    ChartOfAccount[]
  >([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current'); // current, quarter, year
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      loadData();
    }
  }, [user, isLoading]);

  useEffect(() => {
    // URLパラメータから初期選択を設定
    const accountParam = searchParams?.get('account');
    if (accountParam) {
      setSelectedAccount(accountParam);
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      // プロジェクト一覧取得
      const projectData = await constructionLedgerService.getLedgers();
      setProjects(projectData);

      // プロジェクト別管理対象勘定科目取得
      const accounts =
        await accountingChartService.getProjectSpecificAccounts();
      setProjectSpecificAccounts(accounts);

      // 財務サマリー生成
      const summaries = await generateFinancialSummaries(projectData, accounts);
      setFinancialSummaries(summaries);

      // 収益性分析データ生成
      if (selectedProject !== 'all') {
        const analyses =
          await accountingChartService.calculateProjectProfitLoss(
            selectedProject,
          );
        setProfitAnalyses(analyses);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialSummaries = async (
    projectData: ConstructionLedger[],
    accounts: ChartOfAccount[],
  ): Promise<ProjectFinancialSummary[]> => {
    const summaries: ProjectFinancialSummary[] = [];

    for (const project of projectData) {
      const budgetCost =
        Object.values(project.budgetBreakdown).reduce(
          (sum, cost) => sum + cost,
          0,
        ) - project.budgetBreakdown.profit;
      const actualCost = project.actualCosts.total;
      const grossProfit = project.contractAmount - actualCost;
      const grossProfitMargin =
        project.contractAmount > 0
          ? (grossProfit / project.contractAmount) * 100
          : 0;

      // 勘定科目別内訳を生成
      const accountBreakdown = accounts.map((account) => {
        const budgetAmount = getBudgetAmountForAccount(project, account);
        const actualAmount = getActualAmountForAccount(project, account);
        const variance = actualAmount - budgetAmount;
        const variancePercent =
          budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

        return {
          accountId: account.id,
          accountName: account.name,
          budgetAmount,
          actualAmount,
          variance,
          variancePercent,
        };
      });

      summaries.push({
        projectId: project.contractId,
        projectName: project.projectName,
        contractAmount: project.contractAmount,
        budgetCost,
        actualCost,
        grossProfit,
        grossProfitMargin,
        progressRate: project.progressRate,
        status: project.status as any,
        accountBreakdown,
      });
    }

    return summaries;
  };

  const getBudgetAmountForAccount = (
    project: ConstructionLedger,
    account: ChartOfAccount,
  ): number => {
    // 勘定科目に応じて予算額を返す
    switch (account.code) {
      case '501':
        return project.budgetBreakdown.materialCost;
      case '502':
        return project.budgetBreakdown.laborCost;
      case '503':
        return project.budgetBreakdown.subcontractCost;
      case '504':
        return project.budgetBreakdown.expenseCost;
      default:
        return Math.random() * 1000000; // サンプル値
    }
  };

  const getActualAmountForAccount = (
    project: ConstructionLedger,
    account: ChartOfAccount,
  ): number => {
    // 勘定科目に応じて実績額を返す
    switch (account.code) {
      case '501':
        return project.actualCosts.materialCost;
      case '502':
        return project.actualCosts.laborCost;
      case '503':
        return project.actualCosts.subcontractCost;
      case '504':
        return project.actualCosts.expenseCost;
      default:
        return Math.random() * 1200000; // サンプル値
    }
  };

  const filteredSummaries =
    selectedProject === 'all'
      ? financialSummaries
      : financialSummaries.filter(
          (summary) => summary.projectId === selectedProject,
        );

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <ArrowDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { label: '計画中', color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: '施工中', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '完成', color: 'bg-green-100 text-green-800' },
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

  // チャートデータ生成
  const getProfitMarginChartData = () => {
    return {
      labels: filteredSummaries.map((s) => s.projectName),
      datasets: [
        {
          label: '粗利率 (%)',
          data: filteredSummaries.map((s) => s.grossProfitMargin),
          backgroundColor: filteredSummaries.map((s) =>
            s.grossProfitMargin >= 20
              ? 'rgba(34, 197, 94, 0.8)'
              : s.grossProfitMargin >= 10
                ? 'rgba(234, 179, 8, 0.8)'
                : 'rgba(239, 68, 68, 0.8)',
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const getBudgetVarianceChartData = () => {
    if (selectedAccount === 'all') return null;

    const accountData = filteredSummaries.map((summary) => {
      const accountBreakdown = summary.accountBreakdown.find(
        (a) => a.accountId === selectedAccount,
      );
      return {
        project: summary.projectName,
        budget: accountBreakdown?.budgetAmount || 0,
        actual: accountBreakdown?.actualAmount || 0,
        variance: accountBreakdown?.variance || 0,
      };
    });

    return {
      labels: accountData.map((d) => d.project),
      datasets: [
        {
          label: '予算',
          data: accountData.map((d) => d.budget),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: '実績',
          data: accountData.map((d) => d.actual),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
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

  const totalContractAmount = filteredSummaries.reduce(
    (sum, s) => sum + s.contractAmount,
    0,
  );
  const totalActualCost = filteredSummaries.reduce(
    (sum, s) => sum + s.actualCost,
    0,
  );
  const totalGrossProfit = totalContractAmount - totalActualCost;
  const averageProfitMargin =
    totalContractAmount > 0
      ? (totalGrossProfit / totalContractAmount) * 100
      : 0;

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
                  プロジェクト別管理会計
                </h1>
                <p className="text-gray-600 mt-1">
                  工事別収益性・勘定科目別分析
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/accounting/chart')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <Calculator className="h-4 w-4" />
                <span>勘定科目管理</span>
              </button>
              <button
                onClick={loadData}
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

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総契約額</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalContractAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総実績原価</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalActualCost)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総粗利益</p>
                <p
                  className={`text-2xl font-bold ${totalGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(totalGrossProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均粗利率</p>
                <p
                  className={`text-2xl font-bold ${averageProfitMargin >= 15 ? 'text-green-600' : averageProfitMargin >= 5 ? 'text-yellow-600' : 'text-red-600'}`}
                >
                  {averageProfitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">全プロジェクト</option>
                {projects.map((project) => (
                  <option key={project.contractId} value={project.contractId}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勘定科目
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">全勘定科目</option>
                {projectSpecificAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="current">当期</option>
                <option value="quarter">四半期</option>
                <option value="year">年間</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  /* レポート出力処理 */
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>レポート出力</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* プロジェクト別粗利率チャート */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                プロジェクト別粗利率
              </h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-80">
              {getProfitMarginChartData() && (
                <Chart
                  type="bar"
                  data={getProfitMarginChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value: any) {
                            return value + '%';
                          },
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* 予算vs実績チャート */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedAccount === 'all'
                  ? '予算vs実績'
                  : `${projectSpecificAccounts.find((a) => a.id === selectedAccount)?.name || ''} - 予算vs実績`}
              </h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-80">
              {getBudgetVarianceChartData() ? (
                <Chart
                  type="bar"
                  data={getBudgetVarianceChartData()}
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
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>勘定科目を選択してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* プロジェクト詳細テーブル */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              プロジェクト別財務詳細
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロジェクト
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    契約額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実績原価
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    粗利益
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    粗利率
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗率
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSummaries.map((summary) => (
                  <tr key={summary.projectId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {summary.projectName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {summary.projectId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(summary.contractAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(summary.actualCost)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        summary.grossProfit >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(summary.grossProfit)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        summary.grossProfitMargin >= 20
                          ? 'text-green-600'
                          : summary.grossProfitMargin >= 10
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {summary.grossProfitMargin.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-dandori-blue h-2 rounded-full"
                            style={{
                              width: `${Math.min(summary.progressRate, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">{summary.progressRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(summary.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(
                            `/construction/ledger?project=${summary.projectId}`,
                          )
                        }
                        className="text-dandori-blue hover:text-dandori-blue-dark mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/accounting/analysis/${summary.projectId}`,
                          )
                        }
                        className="text-green-600 hover:text-green-500"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectAccountingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectAccountingPageContent />
    </Suspense>
  );
}
