'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function FinanceAnalysisPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current_quarter');
  const [selectedView, setSelectedView] = useState('overview');

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
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
      name: '外壁塗装事業',
      revenue: 75000000,
      cost: 52500000,
      profit: 22500000,
      margin: 30,
    },
    {
      name: '屋根工事事業',
      revenue: 35000000,
      cost: 26250000,
      profit: 8750000,
      margin: 25,
    },
    {
      name: 'リフォーム事業',
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← ダッシュボード
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 財務詳細分析
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current_month">今月</option>
                <option value="current_quarter">今四半期</option>
                <option value="current_year">今年度</option>
                <option value="last_year">前年度</option>
              </select>

              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                📥 レポート出力
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex space-x-1 p-1">
            {['overview', 'pl', 'bs', 'cashflow', 'ratios', 'segment'].map(
              (view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    selectedView === view
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {view === 'overview' && '概要'}
                  {view === 'pl' && '損益計算書'}
                  {view === 'bs' && '貸借対照表'}
                  {view === 'cashflow' && 'キャッシュフロー'}
                  {view === 'ratios' && '財務比率'}
                  {view === 'segment' && 'セグメント分析'}
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
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  売上高
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  ¥{(financialMetrics.revenue / 1000000).toFixed(0)}M
                </p>
                <p className="text-sm text-green-600 mt-1">+15.2% 前年比</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  営業利益
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ¥{(financialMetrics.operatingProfit / 1000000).toFixed(0)}M
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  利益率: {ratios.operatingMargin.toFixed(1)}%
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  純利益
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{(financialMetrics.netProfit / 1000000).toFixed(0)}M
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  利益率: {ratios.netMargin.toFixed(1)}%
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  現金残高
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  ¥{(financialMetrics.cashFlow / 1000000).toFixed(0)}M
                </p>
                <p className="text-sm text-green-600 mt-1">健全な水準</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">四半期別業績推移</h3>
                <div className="space-y-4">
                  {quarterlyData.map((q) => (
                    <div key={q.quarter}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{q.quarter}</span>
                        <span>¥{(q.revenue / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-8">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${(q.revenue / 35000000) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            利益率 {q.margin}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">事業部門別収益</h3>
                <div className="space-y-4">
                  {departmentData.map((dept) => (
                    <div key={dept.name} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {dept.name}
                        </h4>
                        <span
                          className={`text-sm font-bold ${
                            dept.margin >= 25
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {dept.margin}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">売上</p>
                          <p className="font-bold">
                            ¥{(dept.revenue / 1000000).toFixed(0)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">原価</p>
                          <p className="font-bold">
                            ¥{(dept.cost / 1000000).toFixed(0)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">利益</p>
                          <p className="font-bold text-green-600">
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                🏥 財務健全性指標
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    流動比率
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {ratios.currentRatio}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">基準値: 1.5以上</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((ratios.currentRatio / 2) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    自己資本比率
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">65%</p>
                  <p className="text-xs text-gray-600 mt-1">基準値: 40%以上</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    ROE
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {ratios.roe.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">業界平均: 8%</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((ratios.roe / 10) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    D/Eレシオ
                  </h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {ratios.debtToEquity.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">基準値: 1.0以下</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">損益計算書</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">売上高</span>
                <span className="font-bold text-lg">
                  ¥{(financialMetrics.revenue / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">売上原価</span>
                <span className="text-red-600">
                  -¥{(financialMetrics.cost / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                <span className="font-bold">売上総利益</span>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ¥{(financialMetrics.grossProfit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">
                    利益率: {ratios.grossMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">販売費及び一般管理費</span>
                <span className="text-red-600">
                  -¥
                  {(
                    (financialMetrics.grossProfit -
                      financialMetrics.operatingProfit) /
                    1000000
                  ).toFixed(1)}
                  M
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                <span className="font-bold">営業利益</span>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    ¥{(financialMetrics.operatingProfit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">
                    利益率: {ratios.operatingMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">営業外収益</span>
                <span>¥1.5M</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">営業外費用</span>
                <span className="text-red-600">-¥0.5M</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                <span className="font-bold">経常利益</span>
                <span className="font-bold text-lg">¥16.0M</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">法人税等</span>
                <span className="text-red-600">-¥4.0M</span>
              </div>
              <div className="flex justify-between items-center py-4 bg-blue-50 px-4 rounded">
                <span className="font-bold text-lg">当期純利益</span>
                <div className="text-right">
                  <p className="font-bold text-2xl text-blue-600">
                    ¥{(financialMetrics.netProfit / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">
                    利益率: {ratios.netMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow View */}
        {selectedView === 'cashflow' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">
              キャッシュフロー計算書
            </h3>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  営業活動によるキャッシュフロー
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>税引前当期純利益</span>
                    <span>¥16.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>減価償却費</span>
                    <span>¥3.5M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>売上債権の増減</span>
                    <span className="text-red-600">-¥2.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>棚卸資産の増減</span>
                    <span>¥0.5M</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>営業CF計</span>
                    <span className="text-green-600">
                      ¥{(cashFlowData.operating / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  投資活動によるキャッシュフロー
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>有形固定資産の取得</span>
                    <span className="text-red-600">-¥4.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>無形固定資産の取得</span>
                    <span className="text-red-600">-¥1.0M</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>投資CF計</span>
                    <span className="text-red-600">
                      ¥{(cashFlowData.investing / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  財務活動によるキャッシュフロー
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>長期借入金の返済</span>
                    <span className="text-red-600">-¥5.0M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>配当金の支払</span>
                    <span className="text-red-600">-¥3.0M</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>財務CF計</span>
                    <span className="text-red-600">
                      ¥{(cashFlowData.financing / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>現金等の増減額</span>
                    <span className="text-blue-600">
                      ¥{(cashFlowData.netChange / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>現金等の期首残高</span>
                    <span>
                      ¥{(cashFlowData.beginningCash / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
                    <span>現金等の期末残高</span>
                    <span className="text-blue-600">
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
