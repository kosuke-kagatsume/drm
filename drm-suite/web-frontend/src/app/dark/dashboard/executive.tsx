'use client';

import { useRouter } from 'next/navigation';

interface ExecutiveDashboardProps {
  userEmail: string;
}

export default function ExecutiveDashboard({
  userEmail,
}: ExecutiveDashboardProps) {
  const router = useRouter();

  const companyKPI = {
    totalRevenue: 125000000,
    targetRevenue: 150000000,
    grossProfit: 24.2,
    targetProfit: 25,
    cashFlow: 45000000,
    overduePayments: 3,
    inventoryTurnover: 8.5,
  };

  const branchPerformance = [
    { name: '東京本店', revenue: 45000000, profit: 26.5, status: 'good' },
    { name: '横浜支店', revenue: 32000000, profit: 23.8, status: 'normal' },
    { name: '千葉支店', revenue: 28000000, profit: 22.1, status: 'warning' },
    { name: '埼玉支店', revenue: 20000000, profit: 19.5, status: 'danger' },
  ];

  const criticalAlerts = [
    {
      type: 'profit',
      message: 'CHIBA BRANCH MARGIN DECLINING FOR 3 MONTHS',
      severity: 'high',
    },
    {
      type: 'payment',
      message: 'OVERDUE COLLECTIONS EXCEED 30 DAYS: 3 ITEMS',
      severity: 'high',
    },
    {
      type: 'inventory',
      message: 'INVENTORY TURNOVER BELOW TARGET',
      severity: 'medium',
    },
  ];

  return (
    <div className="space-y-6">
      {/* COMPANY KPI DASHBOARD */}
      <div className="bg-zinc-950 border border-zinc-800 p-6">
        <h2 className="text-sm font-normal text-white tracking-widest mb-6">
          COMPANY PERFORMANCE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              TOTAL REVENUE
            </p>
            <p className="text-3xl font-thin text-white">
              ¥{(companyKPI.totalRevenue / 1000000).toFixed(0)}M
            </p>
            <div className="mt-3 bg-zinc-900 h-1">
              <div
                className="bg-blue-500/50 h-1 transition-all duration-500"
                style={{
                  width: `${(companyKPI.totalRevenue / companyKPI.targetRevenue) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-zinc-600 tracking-wider mt-2">
              TARGET:{' '}
              {(
                (companyKPI.totalRevenue / companyKPI.targetRevenue) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              GROSS PROFIT
            </p>
            <p
              className={`text-3xl font-thin ${companyKPI.grossProfit >= companyKPI.targetProfit ? 'text-emerald-500' : 'text-amber-500'}`}
            >
              {companyKPI.grossProfit}%
            </p>
            <p className="text-xs text-zinc-600 tracking-wider mt-2">
              TARGET: {companyKPI.targetProfit}%
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              CASH FLOW
            </p>
            <p className="text-3xl font-thin text-blue-500">
              ¥{(companyKPI.cashFlow / 1000000).toFixed(0)}M
            </p>
            <p className="text-xs text-blue-500/70 tracking-wider mt-2">
              HEALTHY
            </p>
          </div>
          <div className="border border-red-500/30 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              OVERDUE PAYMENTS
            </p>
            <p className="text-3xl font-thin text-red-500">
              {companyKPI.overduePayments}
            </p>
            <p className="text-xs text-red-500/70 tracking-wider mt-2">
              CRITICAL
            </p>
          </div>
        </div>
      </div>

      {/* CRITICAL ALERTS */}
      {criticalAlerts.length > 0 && (
        <div className="bg-zinc-950 border border-red-500/30 p-6">
          <h3 className="text-xs font-normal text-red-500 tracking-widest mb-4">
            CRITICAL MANAGEMENT DECISIONS REQUIRED
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start">
                <span
                  className={`inline-block w-1 h-1 mt-2 mr-3 ${
                    alert.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
                <p className="text-xs text-zinc-400 tracking-wider">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BRANCH PERFORMANCE */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                BRANCH PERFORMANCE
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {branchPerformance.map((branch) => (
                  <div
                    key={branch.name}
                    className="border border-zinc-800 p-4 hover:border-zinc-700 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-white font-light tracking-wider">
                          {branch.name.toUpperCase()}
                        </h4>
                        <div className="mt-3 grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs text-zinc-500 tracking-wider">
                              REVENUE
                            </p>
                            <p className="text-xl font-thin text-white">
                              ¥{(branch.revenue / 1000000).toFixed(0)}M
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 tracking-wider">
                              MARGIN
                            </p>
                            <p
                              className={`text-xl font-thin ${
                                branch.profit >= 25
                                  ? 'text-emerald-500'
                                  : branch.profit >= 22
                                    ? 'text-amber-500'
                                    : 'text-red-500'
                              }`}
                            >
                              {branch.profit}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-3 py-1 border text-xs tracking-wider ${
                            branch.status === 'good'
                              ? 'border-emerald-500/50 text-emerald-500'
                              : branch.status === 'normal'
                                ? 'border-zinc-600 text-zinc-400'
                                : branch.status === 'warning'
                                  ? 'border-amber-500/50 text-amber-500'
                                  : 'border-red-500/50 text-red-500'
                          }`}
                        >
                          {branch.status === 'good'
                            ? 'EXCELLENT'
                            : branch.status === 'normal'
                              ? 'STANDARD'
                              : branch.status === 'warning'
                                ? 'WARNING'
                                : 'CRITICAL'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 bg-zinc-900 h-1">
                      <div
                        className={`h-1 transition-all duration-500 ${
                          branch.profit >= 25
                            ? 'bg-emerald-500/50'
                            : branch.profit >= 22
                              ? 'bg-amber-500/50'
                              : 'bg-red-500/50'
                        }`}
                        style={{ width: `${(branch.profit / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INTEGRATED FINANCIAL ANALYSIS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                EXECUTIVE INTEGRATED FINANCIAL ANALYSIS
              </h3>
            </div>
            <div className="p-6">
              {/* KEY FINANCIAL METRICS */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="border border-zinc-800 p-4">
                  <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                    PROFITABILITY
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        OPERATING MARGIN
                      </span>
                      <span className="text-white font-light">24.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        TOTAL ASSET RETURN
                      </span>
                      <span className="text-white font-light">12.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        EQUITY RETURN
                      </span>
                      <span className="text-white font-light">18.5%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-800 p-4">
                  <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                    GROWTH METRICS
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        SALES GROWTH
                      </span>
                      <span className="text-emerald-500 font-light">
                        +15.7%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        PROFIT GROWTH
                      </span>
                      <span className="text-emerald-500 font-light">
                        +22.1%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        MARKET SHARE
                      </span>
                      <span className="text-white font-light">18.3%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-800 p-4">
                  <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                    EFFICIENCY
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        ASSET TURNOVER
                      </span>
                      <span className="text-white font-light">1.2x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        INVENTORY TURNOVER
                      </span>
                      <span className="text-white font-light">8.5x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        RECEIVABLE TURNOVER
                      </span>
                      <span className="text-white font-light">6.2x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FINANCIAL HEALTH */}
              <div className="border border-zinc-800 p-4 mb-4">
                <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                  FINANCIAL HEALTH
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-zinc-500 tracking-wider">
                          EQUITY RATIO
                        </span>
                        <span className="text-white font-light">65%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1">
                        <div
                          className="bg-blue-500/50 h-1"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-zinc-500 tracking-wider">
                          CURRENT RATIO
                        </span>
                        <span className="text-white font-light">180%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1">
                        <div
                          className="bg-emerald-500/50 h-1"
                          style={{ width: '90%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-zinc-500 tracking-wider">
                          DEBT-EQUITY RATIO
                        </span>
                        <span className="text-white font-light">0.35</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1">
                        <div
                          className="bg-emerald-500/50 h-1"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-zinc-500 tracking-wider">
                          INTEREST COVERAGE
                        </span>
                        <span className="text-white font-light">12.5x</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1">
                        <div
                          className="bg-emerald-500/50 h-1"
                          style={{ width: '95%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => router.push('/expenses/dashboard')}
                  className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center"
                >
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    01
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    EXPENSES
                  </div>
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center"
                >
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    02
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    INVENTORY
                  </div>
                </button>
                <button className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center">
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    03
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    FINANCE
                  </div>
                </button>
                <button className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center">
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    04
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    STRATEGY
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* MAP ANALYSIS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                COMPANY PROJECT MAP ANALYSIS
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      ACTIVE PROJECTS
                    </p>
                    <p className="text-2xl font-thin text-blue-500">48</p>
                  </div>
                  <div className="border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      AREA REVENUE
                    </p>
                    <p className="text-2xl font-thin text-amber-500">¥125M</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/map')}
                  className="w-full border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors"
                >
                  OPEN MAP ANALYSIS DASHBOARD →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1">
          {/* CUSTOMER DATABASE */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="p-6">
              <h3 className="text-sm font-normal text-white tracking-widest mb-4">
                COMPANY CUSTOMER DATABASE
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-zinc-800 p-3">
                  <p className="text-2xl font-thin text-white">458</p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TOTAL CUSTOMERS
                  </p>
                </div>
                <div className="border border-zinc-800 p-3">
                  <p className="text-2xl font-thin text-white">¥285M</p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    CUSTOMER VALUE
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/customers')}
                className="w-full bg-white text-black py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                CUSTOMER MANAGEMENT CENTER →
              </button>
            </div>
          </div>

          {/* FINANCIAL MANAGEMENT */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                FINANCIAL MANAGEMENT
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/finance/analysis')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        DETAILED FINANCIAL ANALYSIS
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        P/L, B/S, CF
                      </p>
                    </div>
                    <span className="text-zinc-500">01</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/strategy/analysis')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        STRATEGIC ANALYSIS
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        SWOT, COMPETITIVE
                      </p>
                    </div>
                    <span className="text-zinc-500">02</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/contracts')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        CONTRACT MANAGEMENT
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        5 IN PROGRESS
                      </p>
                    </div>
                    <span className="text-zinc-500">03</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/payments')}
                  className="w-full text-left border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-light text-xs tracking-wider">
                        PAYMENT MANAGEMENT
                      </p>
                      <p className="text-xs text-zinc-600 tracking-wider">
                        ¥22M RECEIVED THIS MONTH
                      </p>
                    </div>
                    <span className="text-zinc-500">04</span>
                  </div>
                </button>
              </div>
              <div className="mt-4 p-3 border border-red-500/30 bg-red-500/5">
                <p className="text-xs text-red-500 tracking-wider mb-1">
                  ATTENTION REQUIRED
                </p>
                <p className="text-xs text-zinc-400 tracking-wider">
                  3 OVERDUE INVOICES REQUIRING ACTION
                </p>
              </div>
            </div>
          </div>

          {/* EXECUTIVE ANALYSIS AI */}
          <div className="bg-zinc-950 border border-zinc-800 sticky top-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                EXECUTIVE ANALYSIS AI
              </h3>
            </div>
            <div className="p-4">
              <div className="border border-zinc-800 p-4 mb-4">
                <p className="text-xs text-zinc-500 tracking-wider mb-3">
                  TODAY'S ANALYSIS RECOMMENDATIONS
                </p>
                <div className="space-y-3 text-xs text-zinc-400">
                  <p className="tracking-wider">
                    • ANALYZE CHIBA BRANCH MARGIN DECLINE FACTORS
                  </p>
                  <p className="tracking-wider">
                    • EXTRACT COMMON PATTERNS FROM OVERDUE COLLECTIONS
                  </p>
                  <p className="tracking-wider">
                    • FORECAST NEXT MONTH'S CASH FLOW
                  </p>
                </div>
                <button className="mt-3 w-full bg-white text-black py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                  GENERATE ANALYSIS REPORT
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                  EXECUTIVE INQUIRY
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  rows={3}
                  placeholder="Enter your strategic question..."
                />
                <button className="mt-3 w-full border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                  CONSULT AI
                </button>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                  QUICK ANALYSIS
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    PREVIOUS YEAR COMPARISON
                  </button>
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    COMPETITIVE BENCHMARK
                  </button>
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    SCENARIO ANALYSIS
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
