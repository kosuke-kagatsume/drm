'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AccountingDashboardProps {
  userEmail: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category:
    | 'materials'
    | 'labor'
    | 'equipment'
    | 'office'
    | 'marketing'
    | 'utilities';
  date: string;
  receipt: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
}

interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface AccountsReceivableAging {
  customer: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
}

export default function AccountingDashboard({
  userEmail,
}: AccountingDashboardProps) {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState('overview');

  const monthlyFinancials = {
    totalRevenue: 45231000,
    totalExpenses: 32156000,
    netIncome: 13075000,
    grossMargin: 28.9,
    cashFlow: 18456000,
    accountsReceivable: 8234000,
    accountsPayable: 4567000,
    pendingExpenses: 12,
  };

  const expenses: Expense[] = [
    {
      id: '1',
      description: '建設資材 - プロジェクトA',
      amount: 245000,
      category: 'materials',
      date: '2024-08-10',
      receipt: true,
      status: 'pending',
      submittedBy: '山田太郎',
    },
    {
      id: '2',
      description: '事務用品 - 月次',
      amount: 35000,
      category: 'office',
      date: '2024-08-09',
      receipt: true,
      status: 'approved',
      submittedBy: '佐藤花子',
    },
    {
      id: '3',
      description: '機材レンタル - クレーン',
      amount: 180000,
      category: 'equipment',
      date: '2024-08-08',
      receipt: false,
      status: 'pending',
      submittedBy: '鈴木一郎',
    },
  ];

  const budgetComparison: BudgetComparison[] = [
    {
      category: '資材',
      budgeted: 15000000,
      actual: 12450000,
      variance: -2550000,
      variancePercent: -17.0,
    },
    {
      category: '人件費',
      budgeted: 8000000,
      actual: 8950000,
      variance: 950000,
      variancePercent: 11.9,
    },
    {
      category: '機材',
      budgeted: 3000000,
      actual: 2780000,
      variance: -220000,
      variancePercent: -7.3,
    },
    {
      category: '事務費',
      budgeted: 500000,
      actual: 625000,
      variance: 125000,
      variancePercent: 25.0,
    },
  ];

  const accountsReceivable: AccountsReceivableAging[] = [
    {
      customer: 'TANAKA CONSTRUCTION',
      current: 2500000,
      days30: 1200000,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 3700000,
    },
    {
      customer: 'YAMADA BUILDING',
      current: 1800000,
      days30: 0,
      days60: 450000,
      days90: 0,
      over90: 0,
      total: 2250000,
    },
    {
      customer: 'SATO INDUSTRIES',
      current: 0,
      days30: 0,
      days60: 0,
      days90: 890000,
      over90: 0,
      total: 890000,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-500 border-emerald-500/50';
      case 'pending':
        return 'text-amber-500 border-amber-500/50';
      case 'rejected':
        return 'text-red-500 border-red-500/50';
      default:
        return 'text-zinc-500 border-zinc-700';
    }
  };

  const getCategoryIndicator = (category: string) => {
    switch (category) {
      case 'materials':
        return '01';
      case 'labor':
        return '02';
      case 'equipment':
        return '03';
      case 'office':
        return '04';
      case 'marketing':
        return '05';
      case 'utilities':
        return '06';
      default:
        return '00';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-500';
    if (variance < 0) return 'text-emerald-500';
    return 'text-zinc-500';
  };

  return (
    <div className="space-y-6">
      {/* ACCOUNTING KPI DASHBOARD */}
      <div className="bg-zinc-950 border border-zinc-800 p-6">
        <h2 className="text-sm font-normal text-white tracking-widest mb-6">
          財務概要
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">総収入</p>
            <p className="text-3xl font-thin text-white">
              ¥{(monthlyFinancials.totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-emerald-500 tracking-wider mt-2">
              +8.5%
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">純利益</p>
            <p className="text-3xl font-thin text-emerald-500">
              ¥{(monthlyFinancials.netIncome / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-emerald-500/70 tracking-wider mt-2">
              健全
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              キャッシュフロー
            </p>
            <p className="text-3xl font-thin text-blue-500">
              ¥{(monthlyFinancials.cashFlow / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-blue-500/70 tracking-wider mt-2">
              プラス
            </p>
          </div>
          <div className="border border-amber-500/30 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              保留経費
            </p>
            <p className="text-3xl font-thin text-amber-500">
              {monthlyFinancials.pendingExpenses}
            </p>
            <p className="text-xs text-amber-500/70 tracking-wider mt-2">
              要確認
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EXPENSES & BUDGET */}
        <div className="lg:col-span-2">
          {/* PENDING EXPENSES */}
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                承認待ち経費
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {expenses
                  .filter((e) => e.status === 'pending')
                  .map((expense, idx) => (
                    <div
                      key={expense.id}
                      className="border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm">
                            {getCategoryIndicator(expense.category)}
                          </div>
                          <div>
                            <h4 className="text-white font-light tracking-wider">
                              {expense.description}
                            </h4>
                            <p className="text-xs text-zinc-500 tracking-wider mt-1">
                              SUBMITTED BY: {expense.submittedBy}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-thin text-white">
                            ¥{(expense.amount / 1000).toFixed(0)}K
                          </p>
                          <span
                            className={`px-3 py-1 border text-xs tracking-wider ${getStatusColor(expense.status)}`}
                          >
                            {expense.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-4">
                          <span className="text-zinc-500 tracking-wider">
                            DATE:{' '}
                            {new Date(expense.date)
                              .toLocaleDateString()
                              .toUpperCase()}
                          </span>
                          <span
                            className={`tracking-wider ${expense.receipt ? 'text-emerald-500' : 'text-red-500'}`}
                          >
                            RECEIPT: {expense.receipt ? 'YES' : 'NO'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-4 py-1 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                            APPROVE
                          </button>
                          <button className="px-4 py-1 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                            REVIEW
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* BUDGET COMPARISON */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                BUDGET VS ACTUAL
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {budgetComparison.map((item, idx) => (
                  <div key={idx} className="border border-zinc-800 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-light tracking-wider">
                        {item.category}
                      </h4>
                      <span
                        className={`text-xs tracking-wider ${getVarianceColor(item.variance)}`}
                      >
                        {item.variancePercent > 0 ? '+' : ''}
                        {item.variancePercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                      <div>
                        <p className="text-zinc-500 tracking-wider">BUDGETED</p>
                        <p className="text-white font-light">
                          ¥{(item.budgeted / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">ACTUAL</p>
                        <p className="text-white font-light">
                          ¥{(item.actual / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">VARIANCE</p>
                        <p
                          className={`font-light ${getVarianceColor(item.variance)}`}
                        >
                          ¥{Math.abs(item.variance / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-900 h-1">
                      <div
                        className={`h-1 transition-all duration-500 ${
                          item.actual <= item.budgeted
                            ? 'bg-emerald-500/50'
                            : 'bg-red-500/50'
                        }`}
                        style={{
                          width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACCOUNTS RECEIVABLE AGING */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                ACCOUNTS RECEIVABLE AGING
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {accountsReceivable.map((account, idx) => (
                  <div key={idx} className="border border-zinc-800 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-light tracking-wider">
                        {account.customer}
                      </h4>
                      <p className="text-xl font-thin text-white">
                        ¥{(account.total / 1000000).toFixed(1)}M
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-xs">
                      <div>
                        <p className="text-zinc-500 tracking-wider">CURRENT</p>
                        <p className="text-emerald-500 font-light">
                          ¥{(account.current / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">30 DAYS</p>
                        <p className="text-amber-500 font-light">
                          ¥{(account.days30 / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">60 DAYS</p>
                        <p className="text-amber-500 font-light">
                          ¥{(account.days60 / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">90 DAYS</p>
                        <p className="text-red-500 font-light">
                          ¥{(account.days90 / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">90+ DAYS</p>
                        <p className="text-red-500 font-light">
                          ¥{(account.over90 / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1">
          {/* FINANCIAL SUMMARY */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                FINANCIAL SUMMARY
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    ACCOUNTS RECEIVABLE
                  </p>
                  <p className="text-xl font-thin text-white">
                    ¥
                    {(monthlyFinancials.accountsReceivable / 1000000).toFixed(
                      1,
                    )}
                    M
                  </p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    OUTSTANDING
                  </p>
                </div>
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    ACCOUNTS PAYABLE
                  </p>
                  <p className="text-xl font-thin text-amber-500">
                    ¥{(monthlyFinancials.accountsPayable / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-amber-500/70 tracking-wider mt-1">
                    DUE
                  </p>
                </div>
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    GROSS MARGIN
                  </p>
                  <p className="text-xl font-thin text-emerald-500">
                    {monthlyFinancials.grossMargin}%
                  </p>
                  <p className="text-xs text-emerald-500/70 tracking-wider mt-1">
                    HEALTHY
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                QUICK ACTIONS
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/expenses')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        EXPENSE MANAGEMENT
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        REVIEW & APPROVE
                      </p>
                    </div>
                    <span className="text-zinc-500">01</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/invoices')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        INVOICE GENERATION
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        CREATE & SEND
                      </p>
                    </div>
                    <span className="text-zinc-500">02</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/payments')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        PAYMENT TRACKING
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        MONITOR & COLLECT
                      </p>
                    </div>
                    <span className="text-zinc-500">03</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* FINANCIAL REPORTS */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                FINANCIAL REPORTS
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <button className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        PROFIT & LOSS
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        MONTHLY REPORT
                      </p>
                    </div>
                    <span className="text-emerald-500">READY</span>
                  </div>
                </button>
                <button className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        BALANCE SHEET
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        AS OF TODAY
                      </p>
                    </div>
                    <span className="text-emerald-500">READY</span>
                  </div>
                </button>
                <button className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        CASH FLOW
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        LAST 90 DAYS
                      </p>
                    </div>
                    <span className="text-amber-500">GENERATING</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ACCOUNTING AI */}
          <div className="bg-zinc-950 border border-zinc-800 sticky top-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                ACCOUNTING AI
              </h3>
            </div>
            <div className="p-4">
              <div className="border border-zinc-800 p-4 mb-4">
                <p className="text-xs text-zinc-500 tracking-wider mb-3">
                  FINANCIAL INSIGHTS
                </p>
                <div className="space-y-3 text-xs text-zinc-400">
                  <p className="tracking-wider">
                    • CASH FLOW FORECAST POSITIVE
                  </p>
                  <p className="tracking-wider">
                    • LABOR COSTS 12% OVER BUDGET
                  </p>
                  <p className="tracking-wider">
                    • 3 INVOICES APPROACHING DUE DATE
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                  FINANCIAL QUERY
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  rows={3}
                  placeholder="Enter your financial question..."
                />
                <button className="mt-3 w-full border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                  ANALYZE
                </button>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                  QUICK ANALYSIS
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    EXPENSE TREND ANALYSIS
                  </button>
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    BUDGET VARIANCE REPORT
                  </button>
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    CASH FLOW PROJECTION
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
