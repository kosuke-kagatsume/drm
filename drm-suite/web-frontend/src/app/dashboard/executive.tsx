'use client';

interface ExecutiveDashboardProps {
  userEmail: string;
}

export default function ExecutiveDashboard({
  userEmail,
}: ExecutiveDashboardProps) {
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
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold mb-6">🏢 全社パフォーマンス</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-300 text-sm">売上高</p>
            <p className="text-3xl font-bold">
              ¥{(companyKPI.totalRevenue / 1000000).toFixed(0)}M
            </p>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(companyKPI.totalRevenue / companyKPI.targetRevenue) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              目標比:{' '}
              {(
                (companyKPI.totalRevenue / companyKPI.targetRevenue) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div>
            <p className="text-gray-300 text-sm">粗利率</p>
            <p
              className={`text-3xl font-bold ${companyKPI.grossProfit >= companyKPI.targetProfit ? 'text-green-400' : 'text-red-400'}`}
            >
              {companyKPI.grossProfit}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              目標: {companyKPI.targetProfit}%
            </p>
          </div>
          <div>
            <p className="text-gray-300 text-sm">キャッシュフロー</p>
            <p className="text-3xl font-bold text-blue-400">
              ¥{(companyKPI.cashFlow / 1000000).toFixed(0)}M
            </p>
            <p className="text-xs text-gray-400 mt-1">健全</p>
          </div>
          <div className="bg-red-900/50 p-3 rounded">
            <p className="text-red-300 text-sm">回収遅延</p>
            <p className="text-3xl font-bold text-red-400">
              {companyKPI.overduePayments}件
            </p>
            <p className="text-xs text-red-300 mt-1">要対応</p>
          </div>
        </div>
      </div>

      {/* 重要アラート */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-3">
            ⚠️ 経営判断が必要な事項
          </h3>
          <div className="space-y-2">
            {criticalAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start">
                <span
                  className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-3 ${
                    alert.severity === 'high' ? 'bg-red-600' : 'bg-orange-500'
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">📍 拠点別パフォーマンス</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {branchPerformance.map((branch) => (
                  <div key={branch.name} className="border rounded-lg p-4">
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
                                  ? 'text-green-600'
                                  : branch.profit >= 22
                                    ? 'text-orange-600'
                                    : 'text-red-600'
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
                              ? 'bg-green-100 text-green-800'
                              : branch.status === 'normal'
                                ? 'bg-gray-100 text-gray-800'
                                : branch.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
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
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          branch.profit >= 25
                            ? 'bg-green-500'
                            : branch.profit >= 22
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(branch.profit / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* トレンドチャート（プレースホルダー） */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">📈 売上・粗利トレンド</h2>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">
                  グラフエリア（Chart.js等で実装）
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 経営分析RAG */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow sticky top-6">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h3 className="font-semibold">🤖 経営分析AI</h3>
            </div>
            <div className="p-4">
              <div className="bg-indigo-50 p-4 rounded mb-4">
                <p className="text-sm font-medium text-indigo-900 mb-2">
                  💡 本日の分析提案
                </p>
                <div className="space-y-2 text-xs text-indigo-700">
                  <p>• 千葉支店の粗利低下要因を分析</p>
                  <p>• 回収遅延案件の共通パターン抽出</p>
                  <p>• 来月の資金繰り予測</p>
                </div>
                <button className="mt-3 w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700">
                  分析レポート生成
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  経営に関する質問
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                  placeholder="例: 粗利率を25%に改善するための施策は？"
                />
                <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm">
                  AIに相談
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  クイック分析
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm bg-gray-50 p-2 rounded hover:bg-gray-100">
                    前年同期比較
                  </button>
                  <button className="w-full text-left text-sm bg-gray-50 p-2 rounded hover:bg-gray-100">
                    競合ベンチマーク
                  </button>
                  <button className="w-full text-left text-sm bg-gray-50 p-2 rounded hover:bg-gray-100">
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
