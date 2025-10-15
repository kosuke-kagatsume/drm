'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Download,
  Lightbulb,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface WinProbability {
  estimateId: string;
  estimateNo: string;
  customerName: string;
  salesRepName: string;
  totalAmount: number;
  probability: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  factors: {
    salesRepHistory: number;
    customerHistory: number;
    amountFactor: number;
    timeFactor: number;
    statusFactor: number;
  };
  recommendation: string;
  nextAction: string;
}

interface Stats {
  totalEstimates: number;
  highProbability: number;
  mediumProbability: number;
  lowProbability: number;
  averageProbability: number;
  expectedRevenue: number;
}

export default function WinPredictionPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<WinProbability[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');

  useEffect(() => {
    fetchWinProbability();
  }, []);

  const fetchWinProbability = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/win-probability');
      const data = await response.json();

      if (data.success) {
        setPredictions(data.predictions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch win probability:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィルタリング
  const filteredPredictions =
    filterLevel === 'all'
      ? predictions
      : predictions.filter((p) => p.confidenceLevel === filterLevel);

  // 受注確度レベル別の色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // 確度別分布データ
  const probabilityDistribution = [
    {
      range: '80%以上',
      count: predictions.filter((p) => p.probability >= 80).length,
      fill: '#10b981',
    },
    {
      range: '60-79%',
      count: predictions.filter(
        (p) => p.probability >= 60 && p.probability < 80,
      ).length,
      fill: '#3b82f6',
    },
    {
      range: '40-59%',
      count: predictions.filter(
        (p) => p.probability >= 40 && p.probability < 60,
      ).length,
      fill: '#f59e0b',
    },
    {
      range: '40%未満',
      count: predictions.filter((p) => p.probability < 40).length,
      fill: '#ef4444',
    },
  ];

  // レベル別統計
  const levelStats = [
    { name: '高確度', value: stats?.highProbability || 0, fill: '#10b981' },
    { name: '中確度', value: stats?.mediumProbability || 0, fill: '#f59e0b' },
    { name: '低確度', value: stats?.lowProbability || 0, fill: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">AI分析中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8">
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
              🤖 AI受注予測分析
            </h1>
            <p className="text-gray-600">
              機械学習による見積案件の受注確度予測とレコメンデーション
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            予測レポート出力
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">分析見積数</span>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.totalEstimates}件
          </p>
          <p className="text-xs text-gray-600 mt-1">進行中の見積案件</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">平均受注確度</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.averageProbability.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">全案件の平均値</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">予測期待売上</span>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{((stats?.expectedRevenue || 0) / 100000000).toFixed(1)}億
          </p>
          <p className="text-xs text-gray-600 mt-1">確度加重平均</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-semibold">
              高確度案件
            </span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">
            {stats?.highProbability}件
          </p>
          <p className="text-xs text-green-600 mt-1">受注確度70%以上</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 受注確度分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">受注確度分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={probabilityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="range"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" name="件数" radius={[8, 8, 0, 0]}>
                {probabilityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* レベル別統計 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            確度レベル別統計
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={levelStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}件`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {levelStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 見積一覧と予測結果 */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              見積別受注確度予測
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">フィルター:</span>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                <option value="high">高確度</option>
                <option value="medium">中確度</option>
                <option value="low">低確度</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPredictions.map((prediction) => (
            <div key={prediction.estimateId} className="p-6 hover:bg-gray-50">
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">
                      {prediction.estimateNo}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getLevelColor(prediction.confidenceLevel)}`}
                    >
                      {getLevelIcon(prediction.confidenceLevel)}
                      受注確度: {prediction.probability}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>顧客: {prediction.customerName}</span>
                    <span>営業: {prediction.salesRepName}</span>
                    <span>
                      金額: ¥{(prediction.totalAmount / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              {/* 予測因子レーダーチャート */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                <div className="lg:col-span-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart
                      data={[
                        {
                          factor: '営業実績',
                          value: prediction.factors.salesRepHistory,
                        },
                        {
                          factor: '顧客履歴',
                          value: prediction.factors.customerHistory,
                        },
                        {
                          factor: '金額',
                          value: prediction.factors.amountFactor,
                        },
                        {
                          factor: '経過日数',
                          value: prediction.factors.timeFactor,
                        },
                        {
                          factor: 'ステータス',
                          value: prediction.factors.statusFactor,
                        },
                      ]}
                    >
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="factor"
                        style={{ fontSize: '10px' }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="スコア"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-2">
                  {/* レコメンデーション */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-blue-900 text-sm mb-1">
                          AIレコメンデーション
                        </h5>
                        <p className="text-xs text-blue-700">
                          {prediction.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ネクストアクション */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-green-900 text-sm mb-1">
                          推奨アクション
                        </h5>
                        <p className="text-xs text-green-700">
                          {prediction.nextAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 詳細スコア */}
              <div className="grid grid-cols-5 gap-3 text-xs">
                <div className="text-center">
                  <p className="text-gray-500 mb-1">営業実績</p>
                  <p className="font-bold text-blue-600">
                    {prediction.factors.salesRepHistory}点
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mb-1">顧客履歴</p>
                  <p className="font-bold text-purple-600">
                    {prediction.factors.customerHistory}点
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mb-1">金額適正</p>
                  <p className="font-bold text-green-600">
                    {prediction.factors.amountFactor}点
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mb-1">鮮度</p>
                  <p className="font-bold text-orange-600">
                    {prediction.factors.timeFactor}点
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mb-1">ステータス</p>
                  <p className="font-bold text-pink-600">
                    {prediction.factors.statusFactor}点
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
