'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ExecutiveDashboardProps {
  userEmail: string;
}

export default function ExecutiveDashboard({
  userEmail,
}: ExecutiveDashboardProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
      message: '千葉支店の粗利率が3ヶ月連続低下',
      severity: 'high',
    },
    {
      type: 'payment',
      message: '回収遅延が30日を超えた案件: 3件',
      severity: 'high',
    },
    {
      type: 'inventory',
      message: '在庫回転率が目標を下回っています',
      severity: 'medium',
    },
  ];

  // 売上推移データ（6ヶ月）
  const revenueTrend = [
    { month: '4月', 売上: 95, 粗利: 21.4, キャッシュフロー: 35 },
    { month: '5月', 売上: 105, 粗利: 22.8, キャッシュフロー: 38 },
    { month: '6月', 売上: 110, 粗利: 23.5, キャッシュフロー: 40 },
    { month: '7月', 売上: 115, 粗利: 23.9, キャッシュフロー: 42 },
    { month: '8月', 売上: 118, 粗利: 24.0, キャッシュフロー: 43 },
    { month: '9月', 売上: 125, 粗利: 24.2, キャッシュフロー: 45 },
  ];

  // 部門別売上データ
  const departmentRevenueData = branchPerformance.map((branch) => ({
    name: branch.name,
    売上: branch.revenue / 1000000,
    粗利率: branch.profit,
  }));

  return (
    <div className="space-y-6">
      {/* 全社KPIダッシュボード */}
      <div className="bg-gradient-dandori text-white rounded-2xl shadow-xl p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">🏢 全社パフォーマンス</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white/80 text-sm">売上高</p>
            <p className="text-3xl font-bold">
              ¥{(companyKPI.totalRevenue / 1000000).toFixed(0)}M
            </p>
            <div className="mt-2 bg-white/20 rounded-full h-2">
              <div
                className="bg-dandori-yellow h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(companyKPI.totalRevenue / companyKPI.targetRevenue) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">
              目標比:{' '}
              {(
                (companyKPI.totalRevenue / companyKPI.targetRevenue) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm">粗利率</p>
            <p
              className={`text-3xl font-bold ${companyKPI.grossProfit >= companyKPI.targetProfit ? 'text-dandori-yellow' : 'text-dandori-pink'}`}
            >
              {companyKPI.grossProfit}%
            </p>
            <p className="text-xs text-white/60 mt-1">
              目標: {companyKPI.targetProfit}%
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm">キャッシュフロー</p>
            <p className="text-3xl font-bold text-dandori-sky">
              ¥{(companyKPI.cashFlow / 1000000).toFixed(0)}M
            </p>
            <p className="text-xs text-white/60 mt-1">健全</p>
          </div>
          <div className="bg-dandori-pink/20 backdrop-blur-sm p-3 rounded-xl border border-dandori-pink/30">
            <p className="text-white/80 text-sm">回収遅延</p>
            <p className="text-3xl font-bold text-white">
              {companyKPI.overduePayments}件
            </p>
            <p className="text-xs text-white/70 mt-1">要対応</p>
          </div>
        </div>
      </div>

      {/* 重要アラート */}
      {criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-dandori-pink/10 to-dandori-orange/10 border-l-4 border-dandori-pink rounded-xl p-4 backdrop-blur-sm">
          <h3 className="font-semibold text-dandori-blue-dark mb-3">
            ⚠️ 経営判断が必要な事項
          </h3>
          <div className="space-y-2">
            {criticalAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start">
                <span
                  className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-3 animate-pulse ${
                    alert.severity === 'high'
                      ? 'bg-dandori-pink'
                      : 'bg-dandori-orange'
                  }`}
                />
                <p className="text-sm text-gray-800">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 拠点別パフォーマンス */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">📍 拠点別パフォーマンス</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {branchPerformance.map((branch) => (
                  <div
                    key={branch.name}
                    className="border border-gray-200 rounded-xl p-4 hover:border-dandori-blue transition-colors duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {branch.name}
                        </h4>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">売上</p>
                            <p className="text-xl font-bold">
                              ¥{(branch.revenue / 1000000).toFixed(0)}M
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">粗利率</p>
                            <p
                              className={`text-xl font-bold ${
                                branch.profit >= 25
                                  ? 'text-dandori-blue'
                                  : branch.profit >= 22
                                    ? 'text-dandori-orange'
                                    : 'text-dandori-pink'
                              }`}
                            >
                              {branch.profit}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            branch.status === 'good'
                              ? 'bg-dandori-blue/10 text-dandori-blue'
                              : branch.status === 'normal'
                                ? 'bg-gray-100 text-gray-700'
                                : branch.status === 'warning'
                                  ? 'bg-dandori-yellow/20 text-dandori-orange'
                                  : 'bg-dandori-pink/10 text-dandori-pink'
                          }`}
                        >
                          {branch.status === 'good'
                            ? '好調'
                            : branch.status === 'normal'
                              ? '標準'
                              : branch.status === 'warning'
                                ? '要注意'
                                : '要改善'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          branch.profit >= 25
                            ? 'bg-gradient-to-r from-dandori-blue to-dandori-sky'
                            : branch.profit >= 22
                              ? 'bg-gradient-to-r from-dandori-yellow to-dandori-orange'
                              : 'bg-gradient-to-r from-dandori-pink to-dandori-orange'
                        }`}
                        style={{ width: `${(branch.profit / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 📈 売上推移グラフ */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                📈 売上・粗利推移（6ヶ月）
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="売上"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    name="売上 (M)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="粗利"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    name="粗利率 (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 📊 部門別売上グラフ */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">📊 部門別売上・粗利率</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="売上"
                    fill="#3b82f6"
                    name="売上 (M)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="粗利率"
                    fill="#10b981"
                    name="粗利率 (%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 統合財務分析ダッシュボード */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="font-semibold">📊 経営統合財務分析</h3>
            </div>
            <div className="p-6">
              {/* 主要財務指標 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2">
                    💰 収益性指標
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>営業利益率</span>
                      <span className="font-bold">24.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>総資産利益率</span>
                      <span className="font-bold">12.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>自己資本利益率</span>
                      <span className="font-bold">18.5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2">📈 成長指標</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>売上成長率</span>
                      <span className="font-bold text-green-600">+15.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>利益成長率</span>
                      <span className="font-bold text-green-600">+22.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>市場シェア</span>
                      <span className="font-bold">18.3%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h5 className="font-bold text-orange-800 mb-2">
                    ⚡ 効率指標
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>資産回転率</span>
                      <span className="font-bold">1.2回</span>
                    </div>
                    <div className="flex justify-between">
                      <span>在庫回転率</span>
                      <span className="font-bold">8.5回</span>
                    </div>
                    <div className="flex justify-between">
                      <span>売上債権回転率</span>
                      <span className="font-bold">6.2回</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 財政健全性 */}
              <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-indigo-800 mb-2">
                  💎 財政健全性
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>自己資本比率</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>流動比率</span>
                        <span>180%</span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '90%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>デット・エクイティ・レシオ</span>
                        <span>0.35</span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>インタレスト・カバレッジ</span>
                        <span>12.5倍</span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '95%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* クイックアクセス */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => router.push('/expenses/dashboard')}
                  className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition text-center"
                >
                  <div className="text-xl mb-1">💳</div>
                  <div className="text-xs font-medium">経費分析</div>
                </button>
                <button
                  onClick={() => {
                    alert('在庫管理画面へ移動します');
                    router.push('/inventory');
                  }}
                  className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <div className="text-xl mb-1">📦</div>
                  <div className="text-xs font-medium">在庫分析</div>
                </button>
                <button
                  onClick={() => setActiveModal('financial-analysis')}
                  className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-xs font-medium">財務分析</div>
                </button>
                <button
                  onClick={() => setActiveModal('strategy-analysis')}
                  className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
                >
                  <div className="text-xl mb-1">🎯</div>
                  <div className="text-xs font-medium">戦略分析</div>
                </button>
              </div>
            </div>
          </div>

          {/* 地図分析 */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                🗺️ 全社プロジェクト地図分析
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-dandori-blue/10 to-dandori-sky/10 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">進行中案件</p>
                    <p className="text-2xl font-bold text-dandori-blue">48件</p>
                  </div>
                  <div className="bg-gradient-to-br from-dandori-orange/10 to-dandori-yellow/10 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">エリア別収益</p>
                    <p className="text-2xl font-bold text-dandori-orange">
                      ¥125M
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert('地図分析画面を表示します');
                    router.push('/map');
                  }}
                  className="w-full bg-gradient-dandori text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  地図分析ダッシュボードを開く →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右サイドバー */}
        <div className="lg:col-span-1">
          {/* 顧客データベース */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <span className="text-2xl mr-2">👥</span>
                全社顧客データベース
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-3xl font-bold">458</p>
                  <p className="text-xs text-white/80">総顧客数</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-3xl font-bold">¥285M</p>
                  <p className="text-xs text-white/80">顧客価値</p>
                </div>
              </div>
              <button
                onClick={() => {
                  router.push('/customers');
                }}
                className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                顧客管理センターへ →
              </button>
            </div>
          </div>

          {/* マーケティング分析 */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <span className="text-2xl mr-2">📢</span>
                マーケティング分析
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-3xl font-bold">425%</p>
                  <p className="text-xs text-white/80">マーケROI</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-3xl font-bold">¥8.4K</p>
                  <p className="text-xs text-white/80">顧客獲得コスト</p>
                </div>
              </div>
              <button
                onClick={() => {
                  window.open('/dashboard/view-marketing', '_blank');
                }}
                className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                📊 マーケティングダッシュボード →
              </button>
            </div>
          </div>

          {/* 財務管理 */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white">
              <h3 className="font-semibold">💰 財務管理</h3>
            </div>
            <div className="p-4">
              {/* 経理ダッシュボードへのリンク */}
              <button
                onClick={() => {
                  window.open('/dashboard/view-accounting', '_blank');
                }}
                className="w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-bold text-lg">
                      📊 経理ダッシュボード
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                      財務詳細・入出金管理・決算情報
                    </div>
                  </div>
                  <div className="text-2xl">→</div>
                </div>
              </button>

              <div className="space-y-3">
                <button
                  onClick={() => setActiveModal('financial-analysis')}
                  className="w-full text-left bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 border border-purple-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-purple-900">
                        財務詳細分析
                      </p>
                      <p className="text-xs text-purple-600">P/L, B/S, CF</p>
                    </div>
                    <span className="text-purple-600 text-xl">📊</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveModal('strategy-analysis')}
                  className="w-full text-left bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-all duration-200 border border-indigo-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-indigo-900">戦略分析</p>
                      <p className="text-xs text-indigo-600">SWOT, 競合分析</p>
                    </div>
                    <span className="text-indigo-600 text-xl">🎯</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    alert('契約管理画面へ移動します');
                    router.push('/contracts');
                  }}
                  className="w-full text-left bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5 p-3 rounded-lg hover:from-dandori-blue/10 hover:to-dandori-sky/10 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">契約管理</p>
                      <p className="text-xs text-gray-600">5件の進行中</p>
                    </div>
                    <span className="text-dandori-blue">→</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    alert('入金管理画面へ移動します');
                    router.push('/payments');
                  }}
                  className="w-full text-left bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">入金管理</p>
                      <p className="text-xs text-gray-600">今月¥22M入金済</p>
                    </div>
                    <span className="text-green-600">→</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    router.push('/cost-management');
                  }}
                  className="w-full text-left bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg hover:from-orange-100 hover:to-yellow-100 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">原価管理</p>
                      <p className="text-xs text-gray-600">DW連携・予実管理</p>
                    </div>
                    <span className="text-orange-600">→</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    router.push('/approvals');
                  }}
                  className="w-full text-left bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">承認管理</p>
                      <p className="text-xs text-gray-600">
                        見積・契約・発注・請求
                      </p>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    router.push('/construction-ledgers');
                  }}
                  className="w-full text-left bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">工事台帳</p>
                      <p className="text-xs text-gray-600">
                        進捗・原価・収支管理
                      </p>
                    </div>
                    <span className="text-purple-600">→</span>
                  </div>
                </button>
              </div>
              <div className="mt-4 p-3 bg-dandori-pink/5 rounded-lg border border-dandori-pink/20">
                <p className="text-xs font-medium text-dandori-pink mb-1">
                  ⚠️ 要確認
                </p>
                <p className="text-xs text-gray-700">
                  期限超過の請求が3件あります
                </p>
              </div>
            </div>
          </div>

          {/* 経営分析RAG */}
          <div className="bg-white rounded-2xl shadow-lg sticky top-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-warm text-white">
              <h3 className="font-semibold">🤖 経営分析AI</h3>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-br from-dandori-blue/5 to-dandori-sky/5 p-4 rounded-xl mb-4 border border-dandori-blue/10">
                <p className="text-sm font-medium text-dandori-blue-dark mb-2">
                  💡 本日の分析提案
                </p>
                <div className="space-y-2 text-xs text-dandori-blue">
                  <p>• 千葉支店の粗利低下要因を分析</p>
                  <p>• 回収遅延案件の共通パターン抽出</p>
                  <p>• 来月の資金繰り予測</p>
                </div>
                <button
                  onClick={() => setActiveModal('analysis-report')}
                  className="mt-3 w-full bg-gradient-dandori text-white py-2 rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  分析レポート生成
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  経営に関する質問
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-dandori-blue focus:ring-2 focus:ring-dandori-blue/20 transition-all duration-200"
                  rows={3}
                  placeholder="例: 粗利率を25%に改善するための施策は？"
                />
                <button
                  onClick={() => setActiveModal('ai-consultation')}
                  className="mt-2 w-full bg-gradient-warm text-white py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                >
                  AIに相談
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  クイック分析
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveModal('year-comparison')}
                    className="w-full text-left text-sm bg-gray-50 p-2 rounded-lg hover:bg-dandori-blue/5 hover:text-dandori-blue transition-colors duration-200"
                  >
                    前年同期比較
                  </button>
                  <button
                    onClick={() => setActiveModal('competitor-benchmark')}
                    className="w-full text-left text-sm bg-gray-50 p-2 rounded-lg hover:bg-dandori-blue/5 hover:text-dandori-blue transition-colors duration-200"
                  >
                    競合ベンチマーク
                  </button>
                  <button
                    onClick={() => setActiveModal('scenario-analysis')}
                    className="w-full text-left text-sm bg-gray-50 p-2 rounded-lg hover:bg-dandori-blue/5 hover:text-dandori-blue transition-colors duration-200"
                  >
                    シナリオ分析
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">
                {activeModal === 'financial-analysis'
                  ? '財務分析レポート'
                  : activeModal === 'strategy-analysis'
                    ? '戦略分析ダッシュボード'
                    : activeModal === 'analysis-report'
                      ? 'AI分析レポート生成'
                      : activeModal === 'ai-consultation'
                        ? 'AI経営コンサルタント'
                        : activeModal === 'year-comparison'
                          ? '前年同期比較分析'
                          : activeModal === 'competitor-benchmark'
                            ? '競合ベンチマーク分析'
                            : activeModal === 'scenario-analysis'
                              ? 'シナリオ分析'
                              : 'データ詳細'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {activeModal === 'financial-analysis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <h4 className="font-bold text-purple-800 mb-3">
                        💰 財務健全性スコア
                      </h4>
                      <div className="text-center">
                        <div className="text-5xl font-bold text-purple-600 mb-2">
                          A+
                        </div>
                        <div className="text-sm text-purple-700">
                          総合評価: 92/100
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>流動比率</span>
                          <span className="font-bold text-green-600">
                            2.8 (優良)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>自己資本比率</span>
                          <span className="font-bold text-green-600">
                            68% (安定)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>有利子負債比率</span>
                          <span className="font-bold text-blue-600">
                            15% (低リスク)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-3">
                        📈 成長性指標
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>売上成長率</span>
                            <span className="text-green-600">+18.5%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: '85%' }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>利益成長率</span>
                            <span className="text-green-600">+22.3%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: '92%' }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>ROE</span>
                            <span className="text-blue-600">15.8%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: '79%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-bold mb-3">📊 四半期トレンド分析</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {['Q1', 'Q2', 'Q3', 'Q4(予測)'].map((quarter, idx) => (
                        <div key={quarter} className="text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            {quarter}
                          </p>
                          <p className="text-xl font-bold">¥{28 + idx * 3}M</p>
                          <p
                            className={`text-xs ${idx < 3 ? 'text-green-600' : 'text-blue-600'}`}
                          >
                            {idx < 3 ? `+${12 + idx * 2}%` : '予測 +15%'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium">
                    詳細レポートをダウンロード →
                  </button>
                </div>
              )}

              {activeModal === 'strategy-analysis' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-3">
                      🎯 戦略目標達成状況
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">新規顧客獲得</span>
                          <span className="text-sm font-bold">85/100社</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: '85%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">市場シェア拡大</span>
                          <span className="text-sm font-bold">
                            12.3% → 14.8%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: '74%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">デジタル化推進</span>
                          <span className="text-sm font-bold">62%完了</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-yellow-500 h-3 rounded-full"
                            style={{ width: '62%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-bold mb-3 text-green-700">
                        ✅ 強み (Strengths)
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• 高い顧客満足度 (4.8/5.0)</li>
                        <li>• 強固な財務基盤</li>
                        <li>• 熟練した技術チーム</li>
                        <li>• 地域ネットワーク</li>
                      </ul>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-bold mb-3 text-yellow-700">
                        ⚠️ 弱み (Weaknesses)
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• デジタル化の遅れ</li>
                        <li>• 若手人材の不足</li>
                        <li>• 新規市場開拓力</li>
                        <li>• マーケティング力</li>
                      </ul>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-bold mb-3 text-blue-700">
                        🎯 機会 (Opportunities)
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• リフォーム市場拡大</li>
                        <li>• SDGs関連需要</li>
                        <li>• 補助金・助成金活用</li>
                        <li>• 異業種連携</li>
                      </ul>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-bold mb-3 text-red-700">
                        🚨 脅威 (Threats)
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• 材料費高騰</li>
                        <li>• 人手不足深刻化</li>
                        <li>• 大手参入増加</li>
                        <li>• 需要の季節変動</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                      戦略計画書を作成 →
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium">
                      アクションプラン策定 →
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'ai-consultation' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-3">
                      🤖 AI経営アドバイザー
                    </h4>
                    <p className="text-sm text-purple-700">
                      最新のデータ分析に基づいた経営改善提案をご提供します
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border-l-4 border-blue-500 p-4 rounded">
                      <h5 className="font-bold text-blue-800 mb-2">
                        💡 優先度：高
                      </h5>
                      <p className="font-medium mb-2">千葉支店の収益性改善</p>
                      <p className="text-sm text-gray-600 mb-3">
                        粗利率が3ヶ月連続で低下しています。原因分析の結果、以下の施策を推奨します：
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• 原価管理システムの見直し</li>
                        <li>• 仕入先の再交渉（目標: 5%削減）</li>
                        <li>• 付加価値サービスの導入</li>
                      </ul>
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-700">
                          予想効果: 粗利率 +2.3% (年間+¥8.5M)
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border-l-4 border-yellow-500 p-4 rounded">
                      <h5 className="font-bold text-yellow-800 mb-2">
                        ⚡ 優先度：中
                      </h5>
                      <p className="font-medium mb-2">キャッシュフロー最適化</p>
                      <p className="text-sm text-gray-600 mb-3">
                        売掛金回収サイクルを改善することで、資金繰りを向上させることができます：
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• 早期支払い割引の導入（2%/10日）</li>
                        <li>• 自動督促システムの導入</li>
                        <li>• 与信管理の強化</li>
                      </ul>
                      <div className="mt-3 p-2 bg-yellow-50 rounded">
                        <p className="text-xs text-yellow-700">
                          予想効果: 回収日数 -5日 (資金+¥12M)
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border-l-4 border-green-500 p-4 rounded">
                      <h5 className="font-bold text-green-800 mb-2">
                        🌱 優先度：長期
                      </h5>
                      <p className="font-medium mb-2">新規事業機会</p>
                      <p className="text-sm text-gray-600 mb-3">
                        市場分析により、以下の成長機会を特定しました：
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• エコリフォーム市場への参入</li>
                        <li>• サブスクリプション型メンテナンスサービス</li>
                        <li>• BtoB向けコンサルティング事業</li>
                      </ul>
                      <div className="mt-3 p-2 bg-green-50 rounded">
                        <p className="text-xs text-green-700">
                          予想市場規模: ¥500M (シェア10%獲得で+¥50M)
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium">
                    詳細な実行計画を生成 →
                  </button>
                </div>
              )}

              {activeModal === 'year-comparison' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-indigo-800 mb-3">
                      📊 前年同期比較分析
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-bold mb-3">2023年 Q4</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>売上高</span>
                          <span className="font-bold">¥105M</span>
                        </div>
                        <div className="flex justify-between">
                          <span>営業利益</span>
                          <span className="font-bold">¥21M</span>
                        </div>
                        <div className="flex justify-between">
                          <span>粗利率</span>
                          <span className="font-bold">22.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>顧客数</span>
                          <span className="font-bold">285社</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold mb-3">2024年 Q4</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>売上高</span>
                          <span className="font-bold text-green-600">
                            ¥125M (+19%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>営業利益</span>
                          <span className="font-bold text-green-600">
                            ¥30M (+43%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>粗利率</span>
                          <span className="font-bold text-green-600">
                            24.2% (+1.7pt)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>顧客数</span>
                          <span className="font-bold text-green-600">
                            342社 (+20%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-bold mb-3">📈 改善要因分析</h5>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>
                          新規顧客獲得キャンペーンによる売上増加 (+¥12M)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>原価削減プロジェクトの成功 (材料費-8%)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>生産性向上による労務費削減 (-¥3M)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2">△</span>
                        <span>マーケティング費用増加 (+¥2M)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeModal === 'competitor-benchmark' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-orange-800 mb-3">
                      🏆 競合ベンチマーク分析
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3 border">指標</th>
                          <th className="text-center p-3 border">自社</th>
                          <th className="text-center p-3 border">A社</th>
                          <th className="text-center p-3 border">B社</th>
                          <th className="text-center p-3 border">業界平均</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 border font-medium">市場シェア</td>
                          <td className="text-center p-3 border font-bold text-green-600">
                            14.8%
                          </td>
                          <td className="text-center p-3 border">18.2%</td>
                          <td className="text-center p-3 border">12.5%</td>
                          <td className="text-center p-3 border">8.3%</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 border font-medium">売上成長率</td>
                          <td className="text-center p-3 border font-bold text-green-600">
                            +19%
                          </td>
                          <td className="text-center p-3 border">+12%</td>
                          <td className="text-center p-3 border">+15%</td>
                          <td className="text-center p-3 border">+8%</td>
                        </tr>
                        <tr>
                          <td className="p-3 border font-medium">粗利率</td>
                          <td className="text-center p-3 border font-bold text-yellow-600">
                            24.2%
                          </td>
                          <td className="text-center p-3 border">26.5%</td>
                          <td className="text-center p-3 border">22.8%</td>
                          <td className="text-center p-3 border">21.5%</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-3 border font-medium">顧客満足度</td>
                          <td className="text-center p-3 border font-bold text-green-600">
                            4.8/5
                          </td>
                          <td className="text-center p-3 border">4.5/5</td>
                          <td className="text-center p-3 border">4.6/5</td>
                          <td className="text-center p-3 border">4.2/5</td>
                        </tr>
                        <tr>
                          <td className="p-3 border font-medium">
                            デジタル化率
                          </td>
                          <td className="text-center p-3 border font-bold text-red-600">
                            62%
                          </td>
                          <td className="text-center p-3 border">85%</td>
                          <td className="text-center p-3 border">78%</td>
                          <td className="text-center p-3 border">55%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-bold mb-3">💡 競争優位性の構築提案</h5>
                    <ul className="text-sm space-y-2">
                      <li>• デジタル化投資を加速し、A社との差を縮める</li>
                      <li>• 顧客満足度の高さを活かしたリファラル戦略</li>
                      <li>• 粗利率改善のためのバリューチェーン最適化</li>
                      <li>• ニッチ市場でのリーダーシップ確立</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeModal === 'scenario-analysis' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-cyan-800 mb-3">
                      🔮 シナリオ分析
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-bold text-green-800 mb-2">
                        楽観シナリオ
                      </h5>
                      <p className="text-xs text-green-600 mb-3">
                        発生確率: 25%
                      </p>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">前提条件:</p>
                        <ul className="text-xs space-y-1">
                          <li>• 市場成長 +15%</li>
                          <li>• 新規事業成功</li>
                          <li>• 材料費安定</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="font-bold text-green-700">
                            売上: ¥168M
                          </p>
                          <p className="font-bold text-green-700">利益: ¥42M</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-bold text-blue-800 mb-2">
                        基本シナリオ
                      </h5>
                      <p className="text-xs text-blue-600 mb-3">
                        発生確率: 60%
                      </p>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">前提条件:</p>
                        <ul className="text-xs space-y-1">
                          <li>• 市場成長 +5%</li>
                          <li>• 現状維持</li>
                          <li>• 材料費微増</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="font-bold text-blue-700">売上: ¥145M</p>
                          <p className="font-bold text-blue-700">利益: ¥35M</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-bold text-red-800 mb-2">
                        悲観シナリオ
                      </h5>
                      <p className="text-xs text-red-600 mb-3">発生確率: 15%</p>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">前提条件:</p>
                        <ul className="text-xs space-y-1">
                          <li>• 市場縮小 -5%</li>
                          <li>• 競争激化</li>
                          <li>• 材料費高騰</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="font-bold text-red-700">売上: ¥118M</p>
                          <p className="font-bold text-red-700">利益: ¥22M</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-bold mb-3">🛡️ リスク対策計画</h5>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>コスト削減プログラムの準備（目標: -15%）</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>代替仕入先の確保とサプライチェーン多様化</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>手元流動性の確保（3ヶ月分の運転資金）</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>新規市場開拓による収益源の分散</span>
                      </li>
                    </ul>
                  </div>

                  <button className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 font-medium">
                    詳細シミュレーションを実行 →
                  </button>
                </div>
              )}

              {activeModal === 'analysis-report' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-indigo-800 mb-3">
                      📝 AI分析レポート生成
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-bold mb-3">
                        📊 利用可能なレポートテンプレート
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            router.push('/analytics/customer-revenue')
                          }
                          className="p-3 border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 text-left transition-all"
                        >
                          <div className="font-medium text-blue-900">
                            💰 顧客別収益分析
                          </div>
                          <div className="text-xs text-blue-600">
                            売上・粗利・LTV・成長率
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            router.push('/analytics/profitability')
                          }
                          className="p-3 border-2 border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 text-left transition-all"
                        >
                          <div className="font-medium text-purple-900">
                            📊 利益率分析
                          </div>
                          <div className="text-xs text-purple-600">
                            プロジェクト別・工種別利益率
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            router.push('/analytics/sales-performance')
                          }
                          className="p-3 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 text-left transition-all"
                        >
                          <div className="font-medium text-green-900">
                            📈 営業パフォーマンス分析
                          </div>
                          <div className="text-xs text-green-600">
                            担当者別受注・パイプライン
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            router.push('/analytics/win-prediction')
                          }
                          className="p-3 border-2 border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 text-left transition-all"
                        >
                          <div className="font-medium text-orange-900">
                            🤖 AI受注予測分析
                          </div>
                          <div className="text-xs text-orange-600">
                            機械学習による受注確度予測
                          </div>
                        </button>
                        <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
                          <div className="font-medium">月次経営レポート</div>
                          <div className="text-xs text-gray-500">
                            全社KPI、財務、営業分析
                          </div>
                        </button>
                        <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
                          <div className="font-medium">拠点別分析レポート</div>
                          <div className="text-xs text-gray-500">
                            各拠点のパフォーマンス比較
                          </div>
                        </button>
                        <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
                          <div className="font-medium">市場動向レポート</div>
                          <div className="text-xs text-gray-500">
                            競合分析、トレンド予測
                          </div>
                        </button>
                        <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
                          <div className="font-medium">リスク評価レポート</div>
                          <div className="text-xs text-gray-500">
                            潜在リスクと対策提案
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="font-bold mb-3">
                        ⚙️ カスタムレポート設定
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            分析期間
                          </label>
                          <select className="w-full p-2 border rounded">
                            <option>直近1ヶ月</option>
                            <option>直近3ヶ月</option>
                            <option>直近6ヶ月</option>
                            <option>年初来</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            重点分析項目
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                defaultChecked
                              />
                              <span className="text-sm">財務分析</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                defaultChecked
                              />
                              <span className="text-sm">顧客分析</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-2" />
                              <span className="text-sm">競合分析</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-2" />
                              <span className="text-sm">市場予測</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium">
                      レポート生成開始 →
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium">
                      定期配信設定 →
                    </button>
                  </div>
                </div>
              )}

              {![
                'financial-analysis',
                'strategy-analysis',
                'ai-consultation',
                'year-comparison',
                'competitor-benchmark',
                'scenario-analysis',
                'analysis-report',
              ].includes(activeModal) && (
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">{activeModal}の詳細</p>
                  <p className="text-sm mt-2">このセクションは現在開発中です</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
