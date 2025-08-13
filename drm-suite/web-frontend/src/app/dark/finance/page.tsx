'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialData {
  id: string;
  date: string;
  category: 'revenue' | 'expense' | 'asset' | 'liability';
  subcategory: string;
  amount: number;
  description: string;
  projectId?: string;
  projectName?: string;
  isRecurring: boolean;
  status: 'confirmed' | 'pending' | 'projected';
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  operatingCashFlow: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currentRatio: number;
  revenueGrowth: number;
  expenseRatio: number;
  projectProfitability: number;
}

interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function DarkFinancePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    '1M' | '3M' | '6M' | '1Y' | 'ALL'
  >('6M');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'revenue' | 'expense' | 'cash-flow'
  >('all');
  const [viewMode, setViewMode] = useState<
    'dashboard' | 'statements' | 'analysis' | 'projections'
  >('dashboard');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Sample financial data
  const [financialData] = useState<FinancialData[]>([
    {
      id: 'F001',
      date: '2024-01-15',
      category: 'revenue',
      subcategory: 'PROJECT_COMPLETION',
      amount: 2530000,
      description: 'TANAKA RESIDENCE EXTERIOR PAINTING COMPLETION',
      projectId: 'P001',
      projectName: 'TANAKA RESIDENCE PROJECT',
      isRecurring: false,
      status: 'confirmed',
    },
    {
      id: 'F002',
      date: '2024-01-20',
      category: 'expense',
      subcategory: 'MATERIAL_COSTS',
      amount: 850000,
      description: 'PAINTING MATERIALS AND SUPPLIES',
      projectId: 'P001',
      projectName: 'TANAKA RESIDENCE PROJECT',
      isRecurring: false,
      status: 'confirmed',
    },
    {
      id: 'F003',
      date: '2024-01-25',
      category: 'expense',
      subcategory: 'LABOR_COSTS',
      amount: 1200000,
      description: 'CONTRACTOR AND WORKER PAYMENTS',
      isRecurring: false,
      status: 'confirmed',
    },
    {
      id: 'F004',
      date: '2024-01-30',
      category: 'revenue',
      subcategory: 'CONSULTATION_FEES',
      amount: 150000,
      description: 'ARCHITECTURAL CONSULTATION SERVICES',
      isRecurring: true,
      status: 'confirmed',
    },
    {
      id: 'F005',
      date: '2024-02-01',
      category: 'expense',
      subcategory: 'OVERHEAD',
      amount: 320000,
      description: 'OFFICE RENT AND UTILITIES',
      isRecurring: true,
      status: 'confirmed',
    },
    {
      id: 'F006',
      date: '2024-02-05',
      category: 'asset',
      subcategory: 'EQUIPMENT',
      amount: 480000,
      description: 'NEW CONSTRUCTION EQUIPMENT PURCHASE',
      isRecurring: false,
      status: 'confirmed',
    },
    {
      id: 'F007',
      date: '2024-02-10',
      category: 'revenue',
      subcategory: 'PROJECT_ADVANCE',
      amount: 1500000,
      description: 'ADVANCE PAYMENT FOR YAMADA BUILDING PROJECT',
      projectId: 'P002',
      projectName: 'YAMADA BUILDING RENOVATION',
      isRecurring: false,
      status: 'confirmed',
    },
  ]);

  // Sample chart data
  const [chartData] = useState<ChartDataPoint[]>([
    { month: 'AUG', revenue: 3200000, expenses: 2100000, profit: 1100000 },
    { month: 'SEP', revenue: 2800000, expenses: 1950000, profit: 850000 },
    { month: 'OCT', revenue: 4100000, expenses: 2650000, profit: 1450000 },
    { month: 'NOV', revenue: 3600000, expenses: 2200000, profit: 1400000 },
    { month: 'DEC', revenue: 4800000, expenses: 2900000, profit: 1900000 },
    { month: 'JAN', revenue: 5200000, expenses: 3100000, profit: 2100000 },
  ]);

  // Calculate financial metrics
  const metrics: FinancialMetrics = useMemo(() => {
    const revenue = financialData
      .filter(
        (item) => item.category === 'revenue' && item.status === 'confirmed',
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = financialData
      .filter(
        (item) => item.category === 'expense' && item.status === 'confirmed',
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const assets = financialData
      .filter((item) => item.category === 'asset')
      .reduce((sum, item) => sum + item.amount, 0);

    const liabilities = financialData
      .filter((item) => item.category === 'liability')
      .reduce((sum, item) => sum + item.amount, 0);

    const netProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const netWorth = assets - liabilities;
    const currentRatio = liabilities > 0 ? assets / liabilities : 0;

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      profitMargin,
      operatingCashFlow: netProfit + assets * 0.1, // Simplified calculation
      totalAssets: assets,
      totalLiabilities: liabilities,
      netWorth,
      currentRatio,
      revenueGrowth: 12.5, // Sample growth rate
      expenseRatio: revenue > 0 ? (expenses / revenue) * 100 : 0,
      projectProfitability: 85.2, // Sample profitability rate
    };
  }, [financialData]);

  const formatCurrency = (amount: number) =>
    `¥${Math.abs(amount).toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getMetricColor = (value: number, isGood: boolean) => {
    if (isGood) {
      return value > 0 ? 'text-emerald-500' : 'text-red-500';
    } else {
      return value < 0 ? 'text-emerald-500' : 'text-red-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'CONFIRMED',
        indicator: '01',
      },
      pending: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'PENDING',
        indicator: '02',
      },
      projected: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'PROJECTED',
        indicator: '03',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.confirmed;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'REVENUE';
      case 'expense':
        return 'EXPENSE';
      case 'asset':
        return 'ASSET';
      case 'liability':
        return 'LIABILITY';
      default:
        return category.toUpperCase();
    }
  };

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="mr-6 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <div>
                <h1 className="text-2xl font-thin text-white tracking-widest">
                  FINANCIAL ANALYSIS
                </h1>
                <p className="text-zinc-500 mt-1 text-xs tracking-wider">
                  COMPREHENSIVE FINANCIAL INTELLIGENCE • METRICS • FORECASTING
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="1M">1 MONTH</option>
                <option value="3M">3 MONTHS</option>
                <option value="6M">6 MONTHS</option>
                <option value="1Y">1 YEAR</option>
                <option value="ALL">ALL TIME</option>
              </select>
              <button className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                EXPORT REPORT
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex border border-zinc-800">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-6 py-3 text-xs tracking-wider transition-colors ${viewMode === 'dashboard' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              DASHBOARD
            </button>
            <button
              onClick={() => setViewMode('statements')}
              className={`px-6 py-3 text-xs tracking-wider transition-colors ${viewMode === 'statements' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              STATEMENTS
            </button>
            <button
              onClick={() => setViewMode('analysis')}
              className={`px-6 py-3 text-xs tracking-wider transition-colors ${viewMode === 'analysis' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              ANALYSIS
            </button>
            <button
              onClick={() => setViewMode('projections')}
              className={`px-6 py-3 text-xs tracking-wider transition-colors ${viewMode === 'projections' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              PROJECTIONS
            </button>
          </div>
        </div>

        {viewMode === 'dashboard' && (
          <>
            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      NET PROFIT
                    </p>
                    <p
                      className={`text-2xl font-thin ${getMetricColor(metrics.netProfit, true)}`}
                    >
                      {formatCurrency(metrics.netProfit)}
                    </p>
                    <p className="text-xs text-zinc-600 tracking-wider mt-1">
                      MARGIN: {formatPercentage(metrics.profitMargin)}
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    01
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      TOTAL REVENUE
                    </p>
                    <p className="text-2xl font-thin text-emerald-500">
                      {formatCurrency(metrics.totalRevenue)}
                    </p>
                    <p className="text-xs text-zinc-600 tracking-wider mt-1">
                      GROWTH: +{formatPercentage(metrics.revenueGrowth)}
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    02
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      OPERATING EXPENSES
                    </p>
                    <p className="text-2xl font-thin text-red-400">
                      {formatCurrency(metrics.totalExpenses)}
                    </p>
                    <p className="text-xs text-zinc-600 tracking-wider mt-1">
                      RATIO: {formatPercentage(metrics.expenseRatio)}
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    03
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      CASH FLOW
                    </p>
                    <p
                      className={`text-2xl font-thin ${getMetricColor(metrics.operatingCashFlow, true)}`}
                    >
                      {formatCurrency(metrics.operatingCashFlow)}
                    </p>
                    <p className="text-xs text-zinc-600 tracking-wider mt-1">
                      OPERATING
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    04
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Chart Visualization */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
              <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
                REVENUE & EXPENSE TRENDS
              </h3>
              <div className="h-64 relative">
                {/* Simple chart representation */}
                <div className="absolute inset-0 flex items-end justify-between px-4">
                  {chartData.map((data, index) => (
                    <div
                      key={data.month}
                      className="flex flex-col items-center space-y-2"
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {/* Revenue bar */}
                        <div
                          className="w-4 bg-emerald-500"
                          style={{
                            height: `${(data.revenue / 6000000) * 200}px`,
                          }}
                          title={`Revenue: ${formatCurrency(data.revenue)}`}
                        ></div>
                        {/* Expense bar */}
                        <div
                          className="w-4 bg-red-400"
                          style={{
                            height: `${(data.expenses / 6000000) * 200}px`,
                          }}
                          title={`Expenses: ${formatCurrency(data.expenses)}`}
                        ></div>
                      </div>
                      <p className="text-xs text-zinc-500 tracking-wider">
                        {data.month}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500"></div>
                  <span className="text-xs text-zinc-400 tracking-wider">
                    REVENUE
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400"></div>
                  <span className="text-xs text-zinc-400 tracking-wider">
                    EXPENSES
                  </span>
                </div>
              </div>
            </div>

            {/* Balance Sheet Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
                  BALANCE SHEET OVERVIEW
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      TOTAL ASSETS
                    </span>
                    <span className="text-sm text-emerald-500 tracking-wider">
                      {formatCurrency(metrics.totalAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      TOTAL LIABILITIES
                    </span>
                    <span className="text-sm text-red-400 tracking-wider">
                      {formatCurrency(metrics.totalLiabilities)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      NET WORTH
                    </span>
                    <span
                      className={`text-sm tracking-wider ${getMetricColor(metrics.netWorth, true)}`}
                    >
                      {formatCurrency(metrics.netWorth)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      CURRENT RATIO
                    </span>
                    <span className="text-sm text-white tracking-wider">
                      {metrics.currentRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
                  PROJECT PROFITABILITY
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      ACTIVE PROJECTS
                    </span>
                    <span className="text-sm text-white tracking-wider">8</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      COMPLETED PROJECTS
                    </span>
                    <span className="text-sm text-white tracking-wider">
                      24
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      AVERAGE MARGIN
                    </span>
                    <span className="text-sm text-emerald-500 tracking-wider">
                      {formatPercentage(metrics.projectProfitability)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      ROI
                    </span>
                    <span className="text-sm text-emerald-500 tracking-wider">
                      +{formatPercentage(32.7)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'statements' && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
              FINANCIAL TRANSACTIONS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                      DATE
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                      CATEGORY
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                      DESCRIPTION
                    </th>
                    <th className="px-6 py-4 text-right text-xs text-zinc-500 tracking-widest">
                      AMOUNT
                    </th>
                    <th className="px-6 py-4 text-center text-xs text-zinc-500 tracking-widest">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {financialData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs text-zinc-400 tracking-wider">
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <span className="text-xs text-white tracking-wider">
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-light text-white tracking-wider">
                          {item.description}
                        </div>
                        {item.projectName && (
                          <div className="text-xs text-zinc-500 tracking-wider mt-1">
                            PROJECT: {item.projectName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm tracking-wider ${
                            item.category === 'revenue' ||
                            item.category === 'asset'
                              ? 'text-emerald-500'
                              : 'text-red-400'
                          }`}
                        >
                          {item.category === 'expense' ||
                          item.category === 'liability'
                            ? '-'
                            : '+'}
                          {formatCurrency(item.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(viewMode === 'analysis' || viewMode === 'projections') && (
          <div className="bg-zinc-950 border border-zinc-800 p-16 text-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-2xl mx-auto mb-6">
              {viewMode === 'analysis' ? 'ANA' : 'PRO'}
            </div>
            <p className="text-zinc-500 mb-6 text-xs tracking-wider">
              {viewMode === 'analysis'
                ? 'ADVANCED FINANCIAL ANALYSIS FEATURES COMING SOON'
                : 'FINANCIAL PROJECTIONS AND FORECASTING TOOLS COMING SOON'}
            </p>
            <button className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
              REQUEST FEATURE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
