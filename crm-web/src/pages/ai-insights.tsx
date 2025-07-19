import { useState } from 'react';
import { mockProjects } from '@/lib/mock-data';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from 'recharts';

export default function AIInsightsPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState('risk');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI分析を実行（シミュレーション）
  const runAnalysis = () => {
    setIsAnalyzing(true);
    // setTimeout(() => {
    //   setIsAnalyzing(false);
    // }, 2000);
    // 即座に完了
    setIsAnalyzing(false);
  };

  // 工期遅延リスク分析データ
  const delayRiskData = mockProjects.map((project) => ({
    name: project.name.substring(0, 10),
    リスクスコア: Math.floor(Math.random() * 40 + 10),
    天候影響: Math.floor(Math.random() * 30),
    資材調達: Math.floor(Math.random() * 25),
    人員不足: Math.floor(Math.random() * 35),
    進捗状況: project.progress,
  }));

  // 収益予測データ（次6ヶ月）
  const revenueForecast = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    return {
      month: month.toLocaleDateString('ja-JP', { month: 'short' }),
      予測売上: Math.floor(Math.random() * 100 + 200) * 1000000,
      楽観シナリオ: Math.floor(Math.random() * 120 + 250) * 1000000,
      悲観シナリオ: Math.floor(Math.random() * 80 + 150) * 1000000,
      信頼区間: Math.floor(Math.random() * 20 + 80),
    };
  });

  // リソース最適化レーダーチャート
  const resourceOptimization = [
    { 項目: '人員配置', 現状: 65, 最適値: 90, 改善余地: 25 },
    { 項目: '機材稼働率', 現状: 70, 最適値: 85, 改善余地: 15 },
    { 項目: '工程効率', 現状: 60, 最適値: 88, 改善余地: 28 },
    { 項目: 'コスト管理', 現状: 75, 最適値: 92, 改善余地: 17 },
    { 項目: '品質スコア', 現状: 80, 最適値: 95, 改善余地: 15 },
    { 項目: '安全指標', 現状: 85, 最適値: 98, 改善余地: 13 },
  ];

  // AI推奨アクション
  const aiRecommendations = [
    {
      priority: 'high',
      title: '渋谷区M様邸の工期遅延リスク',
      description:
        '天候予報と過去データから、来週の作業に3日の遅延リスクを検出。代替工程の準備を推奨',
      impact: '契約履行率 +5%',
      action: '詳細分析を見る',
    },
    {
      priority: 'medium',
      title: '港区エリアの需要増加予測',
      description:
        '過去3ヶ月のトレンドから、港区での案件が25%増加する可能性。営業リソースの再配置を検討',
      impact: '売上 +¥15M/月',
      action: '営業戦略を調整',
    },
    {
      priority: 'medium',
      title: '協力会社Aの納期遅延パターン',
      description: '過去6ヶ月で平均2.3日の遅延。バッファを考慮した発注スケジュールへの変更を推奨',
      impact: '工期遵守率 +8%',
      action: '発注ルールを更新',
    },
    {
      priority: 'low',
      title: '在庫最適化の機会',
      description: '資材Xの在庫回転率が低下。発注量を15%削減しても供給に影響なし',
      impact: 'コスト -¥2M/月',
      action: '在庫設定を変更',
    },
  ];

  // 異常検知アラート
  const anomalies = [
    {
      time: '10:32',
      project: '新宿区K様ビル',
      type: '原価超過',
      severity: 'warning',
      value: '+12%',
    },
    {
      time: '09:15',
      project: '世田谷区S様邸',
      type: '進捗遅延',
      severity: 'critical',
      value: '-5日',
    },
    {
      time: '昨日',
      project: '練馬区O様アパート',
      type: '品質スコア低下',
      severity: 'info',
      value: '-8pt',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI予測分析</h1>
          <p className="text-gray-500 text-sm mt-1">機械学習による予測と最適化提案</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
            isAnalyzing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin">⚙️</span>
              分析中...
            </>
          ) : (
            <>
              <span>🤖</span>
              AI分析を実行
            </>
          )}
        </button>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow p-1">
        <div className="flex gap-1">
          {[
            { id: 'risk', label: '🚨 リスク分析', color: 'red' },
            { id: 'revenue', label: '💰 収益予測', color: 'green' },
            { id: 'resource', label: '⚡ リソース最適化', color: 'blue' },
            { id: 'anomaly', label: '🔍 異常検知', color: 'orange' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAnalysis(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                selectedAnalysis === tab.id
                  ? `bg-${tab.color}-50 text-${tab.color}-700 border-b-2 border-${tab.color}-500`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 分析コンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインチャート */}
        <div className="lg:col-span-2">
          {selectedAnalysis === 'risk' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">プロジェクト別遅延リスクスコア</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={delayRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="リスクスコア" fill="#ef4444" />
                  <Bar dataKey="天候影響" fill="#f59e0b" />
                  <Bar dataKey="資材調達" fill="#3b82f6" />
                  <Bar dataKey="人員不足" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>AI分析結果:</strong> 3つのプロジェクトで高リスクを検出。
                  特に天候影響による遅延確率が65%と予測されます。
                </p>
              </div>
            </div>
          )}

          {selectedAnalysis === 'revenue' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">売上予測（信頼区間付き）</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `¥${value / 1000000}M`} />
                  <Tooltip formatter={(value: any) => `¥${(value / 1000000).toFixed(1)}M`} />
                  <Area
                    type="monotone"
                    dataKey="悲観シナリオ"
                    stroke="#fca5a5"
                    fill="#fca5a5"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="予測売上"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="楽観シナリオ"
                    stroke="#93c5fd"
                    fill="#93c5fd"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>AI予測:</strong> 次四半期の売上は前年同期比+23%の成長が見込まれます。
                  信頼度: 87%
                </p>
              </div>
            </div>
          )}

          {selectedAnalysis === 'resource' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">リソース効率性分析</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={resourceOptimization}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="項目" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="現状"
                    dataKey="現状"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="最適値"
                    dataKey="最適値"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>最適化ポテンシャル:</strong> 全体で平均19%の効率改善が可能。
                  特に工程効率の改善により、月間¥8Mのコスト削減が見込まれます。
                </p>
              </div>
            </div>
          )}

          {selectedAnalysis === 'anomaly' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">異常検知ダッシュボード</h3>
              <div className="space-y-3">
                {anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      anomaly.severity === 'critical'
                        ? 'border-red-500 bg-red-50'
                        : anomaly.severity === 'warning'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{anomaly.project}</h4>
                        <p className="text-sm text-gray-600 mt-1">{anomaly.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{anomaly.value}</p>
                        <p className="text-xs text-gray-500">{anomaly.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-3">パターン分析</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={Array.from({ length: 24 }, (_, i) => ({
                      hour: i,
                      異常数: Math.floor(Math.random() * 10 + Math.sin(i / 4) * 5),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="異常数" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* サイドパネル - AI推奨アクション */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>💡</span>
              AI推奨アクション
            </h3>
            <div className="space-y-3">
              {aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high'
                      ? 'border-red-200 bg-red-50'
                      : rec.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-medium text-green-700">{rec.impact}</span>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      {rec.action} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AIスコアカード */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">AIパフォーマンススコア</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>予測精度</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>データ品質</span>
                  <span>88%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>学習進捗</span>
                  <span>76%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-xs mt-4 text-white/80">過去30日間で1,247件の予測を実施</p>
          </div>
        </div>
      </div>
    </div>
  );
}
