'use client';

import { useRouter } from 'next/navigation';

interface ManagerDashboardProps {
  userEmail: string;
}

export default function ManagerDashboard({ userEmail }: ManagerDashboardProps) {
  const router = useRouter();

  const branchKPI = {
    grossProfit: 23.5,
    targetProfit: 25,
    contracts: 42,
    targetContracts: 50,
    pendingApprovals: 3,
    delayedProjects: 2,
  };

  const staffPerformance = [
    {
      name: '山田太郎',
      role: '営業',
      contracts: 8,
      profit: 24,
      status: 'good',
    },
    {
      name: '佐藤花子',
      role: '営業',
      contracts: 5,
      profit: 18,
      status: 'warning',
    },
    {
      name: '鈴木一郎',
      role: '営業',
      contracts: 3,
      profit: 15,
      status: 'danger',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      customer: '田中様邸',
      amount: 2500000,
      profit: 22,
      sales: '山田太郎',
      urgent: false,
    },
    {
      id: '2',
      customer: '佐藤ビル改修',
      amount: 8000000,
      profit: 18,
      sales: '佐藤花子',
      urgent: true,
    },
    {
      id: '3',
      customer: '鈴木マンション',
      amount: 5500000,
      profit: 20,
      sales: '鈴木一郎',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* BRANCH KPI DASHBOARD */}
      <div className="bg-zinc-950 border border-zinc-800 p-6">
        <h2 className="text-sm font-normal text-white tracking-widest mb-6">
          BRANCH PERFORMANCE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              GROSS PROFIT
            </p>
            <p
              className={`text-3xl font-thin ${
                branchKPI.grossProfit >= branchKPI.targetProfit
                  ? 'text-emerald-500'
                  : 'text-amber-500'
              }`}
            >
              {branchKPI.grossProfit}%
            </p>
            <p className="text-xs text-zinc-600 tracking-wider mt-2">
              TARGET: {branchKPI.targetProfit}%
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              MONTHLY CONTRACTS
            </p>
            <p className="text-3xl font-thin text-white">
              {branchKPI.contracts}
            </p>
            <div className="mt-3 bg-zinc-900 h-1">
              <div
                className="bg-blue-500/50 h-1 transition-all duration-500"
                style={{
                  width: `${(branchKPI.contracts / branchKPI.targetContracts) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-zinc-600 tracking-wider mt-2">
              TARGET: {branchKPI.targetContracts}
            </p>
          </div>
          <div className="border border-amber-500/30 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">PENDING</p>
            <p className="text-3xl font-thin text-amber-500">
              {branchKPI.pendingApprovals}
            </p>
            <p className="text-xs text-amber-500/70 tracking-wider mt-2">
              REQUIRES ACTION
            </p>
          </div>
          <div className="border border-red-500/30 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">DELAYED</p>
            <p className="text-3xl font-thin text-red-500">
              {branchKPI.delayedProjects}
            </p>
            <p className="text-xs text-red-500/70 tracking-wider mt-2">
              CRITICAL
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* PENDING APPROVALS */}
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                TODAY'S PENDING APPROVALS
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.id}
                    className={`border p-4 hover:border-zinc-700 transition-colors duration-200 ${
                      item.urgent
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-white font-light tracking-wider">
                            {item.customer.toUpperCase()}
                          </h4>
                          {item.urgent && (
                            <span className="px-3 py-1 border border-red-500/50 text-red-500 text-xs tracking-wider">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 tracking-wider mt-1">
                          SALES: {item.sales.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-thin text-white">
                          ¥{(item.amount / 1000000).toFixed(1)}M
                        </p>
                        <p
                          className={`text-xs tracking-wider mt-1 ${
                            item.profit >= 20
                              ? 'text-emerald-500'
                              : 'text-amber-500'
                          }`}
                        >
                          MARGIN: {item.profit}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 px-4 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                        APPROVE
                      </button>
                      <button className="flex-1 px-4 py-2 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                        REVIEW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TEAM PERFORMANCE */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                TEAM PERFORMANCE
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {staffPerformance.map((staff) => (
                  <div
                    key={staff.name}
                    className="border border-zinc-800 p-4 hover:border-zinc-700 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-light tracking-wider">
                          {staff.name.toUpperCase()}
                        </h4>
                        <p className="text-xs text-zinc-500 tracking-wider">
                          {staff.role.toUpperCase()}
                        </p>
                        <div className="mt-3 flex gap-6">
                          <span className="text-xs text-zinc-400">
                            CONTRACTS:{' '}
                            <span className="text-white font-light">
                              {staff.contracts}
                            </span>
                          </span>
                          <span className="text-xs text-zinc-400">
                            MARGIN:{' '}
                            <span
                              className={`font-light ${
                                staff.profit >= 20
                                  ? 'text-emerald-500'
                                  : 'text-amber-500'
                              }`}
                            >
                              {staff.profit}%
                            </span>
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 border text-xs tracking-wider ${
                          staff.status === 'good'
                            ? 'border-emerald-500/50 text-emerald-500'
                            : staff.status === 'warning'
                              ? 'border-amber-500/50 text-amber-500'
                              : 'border-red-500/50 text-red-500'
                        }`}
                      >
                        {staff.status === 'good'
                          ? 'GOOD'
                          : staff.status === 'warning'
                            ? 'WARNING'
                            : 'CRITICAL'}
                      </span>
                    </div>
                    <div className="mt-3 bg-zinc-900 h-1">
                      <div
                        className={`h-1 transition-all duration-500 ${
                          staff.status === 'good'
                            ? 'bg-emerald-500/50'
                            : staff.status === 'warning'
                              ? 'bg-amber-500/50'
                              : 'bg-red-500/50'
                        }`}
                        style={{ width: `${(staff.contracts / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CUSTOMER & SALES MANAGEMENT */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                CUSTOMER & SALES MANAGEMENT
              </h3>
            </div>
            <div className="p-4">
              <button
                onClick={() => router.push('/customers')}
                className="w-full mb-4 border border-zinc-800 p-6 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg mr-4">
                      01
                    </div>
                    <div className="text-left">
                      <p className="text-white font-light tracking-wider">
                        CUSTOMER CENTER
                      </p>
                      <p className="text-xs text-zinc-500 tracking-wider mt-1">
                        BRANCH DATABASE
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-thin text-white">125</p>
                    <p className="text-xs text-zinc-500 tracking-wider">
                      CUSTOMERS
                    </p>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/estimates')}
                  className="text-center border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors"
                >
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    02
                  </p>
                  <p className="text-xs text-white tracking-wider">ESTIMATES</p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    15 ITEMS
                  </p>
                </button>
                <button
                  onClick={() => router.push('/contracts')}
                  className="text-center border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors"
                >
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    03
                  </p>
                  <p className="text-xs text-white tracking-wider">CONTRACTS</p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    5 ITEMS
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* FINANCIAL MANAGEMENT */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                BRANCH FINANCIAL MANAGEMENT
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => router.push('/invoices')}
                  className="text-center border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors"
                >
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    04
                  </p>
                  <p className="text-xs text-white tracking-wider">INVOICES</p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">8</p>
                </button>
                <button
                  onClick={() => router.push('/payments')}
                  className="text-center border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors"
                >
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    05
                  </p>
                  <p className="text-xs text-white tracking-wider">PAYMENTS</p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    ¥8M
                  </p>
                </button>
                <button
                  onClick={() => router.push('/expenses')}
                  className="text-center border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors"
                >
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    06
                  </p>
                  <p className="text-xs text-white tracking-wider">EXPENSES</p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    ¥2M
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* INTEGRATED FINANCIAL ANALYSIS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                BRANCH INTEGRATED FINANCIAL ANALYSIS
              </h3>
            </div>
            <div className="p-6">
              {/* KEY FINANCIAL METRICS */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border border-zinc-800 p-4">
                  <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                    PROFITABILITY
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        OPERATING MARGIN
                      </span>
                      <span className="text-white font-light">23.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        GROSS MARGIN
                      </span>
                      <span className="text-white font-light">35.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">ROI</span>
                      <span className="text-white font-light">18.7%</span>
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
                        +12.3%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        CONTRACT GROWTH
                      </span>
                      <span className="text-emerald-500 font-light">+8.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        MARKET SHARE
                      </span>
                      <span className="text-white font-light">15.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BUDGET MANAGEMENT */}
              <div className="border border-zinc-800 p-4 mb-4">
                <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                  BUDGET EXECUTION
                </h5>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-500 tracking-wider">
                        MONTHLY BUDGET
                      </span>
                      <span className="text-white font-light">¥45M / ¥50M</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1">
                      <div
                        className="bg-amber-500/50 h-1"
                        style={{ width: '90%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-500 tracking-wider">
                        EXPENSE BUDGET
                      </span>
                      <span className="text-white font-light">
                        ¥8.5M / ¥10M
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1">
                      <div
                        className="bg-emerald-500/50 h-1"
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => router.push('/expenses')}
                  className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center"
                >
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    07
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
                    08
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    INVENTORY
                  </div>
                </button>
                <button className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center">
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    09
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    ANALYSIS
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* MAP ANALYSIS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                BRANCH AREA ANALYSIS
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      ACTIVE
                    </p>
                    <p className="text-2xl font-thin text-blue-500">15</p>
                  </div>
                  <div className="border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      IN PROGRESS
                    </p>
                    <p className="text-2xl font-thin text-amber-500">8</p>
                  </div>
                  <div className="border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      COMPLETED
                    </p>
                    <p className="text-2xl font-thin text-emerald-500">23</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/map')}
                  className="w-full border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors"
                >
                  VIEW MAP DISTRIBUTION →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MANAGEMENT AI */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 sticky top-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                MANAGEMENT AI
              </h3>
            </div>
            <div className="p-4">
              <div className="border border-zinc-800 p-4 mb-4">
                <p className="text-xs text-zinc-500 tracking-wider mb-3">
                  TODAY'S PRIORITY TASKS
                </p>
                <ul className="space-y-3 text-xs text-zinc-400">
                  <li className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-red-500 mt-1 mr-3" />
                    <span className="tracking-wider">
                      SATO BUILDING APPROVAL (URGENT)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-amber-500 mt-1 mr-3" />
                    <span className="tracking-wider">SUPPORT SUZUKI SALES</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-blue-500 mt-1 mr-3" />
                    <span className="tracking-wider">MONTHLY REPORT</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/estimates')}
                  className="w-full px-4 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>ESTIMATE LIST</span>
                    <span>→</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/estimates/create')}
                  className="w-full px-4 py-3 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>NEW ESTIMATE</span>
                    <span>+</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/vendors')}
                  className="w-full px-4 py-3 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>VENDOR MANAGEMENT</span>
                    <span>→</span>
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                  AI ASSISTANT
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  rows={3}
                  placeholder="Enter your question..."
                />
                <button className="mt-3 w-full border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                  CONSULT AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
