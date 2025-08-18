'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  expenseService,
  type ExpenseReport,
  type Budget,
} from '@/services/expense.service';

export default function ExpenseDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [companyId] = useState('default-company');

  useEffect(() => {
    // ユーザー認証を待たずにモックデータを表示
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startDate, endDate;

      switch (selectedPeriod) {
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'current_quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
          break;
        case 'current_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // モックデータを使用
      const mockReport: ExpenseReport = {
        summary: {
          totalAmount: 2850000,
          totalExpenses: 45,
          approvedAmount: 2100000,
          pendingAmount: 550000,
          byStatus: {
            approved: 30,
            pending: 10,
            rejected: 5,
          },
          byCategory: {
            材料費: 850000,
            人件費: 1200000,
            交通費: 250000,
            広告費: 350000,
            その他: 200000,
          },
        },
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        expenses: [],
      };

      const mockBudgets: Budget[] = [
        {
          id: '1',
          companyId: companyId,
          category: {
            id: '1',
            name: '材料費',
            companyId: companyId,
            code: 'MAT',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
          amount: 1000000,
          year: now.getFullYear().toString(),
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          companyId: companyId,
          category: {
            id: '2',
            name: '人件費',
            companyId: companyId,
            code: 'LAB',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
          amount: 1500000,
          year: now.getFullYear().toString(),
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          companyId: companyId,
          category: {
            id: '3',
            name: '交通費',
            companyId: companyId,
            code: 'TRA',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
          amount: 300000,
          year: now.getFullYear().toString(),
          createdAt: '',
          updatedAt: '',
        },
      ];

      const mockAnalytics = {
        trends: {
          monthly: [2100000, 2450000, 2850000],
          quarterly: [6800000, 7200000, 7850000],
        },
        topCategories: [
          { name: '人件費', amount: 1200000 },
          { name: '材料費', amount: 850000 },
          { name: '広告費', amount: 350000 },
        ],
        costEfficiency: 82.5,
      };

      setReport(mockReport);
      setBudgets(mockBudgets);
      setAnalytics(mockAnalytics);
      setError(null);
    } catch (err) {
      setError('ダッシュボードデータの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const labels = {
      current_month: '今月',
      last_month: '先月',
      current_quarter: '今四半期',
      current_year: '今年度',
    };
    return labels[selectedPeriod as keyof typeof labels] || '今月';
  };

  const calculateBudgetProgress = (budget: Budget) => {
    if (!report) return 0;

    const categoryExpenses = Object.entries(report.summary.byCategory).find(
      ([categoryName]) => categoryName === budget.category.name,
    );

    const spent = categoryExpenses ? categoryExpenses[1] : 0;
    const progress = (spent / Number(budget.amount)) * 100;

    return Math.min(progress, 100);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/expenses')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 経費管理
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              経費ダッシュボード
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current_month">今月</option>
              <option value="last_month">先月</option>
              <option value="current_quarter">今四半期</option>
              <option value="current_year">今年度</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Period Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {getPeriodLabel()}の経費状況
          </h2>
          {report && (
            <p className="text-sm text-gray-600">
              期間: {new Date(report.period.start).toLocaleDateString('ja-JP')}{' '}
              - {new Date(report.period.end).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  総経費額
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  ¥{report.summary.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {report.summary.totalExpenses}件の経費
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  承認済み
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ¥{report.summary.approvedAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {Math.round(
                    (report.summary.approvedAmount /
                      report.summary.totalAmount) *
                      100,
                  )}
                  %
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  申請中
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{report.summary.pendingAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.entries(report.summary.byStatus).find(
                    ([status]) => status === 'submitted',
                  )?.[1] || 0}
                  件
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  平均経費額
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  ¥
                  {Math.round(
                    report.summary.totalAmount / report.summary.totalExpenses,
                  ).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">1件あたり</p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">ステータス別経費</h3>
                <div className="space-y-3">
                  {Object.entries(report.summary.byStatus).map(
                    ([status, count]) => {
                      const statusLabels = {
                        draft: '下書き',
                        submitted: '申請中',
                        approved: '承認済み',
                        rejected: '却下',
                        paid: '支払済み',
                      };

                      const percentage = Math.round(
                        (Number(count) / report.summary.totalExpenses) * 100,
                      );

                      return (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {statusLabels[
                              status as keyof typeof statusLabels
                            ] || status}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {count}件
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">カテゴリ別経費</h3>
                <div className="space-y-3">
                  {Object.entries(report.summary.byCategory)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 5)
                    .map(([category, amount]) => {
                      const percentage = Math.round(
                        (Number(amount) / report.summary.totalAmount) * 100,
                      );

                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {category}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-16">
                              ¥{Number(amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Budget Progress */}
            {budgets.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-semibold mb-4">予算進捗</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.map((budget) => {
                    const progress = calculateBudgetProgress(budget);
                    const spent =
                      Object.entries(report.summary.byCategory).find(
                        ([categoryName]) =>
                          categoryName === budget.category.name,
                      )?.[1] || 0;

                    const isOverBudget = progress > 100;

                    return (
                      <div key={budget.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {budget.category.name}
                        </h4>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>¥{Number(spent).toLocaleString()}</span>
                            <span>
                              ¥{Number(budget.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isOverBudget ? 'bg-red-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm font-medium ${
                              isOverBudget ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            {progress.toFixed(1)}%
                          </span>
                          {isOverBudget && (
                            <span className="text-xs text-red-600 font-medium">
                              予算超過
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trend Analysis */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-semibold mb-4">📈 トレンド分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    月別経費推移
                  </h4>
                  <div className="space-y-2">
                    {[3, 2, 1, 0].map((monthsAgo) => {
                      const monthNames = ['今月', '先月', '2ヶ月前', '3ヶ月前'];
                      const amounts = [
                        report?.summary.totalAmount || 0,
                        1850000,
                        1920000,
                        1750000,
                      ];
                      const month = monthNames[monthsAgo];
                      const amount = amounts[monthsAgo];
                      const maxAmount = Math.max(...amounts);

                      return (
                        <div
                          key={monthsAgo}
                          className="flex items-center space-x-3"
                        >
                          <span className="text-sm text-gray-600 w-16">
                            {month}
                          </span>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-6 relative">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{
                                  width: `${(amount / maxAmount) * 100}%`,
                                }}
                              >
                                <span className="text-xs text-white font-medium">
                                  ¥{(amount / 1000000).toFixed(1)}M
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Department Comparison */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    部門別経費比較
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: '営業部', amount: 850000, budget: 1000000 },
                      {
                        name: 'マーケティング部',
                        amount: 650000,
                        budget: 800000,
                      },
                      { name: '管理部', amount: 450000, budget: 500000 },
                      { name: '開発部', amount: 320000, budget: 400000 },
                    ].map((dept) => {
                      const percentage = (dept.amount / dept.budget) * 100;

                      return (
                        <div
                          key={dept.name}
                          className="flex items-center space-x-3"
                        >
                          <span className="text-sm text-gray-600 w-24">
                            {dept.name}
                          </span>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-6 relative">
                              <div
                                className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                                  percentage > 90
                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                    : percentage > 70
                                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                      : 'bg-gradient-to-r from-green-500 to-green-600'
                                }`}
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              >
                                <span className="text-xs text-white font-medium">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            ¥{(dept.amount / 1000).toFixed(0)}K
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Reduction Insights */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg shadow mb-8 border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-800">
                💡 コスト削減の機会
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      交通費最適化
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      高
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    ¥125K
                  </p>
                  <p className="text-xs text-gray-600">月間削減可能額</p>
                  <p className="text-xs text-gray-500 mt-2">
                    タクシー利用を公共交通機関に切り替え
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      会議費削減
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      中
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mb-1">
                    ¥85K
                  </p>
                  <p className="text-xs text-gray-600">月間削減可能額</p>
                  <p className="text-xs text-gray-500 mt-2">
                    オンライン会議の活用推進
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      消耗品管理
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      低
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-1">¥45K</p>
                  <p className="text-xs text-gray-600">月間削減可能額</p>
                  <p className="text-xs text-gray-500 mt-2">
                    一括購入による単価削減
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">
                    💰 合計削減可能額: ¥255K/月
                  </span>
                  <span className="ml-2">（年間 ¥3.06M）</span>
                </p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow mb-8 border border-purple-200">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">
                🤖 AI経費分析インサイト
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-start">
                    <span className="text-xl mr-3">⚠️</span>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        異常検知アラート
                      </h4>
                      <p className="text-sm text-gray-600">
                        今月の交際費が前月比150%増加しています。承認フローの確認を推奨します。
                      </p>
                      <button className="text-xs text-purple-600 hover:text-purple-800 mt-2">
                        詳細を確認 →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start">
                    <span className="text-xl mr-3">📊</span>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        支出パターン分析
                      </h4>
                      <p className="text-sm text-gray-600">
                        毎月第3週に経費申請が集中しています。承認業務の効率化を検討してください。
                      </p>
                      <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
                        分析詳細 →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start">
                    <span className="text-xl mr-3">✅</span>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        最適化提案
                      </h4>
                      <p className="text-sm text-gray-600">
                        定期的な支払いを一括契約に変更することで、年間¥480K削減可能です。
                      </p>
                      <button className="text-xs text-green-600 hover:text-green-800 mt-2">
                        提案を見る →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/expenses')}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-left"
              >
                <div className="text-blue-600 text-2xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-900 mb-1">経費申請</h3>
                <p className="text-sm text-gray-600">新しい経費を申請する</p>
              </button>

              <button
                onClick={() => router.push('/expenses/reports')}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-left"
              >
                <div className="text-green-600 text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  詳細レポート
                </h3>
                <p className="text-sm text-gray-600">
                  詳細な経費レポートを確認
                </p>
              </button>

              <button
                onClick={() => router.push('/expenses/budget')}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-left"
              >
                <div className="text-purple-600 text-2xl mb-2">💰</div>
                <h3 className="font-semibold text-gray-900 mb-1">予算管理</h3>
                <p className="text-sm text-gray-600">予算設定と管理</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
