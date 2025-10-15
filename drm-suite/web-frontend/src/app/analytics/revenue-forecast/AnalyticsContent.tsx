'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  AlertCircle,
  Target,
  Percent,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface RevenueForecast {
  month: string;
  year: number;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  confidence: number;
}

interface Stats {
  trendSlope: number;
  growthRate: string;
  averageRevenue: number;
  standardDeviation: number;
  forecastPeriod: number;
  totalRealisticForecast: number;
  totalOptimisticForecast: number;
  totalPessimisticForecast: number;
  averageConfidence: number;
}

export default function RevenueForecastPage() {
  const router = useRouter();
  const [historicalData, setHistoricalData] = useState<MonthlyRevenue[]>([]);
  const [forecasts, setForecasts] = useState<RevenueForecast[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<
    'all' | 'optimistic' | 'realistic' | 'pessimistic'
  >('all');

  useEffect(() => {
    fetchRevenueForecast();
  }, []);

  const fetchRevenueForecast = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/revenue-forecast');
      const data = await response.json();

      if (data.success) {
        setHistoricalData(data.historicalData);
        setForecasts(data.forecasts);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch revenue forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  // 過去データと予測データを結合
  const combinedData = [
    ...historicalData.map((d) => ({
      month: d.month,
      actual: d.revenue,
      optimistic: null,
      realistic: null,
      pessimistic: null,
    })),
    ...forecasts.map((f) => ({
      month: f.month,
      actual: null,
      optimistic: f.optimistic,
      realistic: f.realistic,
      pessimistic: f.pessimistic,
    })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">AI分析中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-8">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push('/dashboard/executive')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          経営ダッシュボードに戻る
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📈 AI売上トレンド予測
            </h1>
            <p className="text-gray-600">
              過去データに基づく将来売上の3シナリオ予測
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            予測レポート出力
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">月次平均売上</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{((stats?.averageRevenue || 0) / 100000000).toFixed(1)}億
          </p>
          <p className="text-xs text-gray-600 mt-1">過去12ヶ月平均</p>
        </div>

        <div
          className={`bg-white rounded-xl p-6 shadow-sm border ${
            parseFloat(stats?.growthRate || '0') >= 0
              ? 'border-green-100 bg-green-50'
              : 'border-red-100 bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-semibold ${
                parseFloat(stats?.growthRate || '0') >= 0
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}
            >
              成長率トレンド
            </span>
            {parseFloat(stats?.growthRate || '0') >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p
            className={`text-2xl font-bold ${
              parseFloat(stats?.growthRate || '0') >= 0
                ? 'text-green-700'
                : 'text-red-700'
            }`}
          >
            {stats?.growthRate}%
          </p>
          <p
            className={`text-xs mt-1 ${
              parseFloat(stats?.growthRate || '0') >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            月次トレンド
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">予測期待売上</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{((stats?.totalRealisticForecast || 0) / 100000000).toFixed(1)}億
          </p>
          <p className="text-xs text-gray-600 mt-1">
            今後{stats?.forecastPeriod}ヶ月（現実的）
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">予測信頼度</span>
            <Percent className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.averageConfidence.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">平均信頼度</p>
        </div>
      </div>

      {/* トレンド予測グラフ */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            売上トレンド予測（3シナリオ）
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">表示:</span>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全シナリオ</option>
              <option value="optimistic">楽観的</option>
              <option value="realistic">現実的</option>
              <option value="pessimistic">悲観的</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={combinedData}>
            <defs>
              <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRealistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `¥${(value / 100000000).toFixed(1)}億`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `¥${(value / 1000000).toFixed(1)}M`}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />

            {/* 実績データ */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#colorRealistic)"
              name="実績"
            />

            {/* 予測データ */}
            {(selectedScenario === 'all' ||
              selectedScenario === 'optimistic') && (
              <Area
                type="monotone"
                dataKey="optimistic"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorOptimistic)"
                name="楽観的予測"
              />
            )}

            {(selectedScenario === 'all' ||
              selectedScenario === 'realistic') && (
              <Area
                type="monotone"
                dataKey="realistic"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorRealistic)"
                name="現実的予測"
              />
            )}

            {(selectedScenario === 'all' ||
              selectedScenario === 'pessimistic') && (
              <Area
                type="monotone"
                dataKey="pessimistic"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorPessimistic)"
                name="悲観的予測"
              />
            )}

            {/* 予測開始ライン */}
            <ReferenceLine
              x={historicalData[historicalData.length - 1]?.month}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{ value: '予測開始', position: 'top', fill: '#6b7280' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-green-700 font-semibold mb-1">
              📈 楽観的シナリオ
            </p>
            <p className="text-green-600">
              過去トレンド + 1.5σ の成長を想定。好調な市場環境が続く場合。
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-blue-700 font-semibold mb-1">
              📊 現実的シナリオ
            </p>
            <p className="text-blue-600">
              過去トレンドをベースに季節性を考慮。最も可能性の高い予測。
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-red-700 font-semibold mb-1">📉 悲観的シナリオ</p>
            <p className="text-red-600">
              過去トレンド - 1.5σ を想定。市場環境が厳しくなる場合。
            </p>
          </div>
        </div>
      </div>

      {/* 予測詳細テーブル */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">月次予測詳細</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  予測月
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  楽観的
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  現実的
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  悲観的
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  信頼度
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forecasts.map((forecast) => (
                <tr key={forecast.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {forecast.month}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-green-700 font-semibold">
                      ¥{(forecast.optimistic / 1000000).toFixed(1)}M
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-blue-700 font-semibold">
                      ¥{(forecast.realistic / 1000000).toFixed(1)}M
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-red-700 font-semibold">
                      ¥{(forecast.pessimistic / 1000000).toFixed(1)}M
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${forecast.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-10">
                        {forecast.confidence}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* インサイト */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          AIインサイト
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              トレンド分析
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              {parseFloat(stats?.growthRate || '0') >= 0
                ? `過去12ヶ月の売上は月次${stats?.growthRate}%のペースで成長しています。この傾向が継続すれば、今後${stats?.forecastPeriod}ヶ月で${((stats?.totalRealisticForecast || 0) / 100000000).toFixed(1)}億円の売上が見込めます。`
                : `過去12ヶ月の売上は月次${stats?.growthRate}%のペースで減少しています。早急な対策が必要です。`}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              推奨アクション
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              {parseFloat(stats?.growthRate || '0') >= 0
                ? '好調なトレンドを維持するため、営業リソースの最適配分と顧客満足度の向上施策を継続しましょう。'
                : '売上減少トレンドを反転させるため、新規顧客開拓と既存顧客へのクロスセル強化が急務です。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
