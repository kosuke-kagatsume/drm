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
                  onClick={() => router.push('/map')}
                  className="w-full bg-gradient-dandori text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  地図分析ダッシュボードを開く →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 財務管理 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white">
              <h3 className="font-semibold">💰 財務管理</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/contracts')}
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
                  onClick={() => router.push('/invoices')}
                  className="w-full text-left bg-gradient-to-r from-dandori-orange/5 to-dandori-yellow/5 p-3 rounded-lg hover:from-dandori-orange/10 hover:to-dandori-yellow/10 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">請求書管理</p>
                      <p className="text-xs text-gray-600">3件の未入金</p>
                    </div>
                    <span className="text-dandori-orange">→</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/payments')}
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
                <button className="mt-3 w-full bg-gradient-dandori text-white py-2 rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200">
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
                <button className="mt-2 w-full bg-gradient-warm text-white py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm">
                  AIに相談
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  クイック分析
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm bg-gray-50 p-2 rounded-lg hover:bg-dandori-blue/5 hover:text-dandori-blue transition-colors duration-200">
                    前年同期比較
                  </button>
                  <button className="w-full text-left text-sm bg-gray-50 p-2 rounded-lg hover:bg-dandori-blue/5 hover:text-dandori-blue transition-colors duration-200">
                    競合ベンチマーク
                  </button>
                  <button className="w-full text-left text-sm bg-gray-50 p-2 rounded-lg hover:bg-dandori-blue/5 hover:text-dandori-blue transition-colors duration-200">
                    シナリオ分析
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
