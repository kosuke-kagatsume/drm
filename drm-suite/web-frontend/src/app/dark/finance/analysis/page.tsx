'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DarkFinanceAnalysisPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current_quarter');
  const [selectedView, setSelectedView] = useState('overview');

  if (isLoading || !user) {
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

  const financialMetrics = {
    revenue: 125000000,
    cost: 95000000,
    grossProfit: 30000000,
    operatingProfit: 15000000,
    netProfit: 12000000,
    assets: 280000000,
    liabilities: 98000000,
    equity: 182000000,
    cashFlow: 45000000,
  };

  const ratios = {
    grossMargin:
      (financialMetrics.grossProfit / financialMetrics.revenue) * 100,
    operatingMargin:
      (financialMetrics.operatingProfit / financialMetrics.revenue) * 100,
    netMargin: (financialMetrics.netProfit / financialMetrics.revenue) * 100,
    roe: (financialMetrics.netProfit / financialMetrics.equity) * 100,
    roa: (financialMetrics.netProfit / financialMetrics.assets) * 100,
    currentRatio: 1.8,
    debtToEquity: financialMetrics.liabilities / financialMetrics.equity,
  };

  const quarterlyData = [
    { quarter: 'Q1', revenue: 28000000, profit: 2500000, margin: 8.9 },
    { quarter: 'Q2', revenue: 31000000, profit: 2800000, margin: 9.0 },
    { quarter: 'Q3', revenue: 33000000, profit: 3200000, margin: 9.7 },
    { quarter: 'Q4', revenue: 33000000, profit: 3500000, margin: 10.6 },
  ];

  const departmentData = [
    {
      name: 'EXTERIOR PAINTING',
      revenue: 75000000,
      cost: 52500000,
      profit: 22500000,
      margin: 30,
    },
    {
      name: 'ROOFING',
      revenue: 35000000,
      cost: 26250000,
      profit: 8750000,
      margin: 25,
    },
    {
      name: 'RENOVATION',
      revenue: 15000000,
      cost: 12000000,
      profit: 3000000,
      margin: 20,
    },
  ];

  const cashFlowData = {
    operating: 18000000,
    investing: -5000000,
    financing: -8000000,
    netChange: 5000000,
    beginningCash: 40000000,
    endingCash: 45000000,
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                FINANCIAL ANALYSIS
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="current_month">CURRENT MONTH</option>
                <option value="current_quarter">CURRENT QUARTER</option>
                <option value="current_year">CURRENT YEAR</option>
                <option value="last_year">LAST YEAR</option>
              </select>

              <button className="bg-white text-black px-6 py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                EXPORT REPORT
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-zinc-950 border border-zinc-800 mb-8">
          <div className="flex space-x-0 p-1">
            {['overview', 'pl', 'bs', 'cashflow', 'ratios', 'segment'].map(
              (view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`flex-1 py-3 px-4 text-xs tracking-wider transition-colors ${
                    selectedView === view
                      ? 'bg-white text-black'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {view === 'overview' && 'OVERVIEW'}
                  {view === 'pl' && 'P&L STATEMENT'}
                  {view === 'bs' && 'BALANCE SHEET'}
                  {view === 'cashflow' && 'CASH FLOW'}
                  {view === 'ratios' && 'FINANCIAL RATIOS'}
                  {view === 'segment' && 'SEGMENT ANALYSIS'}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Overview View */}
        {selectedView === 'overview' && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  REVENUE
                </h3>
                <p className="text-3xl font-thin text-white">
                  ¥{(financialMetrics.revenue / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-emerald-500 mt-2 tracking-wider">
                  +15.2% YOY
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  OPERATING PROFIT
                </h3>
                <p className="text-3xl font-thin text-emerald-500">
                  ¥{(financialMetrics.operatingProfit / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                  MARGIN: {ratios.operatingMargin.toFixed(1)}%
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  NET PROFIT
                </h3>
                <p className="text-3xl font-thin text-blue-500">
                  ¥{(financialMetrics.netProfit / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                  MARGIN: {ratios.netMargin.toFixed(1)}%
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs text-zinc-500 tracking-wider mb-3">
                  CASH BALANCE
                </h3>
                <p className="text-3xl font-thin text-purple-500">
                  ¥{(financialMetrics.cashFlow / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-emerald-500 mt-2 tracking-wider">
                  HEALTHY LEVEL
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend */}
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    01
                  </span>
                  QUARTERLY PERFORMANCE
                </h3>
                <div className="space-y-4">
                  {quarterlyData.map((q) => (
                    <div key={q.quarter}>
                      <div className="flex justify-between text-xs mb-2 tracking-wider">
                        <span className="font-light text-zinc-400">
                          {q.quarter}
                        </span>
                        <span className="text-white">
                          ¥{(q.revenue / 1000000).toFixed(0)}M
                        </span>
                      </div>
                      <div className="bg-zinc-800 h-8">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-8 flex items-center justify-end pr-3"
                          style={{ width: `${(q.revenue / 35000000) * 100}%` }}
                        >
                          <span className="text-xs text-white font-light tracking-wider">
                            MARGIN {q.margin}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    02
                  </span>
                  DEPARTMENT REVENUE
                </h3>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div
                      key={dept.name}
                      className="border-b border-zinc-800 pb-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-light text-white tracking-wider flex items-center gap-3">
                          <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {dept.name}
                        </h4>
                        <span
                          className={`text-xs font-normal tracking-wider ${
                            dept.margin >= 25
                              ? 'text-emerald-500'
                              : 'text-amber-500'
                          }`}
                        >
                          {dept.margin}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-zinc-500 tracking-wider">
                            REVENUE
                          </p>
                          <p className="font-light text-white tracking-wider">
                            ¥{(dept.revenue / 1000000).toFixed(0)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 tracking-wider">COST</p>
                          <p className="font-light text-white tracking-wider">
                            ¥{(dept.cost / 1000000).toFixed(0)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 tracking-wider">PROFIT</p>
                          <p className="font-light text-emerald-500 tracking-wider">
                            ¥{(dept.profit / 1000000).toFixed(0)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Health Indicators */}
            <div className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 p-6">
              <h3 className="text-lg font-light text-blue-400 mb-6 tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 border border-blue-500/50 flex items-center justify-center text-blue-400 font-light text-xs">
                  03
                </span>
                FINANCIAL HEALTH INDICATORS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-black/50 border border-zinc-800 p-4">
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                    CURRENT RATIO
                  </h4>
                  <p className="text-2xl font-thin text-emerald-500">
                    {ratios.currentRatio}
                  </p>
                  <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                    BENCHMARK: 1.5+
                  </p>
                  <div className="mt-3 bg-zinc-800 h-1">
                    <div
                      className="bg-emerald-500 h-1"
                      style={{
                        width: `${Math.min((ratios.currentRatio / 2) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-4">
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                    EQUITY RATIO
                  </h4>
                  <p className="text-2xl font-thin text-blue-500">65%</p>
                  <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                    BENCHMARK: 40%+
                  </p>
                  <div className="mt-3 bg-zinc-800 h-1">
                    <div className="bg-blue-500 h-1" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-4">
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                    ROE
                  </h4>
                  <p className="text-2xl font-thin text-purple-500">
                    {ratios.roe.toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                    INDUSTRY AVG: 8%
                  </p>
                  <div className="mt-3 bg-zinc-800 h-1">
                    <div
                      className="bg-purple-500 h-1"
                      style={{
                        width: `${Math.min((ratios.roe / 10) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-4">
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                    D/E RATIO
                  </h4>
                  <p className="text-2xl font-thin text-amber-500">
                    {ratios.debtToEquity.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                    BENCHMARK: 1.0-
                  </p>
                  <div className="mt-3 bg-zinc-800 h-1">
                    <div
                      className="bg-amber-500 h-1"
                      style={{
                        width: `${Math.min(ratios.debtToEquity * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* P&L View */}
        {selectedView === 'pl' && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-lg font-light text-white mb-8 tracking-wider">
              PROFIT & LOSS STATEMENT
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                <span className="font-light text-zinc-400 tracking-wider">
                  REVENUE
                </span>
                <span className="font-light text-lg text-white tracking-wider">
                  ¥{(financialMetrics.revenue / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                <span className="font-light text-zinc-400 tracking-wider">
                  COST OF SALES
                </span>
                <span className="text-red-500 tracking-wider">
                  -¥{(financialMetrics.cost / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b-2 border-zinc-700">
                <span className="font-normal text-white tracking-wider">
                  GROSS PROFIT
                </span>
                <div className="text-right">
                  <p className="font-light text-lg text-white tracking-wider">
                    ¥{(financialMetrics.grossProfit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    MARGIN: {ratios.grossMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                <span className="font-light text-zinc-400 tracking-wider">
                  SG&A EXPENSES
                </span>
                <span className="text-red-500 tracking-wider">
                  -¥
                  {(
                    (financialMetrics.grossProfit -
                      financialMetrics.operatingProfit) /
                    1000000
                  ).toFixed(1)}
                  M
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b-2 border-zinc-700">
                <span className="font-normal text-white tracking-wider">
                  OPERATING PROFIT
                </span>
                <div className="text-right">
                  <p className="font-light text-lg text-emerald-500 tracking-wider">
                    ¥{(financialMetrics.operatingProfit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    MARGIN: {ratios.operatingMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                <span className="font-light text-zinc-400 tracking-wider">
                  NON-OPERATING INCOME
                </span>
                <span className="text-white tracking-wider">¥1.5M</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                <span className="font-light text-zinc-400 tracking-wider">
                  NON-OPERATING EXPENSES
                </span>
                <span className="text-red-500 tracking-wider">-¥0.5M</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b-2 border-zinc-700">
                <span className="font-normal text-white tracking-wider">
                  ORDINARY PROFIT
                </span>
                <span className="font-light text-lg text-white tracking-wider">
                  ¥16.0M
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                <span className="font-light text-zinc-400 tracking-wider">
                  CORPORATE TAX
                </span>
                <span className="text-red-500 tracking-wider">-¥4.0M</span>
              </div>
              <div className="flex justify-between items-center py-6 bg-blue-950/20 px-6 border border-blue-500/30">
                <span className="font-normal text-lg text-white tracking-wider">
                  NET PROFIT
                </span>
                <div className="text-right">
                  <p className="font-thin text-2xl text-blue-400 tracking-wider">
                    ¥{(financialMetrics.netProfit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    MARGIN: {ratios.netMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow View */}
        {selectedView === 'cashflow' && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-lg font-light text-white mb-8 tracking-wider">
              CASH FLOW STATEMENT
            </h3>
            <div className="space-y-6">
              <div className="border border-zinc-800 p-4">
                <h4 className="font-normal text-zinc-300 mb-4 tracking-wider">
                  OPERATING ACTIVITIES
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      PROFIT BEFORE TAX
                    </span>
                    <span className="text-white tracking-wider">¥16.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      DEPRECIATION
                    </span>
                    <span className="text-white tracking-wider">¥3.5M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      RECEIVABLES CHANGE
                    </span>
                    <span className="text-red-500 tracking-wider">-¥2.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      INVENTORY CHANGE
                    </span>
                    <span className="text-white tracking-wider">¥0.5M</span>
                  </div>
                  <div className="flex justify-between font-normal pt-3 border-t border-zinc-800">
                    <span className="text-white tracking-wider">
                      OPERATING CF TOTAL
                    </span>
                    <span className="text-emerald-500 tracking-wider">
                      ¥{(cashFlowData.operating / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 p-4">
                <h4 className="font-normal text-zinc-300 mb-4 tracking-wider">
                  INVESTING ACTIVITIES
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      FIXED ASSETS ACQUISITION
                    </span>
                    <span className="text-red-500 tracking-wider">-¥4.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      INTANGIBLE ASSETS
                    </span>
                    <span className="text-red-500 tracking-wider">-¥1.0M</span>
                  </div>
                  <div className="flex justify-between font-normal pt-3 border-t border-zinc-800">
                    <span className="text-white tracking-wider">
                      INVESTING CF TOTAL
                    </span>
                    <span className="text-red-500 tracking-wider">
                      ¥{(cashFlowData.investing / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 p-4">
                <h4 className="font-normal text-zinc-300 mb-4 tracking-wider">
                  FINANCING ACTIVITIES
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      LOAN REPAYMENT
                    </span>
                    <span className="text-red-500 tracking-wider">-¥5.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      DIVIDENDS PAID
                    </span>
                    <span className="text-red-500 tracking-wider">-¥3.0M</span>
                  </div>
                  <div className="flex justify-between font-normal pt-3 border-t border-zinc-800">
                    <span className="text-white tracking-wider">
                      FINANCING CF TOTAL
                    </span>
                    <span className="text-red-500 tracking-wider">
                      ¥{(cashFlowData.financing / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-950/20 border border-blue-500/30 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between font-normal">
                    <span className="text-zinc-300 tracking-wider">
                      NET CASH CHANGE
                    </span>
                    <span className="text-blue-400 tracking-wider">
                      ¥{(cashFlowData.netChange / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      BEGINNING CASH
                    </span>
                    <span className="text-white tracking-wider">
                      ¥{(cashFlowData.beginningCash / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between font-normal text-lg pt-3 border-t border-blue-500/30">
                    <span className="text-white tracking-wider">
                      ENDING CASH
                    </span>
                    <span className="text-blue-400 tracking-wider">
                      ¥{(cashFlowData.endingCash / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
