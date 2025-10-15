'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  expenseService,
  type ExpenseReport,
  type Budget,
} from '@/services/expense.service';

export default function DarkExpenseDashboardContent() {
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
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user, selectedPeriod]);

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

      const [reportResponse, budgetsResponse, analyticsResponse] =
        await Promise.all([
          expenseService.getExpenseReport(
            companyId,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
          ),
          expenseService.getBudgets(companyId, now.getFullYear().toString()),
          expenseService.getExpenseAnalytics(companyId, selectedPeriod),
        ]);

      setReport(reportResponse);
      setBudgets(budgetsResponse);
      setAnalytics(analyticsResponse);
    } catch (err) {
      setError('FAILED TO LOAD DASHBOARD DATA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const labels = {
      current_month: 'CURRENT MONTH',
      last_month: 'LAST MONTH',
      current_quarter: 'CURRENT QUARTER',
      current_year: 'CURRENT YEAR',
    };
    return labels[selectedPeriod as keyof typeof labels] || 'CURRENT MONTH';
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

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-6 text-xs tracking-wider">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/dark/expenses')}
              className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
            >
              ← EXPENSE MANAGEMENT
            </button>
            <h1 className="text-2xl font-thin text-white tracking-widest">
              EXPENSE DASHBOARD
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
            >
              <option value="current_month">CURRENT MONTH</option>
              <option value="last_month">LAST MONTH</option>
              <option value="current_quarter">CURRENT QUARTER</option>
              <option value="current_year">CURRENT YEAR</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Period Header */}
        <div className="mb-8">
          <h2 className="text-xl font-thin text-white tracking-widest">
            {getPeriodLabel()} EXPENSE STATUS
          </h2>
          {report && (
            <p className="text-xs text-zinc-500 mt-2 tracking-wider">
              PERIOD:{' '}
              {new Date(report.period.start).toLocaleDateString('en-US')} -{' '}
              {new Date(report.period.end).toLocaleDateString('en-US')}
            </p>
          )}
        </div>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  TOTAL EXPENSES
                </h3>
                <p className="text-3xl font-thin text-white">
                  ¥{report.summary.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                  {report.summary.totalExpenses} ITEMS
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  APPROVED
                </h3>
                <p className="text-3xl font-thin text-emerald-500">
                  ¥{report.summary.approvedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                  {Math.round(
                    (report.summary.approvedAmount /
                      report.summary.totalAmount) *
                      100,
                  )}
                  %
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  PENDING
                </h3>
                <p className="text-3xl font-thin text-blue-500">
                  ¥{report.summary.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                  {Object.entries(report.summary.byStatus).find(
                    ([status]) => status === 'submitted',
                  )?.[1] || 0}{' '}
                  ITEMS
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  AVERAGE EXPENSE
                </h3>
                <p className="text-3xl font-thin text-white">
                  ¥
                  {Math.round(
                    report.summary.totalAmount / report.summary.totalExpenses,
                  ).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                  PER ITEM
                </p>
              </div>
            </div>

            {/* Status & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    01
                  </span>
                  STATUS BREAKDOWN
                </h3>
                <div className="space-y-4">
                  {Object.entries(report.summary.byStatus).map(
                    ([status, count]) => {
                      const statusLabels = {
                        draft: 'DRAFT',
                        submitted: 'SUBMITTED',
                        approved: 'APPROVED',
                        rejected: 'REJECTED',
                        paid: 'PAID',
                      };

                      const percentage = Math.round(
                        (Number(count) / report.summary.totalExpenses) * 100,
                      );

                      return (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs font-light text-zinc-400 tracking-wider">
                            {statusLabels[
                              status as keyof typeof statusLabels
                            ] || status}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-zinc-800 h-1">
                              <div
                                className="bg-blue-500 h-1"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-zinc-500 w-12 text-right tracking-wider">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    02
                  </span>
                  CATEGORY EXPENSES
                </h3>
                <div className="space-y-4">
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
                          <span className="text-xs font-light text-zinc-400 tracking-wider uppercase">
                            {category}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-zinc-800 h-1">
                              <div
                                className="bg-emerald-500 h-1"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-zinc-500 w-20 text-right tracking-wider">
                              ¥{(Number(amount) / 1000).toFixed(0)}K
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
              <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    03
                  </span>
                  BUDGET PROGRESS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {budgets.map((budget) => {
                    const progress = calculateBudgetProgress(budget);
                    const spent =
                      Object.entries(report.summary.byCategory).find(
                        ([categoryName]) =>
                          categoryName === budget.category.name,
                      )?.[1] || 0;

                    const isOverBudget = progress > 100;

                    return (
                      <div
                        key={budget.id}
                        className="p-4 bg-black border border-zinc-800"
                      >
                        <h4 className="font-light text-white mb-3 tracking-wider uppercase">
                          {budget.category.name}
                        </h4>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-zinc-500 mb-2 tracking-wider">
                            <span>¥{Number(spent).toLocaleString()}</span>
                            <span>
                              ¥{Number(budget.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1">
                            <div
                              className={`h-1 ${
                                isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs font-light tracking-wider ${
                              isOverBudget ? 'text-red-500' : 'text-zinc-500'
                            }`}
                          >
                            {progress.toFixed(1)}%
                          </span>
                          {isOverBudget && (
                            <span className="text-xs text-red-500 font-normal tracking-wider">
                              OVER BUDGET
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
            <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
              <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  04
                </span>
                TREND ANALYSIS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Monthly Trend */}
                <div>
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-4">
                    MONTHLY EXPENSE TREND
                  </h4>
                  <div className="space-y-3">
                    {[3, 2, 1, 0].map((monthsAgo) => {
                      const monthNames = [
                        'CURRENT',
                        '1M AGO',
                        '2M AGO',
                        '3M AGO',
                      ];
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
                          className="flex items-center space-x-4"
                        >
                          <span className="text-xs text-zinc-500 w-20 tracking-wider">
                            {month}
                          </span>
                          <div className="flex-1">
                            <div className="bg-zinc-800 h-6 relative">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-blue-500 h-6 flex items-center justify-end pr-3"
                                style={{
                                  width: `${(amount / maxAmount) * 100}%`,
                                }}
                              >
                                <span className="text-xs text-white font-light tracking-wider">
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
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-4">
                    DEPARTMENT COMPARISON
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: 'SALES', amount: 850000, budget: 1000000 },
                      {
                        name: 'MARKETING',
                        amount: 650000,
                        budget: 800000,
                      },
                      { name: 'ADMIN', amount: 450000, budget: 500000 },
                      { name: 'DEVELOPMENT', amount: 320000, budget: 400000 },
                    ].map((dept) => {
                      const percentage = (dept.amount / dept.budget) * 100;

                      return (
                        <div
                          key={dept.name}
                          className="flex items-center space-x-4"
                        >
                          <span className="text-xs text-zinc-500 w-24 tracking-wider">
                            {dept.name}
                          </span>
                          <div className="flex-1">
                            <div className="bg-zinc-800 h-6 relative">
                              <div
                                className={`h-6 flex items-center justify-end pr-3 ${
                                  percentage > 90
                                    ? 'bg-gradient-to-r from-red-600 to-red-500'
                                    : percentage > 70
                                      ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              >
                                <span className="text-xs text-white font-light tracking-wider">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-zinc-600 tracking-wider">
                            ¥{(dept.amount / 1000).toFixed(0)}K
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Reduction Opportunities */}
            <div className="bg-gradient-to-r from-emerald-950/30 to-emerald-900/30 border border-emerald-500/30 p-6 mb-8">
              <h3 className="text-lg font-light text-emerald-400 mb-6 tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-light text-xs">
                  05
                </span>
                COST REDUCTION OPPORTUNITIES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/50 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-light text-zinc-300 tracking-wider">
                      TRANSPORT OPTIMIZATION
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 tracking-wider">
                      HIGH
                    </span>
                  </div>
                  <p className="text-2xl font-thin text-emerald-400 mb-2">
                    ¥125K
                  </p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    MONTHLY SAVINGS
                  </p>
                  <p className="text-xs text-zinc-600 mt-3 tracking-wider">
                    SWITCH TO PUBLIC TRANSPORT
                  </p>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-light text-zinc-300 tracking-wider">
                      MEETING COSTS
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 tracking-wider">
                      MEDIUM
                    </span>
                  </div>
                  <p className="text-2xl font-thin text-amber-400 mb-2">¥85K</p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    MONTHLY SAVINGS
                  </p>
                  <p className="text-xs text-zinc-600 mt-3 tracking-wider">
                    INCREASE ONLINE MEETINGS
                  </p>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-light text-zinc-300 tracking-wider">
                      SUPPLIES MANAGEMENT
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 tracking-wider">
                      LOW
                    </span>
                  </div>
                  <p className="text-2xl font-thin text-blue-400 mb-2">¥45K</p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    MONTHLY SAVINGS
                  </p>
                  <p className="text-xs text-zinc-600 mt-3 tracking-wider">
                    BULK PURCHASING
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-emerald-400 tracking-wider">
                  <span className="font-normal">
                    TOTAL SAVINGS POTENTIAL: ¥255K/MONTH
                  </span>
                  <span className="ml-3 text-emerald-500">（¥3.06M/YEAR）</span>
                </p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 p-6 mb-8">
              <h3 className="text-lg font-light text-purple-400 mb-6 tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 border border-purple-500/50 flex items-center justify-center text-purple-400 font-light text-xs">
                  AI
                </span>
                EXPENSE ANALYSIS INSIGHTS
              </h3>
              <div className="space-y-4">
                <div className="bg-black/50 border-l-4 border-purple-500 p-4">
                  <div className="flex items-start">
                    <span className="text-xl mr-4 text-purple-400">⚠</span>
                    <div>
                      <h4 className="font-normal text-white mb-2 tracking-wider">
                        ANOMALY DETECTION
                      </h4>
                      <p className="text-xs text-zinc-400 tracking-wider">
                        ENTERTAINMENT EXPENSES INCREASED 150% FROM LAST MONTH.
                        REVIEW APPROVAL FLOW RECOMMENDED.
                      </p>
                      <button className="text-xs text-purple-400 hover:text-purple-300 mt-3 tracking-wider">
                        VIEW DETAILS →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 border-l-4 border-blue-500 p-4">
                  <div className="flex items-start">
                    <span className="text-xl mr-4 text-blue-400">◈</span>
                    <div>
                      <h4 className="font-normal text-white mb-2 tracking-wider">
                        SPENDING PATTERN ANALYSIS
                      </h4>
                      <p className="text-xs text-zinc-400 tracking-wider">
                        EXPENSE SUBMISSIONS CONCENTRATE IN WEEK 3. CONSIDER
                        WORKFLOW OPTIMIZATION.
                      </p>
                      <button className="text-xs text-blue-400 hover:text-blue-300 mt-3 tracking-wider">
                        ANALYZE →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 border-l-4 border-emerald-500 p-4">
                  <div className="flex items-start">
                    <span className="text-xl mr-4 text-emerald-400">✓</span>
                    <div>
                      <h4 className="font-normal text-white mb-2 tracking-wider">
                        OPTIMIZATION PROPOSAL
                      </h4>
                      <p className="text-xs text-zinc-400 tracking-wider">
                        CONSOLIDATE RECURRING PAYMENTS TO SAVE ¥480K ANNUALLY.
                      </p>
                      <button className="text-xs text-emerald-400 hover:text-emerald-300 mt-3 tracking-wider">
                        VIEW PROPOSAL →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => router.push('/dark/expenses')}
                className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition text-left group"
              >
                <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mb-4 group-hover:border-zinc-500">
                  06
                </div>
                <h3 className="font-light text-white mb-2 tracking-wider">
                  SUBMIT EXPENSE
                </h3>
                <p className="text-xs text-zinc-500 tracking-wider">
                  CREATE NEW EXPENSE CLAIM
                </p>
              </button>

              <button
                onClick={() => router.push('/dark/expenses/reports')}
                className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition text-left group"
              >
                <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mb-4 group-hover:border-zinc-500">
                  07
                </div>
                <h3 className="font-light text-white mb-2 tracking-wider">
                  DETAILED REPORTS
                </h3>
                <p className="text-xs text-zinc-500 tracking-wider">
                  VIEW COMPREHENSIVE REPORTS
                </p>
              </button>

              <button
                onClick={() => router.push('/dark/expenses/budget')}
                className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition text-left group"
              >
                <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mb-4 group-hover:border-zinc-500">
                  08
                </div>
                <h3 className="font-light text-white mb-2 tracking-wider">
                  BUDGET MANAGEMENT
                </h3>
                <p className="text-xs text-zinc-500 tracking-wider">
                  CONFIGURE BUDGETS
                </p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
