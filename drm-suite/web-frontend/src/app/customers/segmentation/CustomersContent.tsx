'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Activity,
  Target,
  DollarSign,
  BarChart3,
  Download,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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

interface CustomerSegmentation {
  customerId: string;
  customerName: string;
  segment: 'A' | 'B' | 'C' | 'D';
  score: number;
  factors: {
    revenueScore: number;
    frequencyScore: number;
    profitabilityScore: number;
    recencyScore: number;
    growthScore: number;
  };
  metrics: {
    totalRevenue: number;
    orderCount: number;
    averageProfitRate: number;
    lastOrderDate: string;
    growthRate: number;
  };
  strategy: string;
  risk: 'low' | 'medium' | 'high';
}

interface Stats {
  total: number;
  segmentA: number;
  segmentB: number;
  segmentC: number;
  segmentD: number;
  highRisk: number;
  averageScore: number;
  totalRevenue: number;
}

interface SegmentRevenue {
  A: number;
  B: number;
  C: number;
  D: number;
}

export default function CustomerSegmentationPage() {
  const router = useRouter();
  const [segmentations, setSegmentations] = useState<CustomerSegmentation[]>(
    [],
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [segmentRevenue, setSegmentRevenue] = useState<SegmentRevenue | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [filterSegment, setFilterSegment] = useState<
    'all' | 'A' | 'B' | 'C' | 'D'
  >('all');
  const [filterRisk, setFilterRisk] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');

  useEffect(() => {
    fetchSegmentation();
  }, []);

  const fetchSegmentation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers/segmentation');
      const data = await response.json();

      if (data.success) {
        setSegmentations(data.segmentations);
        setStats(data.stats);
        setSegmentRevenue(data.segmentRevenue);
      }
    } catch (error) {
      console.error('Failed to fetch segmentation:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィルタリング
  const filteredSegmentations = segmentations.filter((s) => {
    const segmentMatch = filterSegment === 'all' || s.segment === filterSegment;
    const riskMatch = filterRisk === 'all' || s.risk === filterRisk;
    return segmentMatch && riskMatch;
  });

  // セグメント別分布データ
  const segmentDistribution = [
    { name: 'Aランク', value: stats?.segmentA || 0, fill: '#10b981' },
    { name: 'Bランク', value: stats?.segmentB || 0, fill: '#3b82f6' },
    { name: 'Cランク', value: stats?.segmentC || 0, fill: '#f59e0b' },
    { name: 'Dランク', value: stats?.segmentD || 0, fill: '#ef4444' },
  ];

  // セグメント別売上貢献度データ
  const revenueContribution = [
    { segment: 'Aランク', revenue: segmentRevenue?.A || 0 },
    { segment: 'Bランク', revenue: segmentRevenue?.B || 0 },
    { segment: 'Cランク', revenue: segmentRevenue?.C || 0 },
    { segment: 'Dランク', revenue: segmentRevenue?.D || 0 },
  ];

  // セグメントの色とアイコン
  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'A':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'B':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'C':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'D':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-dandori-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">顧客分析中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー with Blue Gradient */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← 顧客一覧に戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <span className="text-4xl mr-3">📊</span>
                  顧客セグメンテーション分析
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  取引実績に基づく顧客ランク分けと営業戦略の最適化
                </p>
              </div>
            </div>

            <button className="bg-white text-dandori-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              セグメントレポート出力
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">総顧客数</span>
              <Users className="w-5 h-5 text-dandori-blue" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total}社</p>
            <p className="text-xs text-gray-600 mt-1">分析対象</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90 font-semibold">
                Aランク顧客
              </span>
              <Award className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stats?.segmentA}社</p>
            <p className="text-xs text-white/90 mt-1">最重要顧客</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">平均スコア</span>
              <Target className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              {stats?.averageScore.toFixed(1)}点
            </p>
            <p className="text-xs text-white/90 mt-1">100点満点</p>
          </div>

          <div className="bg-gradient-to-br from-dandori-pink to-dandori-orange text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90 font-semibold">
                高リスク顧客
              </span>
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stats?.highRisk}社</p>
            <p className="text-xs text-white/90 mt-1">要フォロー</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* セグメント分布 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              セグメント分布
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}社`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* セグメント別売上貢献度 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              セグメント別売上貢献度
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueContribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="segment"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) =>
                    `¥${(value / 100000000).toFixed(1)}億`
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    `¥${(value / 1000000).toFixed(1)}M`
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  name="売上"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 顧客一覧 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                顧客セグメント詳細
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value as any)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
                >
                  <option value="all">全セグメント</option>
                  <option value="A">Aランク</option>
                  <option value="B">Bランク</option>
                  <option value="C">Cランク</option>
                  <option value="D">Dランク</option>
                </select>

                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value as any)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
                >
                  <option value="all">全リスク</option>
                  <option value="low">低リスク</option>
                  <option value="medium">中リスク</option>
                  <option value="high">高リスク</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredSegmentations.map((segmentation) => (
              <div
                key={segmentation.customerId}
                className="p-6 hover:bg-gradient-to-r hover:from-dandori-blue/5 hover:to-dandori-sky/5 transition-all duration-200"
              >
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {segmentation.customerName}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getSegmentBadge(segmentation.segment)}`}
                      >
                        {segmentation.segment}ランク
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRiskBadge(segmentation.risk)}`}
                      >
                        {segmentation.risk === 'low'
                          ? '低リスク'
                          : segmentation.risk === 'medium'
                            ? '中リスク'
                            : '高リスク'}
                      </span>
                      <div className="text-sm text-gray-600">
                        総合スコア:{' '}
                        <span className="font-bold">
                          {segmentation.score}点
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* スコアレーダーチャートと指標 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                  <div className="lg:col-span-1">
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart
                        data={[
                          {
                            factor: '売上',
                            value: segmentation.factors.revenueScore,
                          },
                          {
                            factor: '頻度',
                            value: segmentation.factors.frequencyScore,
                          },
                          {
                            factor: '粗利率',
                            value: segmentation.factors.profitabilityScore,
                          },
                          {
                            factor: '鮮度',
                            value: segmentation.factors.recencyScore,
                          },
                          {
                            factor: '成長率',
                            value: segmentation.factors.growthScore,
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

                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">総売上</p>
                      <p className="text-lg font-bold text-blue-900">
                        ¥
                        {(segmentation.metrics.totalRevenue / 1000000).toFixed(
                          1,
                        )}
                        M
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">取引回数</p>
                      <p className="text-lg font-bold text-purple-900">
                        {segmentation.metrics.orderCount}回
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">平均粗利率</p>
                      <p className="text-lg font-bold text-green-900">
                        {segmentation.metrics.averageProfitRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 mb-1">成長率</p>
                      <p className="text-lg font-bold text-orange-900">
                        {segmentation.metrics.growthRate >= 0 ? '+' : ''}
                        {segmentation.metrics.growthRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 営業戦略 */}
                <div className="bg-gradient-to-r from-dandori-blue/10 to-dandori-sky/10 border border-dandori-blue/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-dandori-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-dandori-blue text-sm mb-1">
                        推奨営業戦略
                      </h5>
                      <p className="text-xs text-gray-700">
                        {segmentation.strategy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
