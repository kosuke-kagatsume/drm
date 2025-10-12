'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Download,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
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
} from 'recharts';

interface SalesPerformance {
  salesRepId: string;
  salesRepName: string;
  department: string;
  totalOrders: number;
  wonOrders: number;
  lostOrders: number;
  winRate: number;
  totalRevenue: number;
  averageDealSize: number;
  activePipeline: number;
  targetAchievementRate: number;
  monthlyTarget: number;
}

interface MonthlyTrend {
  month: string;
  orders: number;
  revenue: number;
  winRate: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

export default function SalesPerformancePage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<
    'revenue' | 'orders' | 'winRate' | 'achievement'
  >('revenue');

  // サンプルデータ: 営業担当者別パフォーマンス
  const salesData: SalesPerformance[] = [
    {
      salesRepId: 'SALES-001',
      salesRepName: '田中 一郎',
      department: '営業第一部',
      totalOrders: 25,
      wonOrders: 18,
      lostOrders: 7,
      winRate: 72.0,
      totalRevenue: 125000000,
      averageDealSize: 6944444,
      activePipeline: 5,
      targetAchievementRate: 104.2,
      monthlyTarget: 120000000,
    },
    {
      salesRepId: 'SALES-002',
      salesRepName: '佐藤 花子',
      department: '営業第一部',
      totalOrders: 22,
      wonOrders: 16,
      lostOrders: 6,
      winRate: 72.7,
      totalRevenue: 98000000,
      averageDealSize: 6125000,
      activePipeline: 8,
      targetAchievementRate: 98.0,
      monthlyTarget: 100000000,
    },
    {
      salesRepId: 'SALES-003',
      salesRepName: '鈴木 健太',
      department: '営業第二部',
      totalOrders: 30,
      wonOrders: 20,
      lostOrders: 10,
      winRate: 66.7,
      totalRevenue: 85000000,
      averageDealSize: 4250000,
      activePipeline: 12,
      targetAchievementRate: 94.4,
      monthlyTarget: 90000000,
    },
    {
      salesRepId: 'SALES-004',
      salesRepName: '高橋 美咲',
      department: '営業第二部',
      totalOrders: 18,
      wonOrders: 13,
      lostOrders: 5,
      winRate: 72.2,
      totalRevenue: 72000000,
      averageDealSize: 5538461,
      activePipeline: 6,
      targetAchievementRate: 90.0,
      monthlyTarget: 80000000,
    },
    {
      salesRepId: 'SALES-005',
      salesRepName: '伊藤 誠',
      department: '営業第一部',
      totalOrders: 15,
      wonOrders: 9,
      lostOrders: 6,
      winRate: 60.0,
      totalRevenue: 45000000,
      averageDealSize: 5000000,
      activePipeline: 4,
      targetAchievementRate: 75.0,
      monthlyTarget: 60000000,
    },
  ];

  // 月次トレンドデータ
  const monthlyTrend: MonthlyTrend[] = [
    { month: '5月', orders: 28, revenue: 95000000, winRate: 68.3 },
    { month: '6月', orders: 32, revenue: 108000000, winRate: 69.6 },
    { month: '7月', orders: 30, revenue: 102000000, winRate: 70.0 },
    { month: '8月', orders: 35, revenue: 115000000, winRate: 71.4 },
    { month: '9月', orders: 38, revenue: 125000000, winRate: 71.1 },
    { month: '10月', orders: 42, revenue: 135000000, winRate: 72.4 },
  ];

  // パイプラインステージ別データ
  const pipelineStages: PipelineStage[] = [
    { stage: '初回接触', count: 15, value: 45000000 },
    { stage: '提案中', count: 12, value: 68000000 },
    { stage: '見積提出', count: 8, value: 52000000 },
    { stage: '交渉中', count: 5, value: 38000000 },
    { stage: 'クロージング', count: 3, value: 22000000 },
  ];

  // サマリー計算
  const summary = {
    totalRevenue: salesData.reduce((sum, s) => sum + s.totalRevenue, 0),
    totalOrders: salesData.reduce((sum, s) => sum + s.wonOrders, 0),
    averageWinRate:
      salesData.reduce((sum, s) => sum + s.winRate, 0) / salesData.length,
    salesRepCount: salesData.length,
    averageDealSize:
      salesData.reduce((sum, s) => sum + s.totalRevenue, 0) /
      salesData.reduce((sum, s) => sum + s.wonOrders, 0),
    targetAchievement:
      (salesData.reduce((sum, s) => sum + s.totalRevenue, 0) /
        salesData.reduce((sum, s) => sum + s.monthlyTarget, 0)) *
      100,
  };

  // ソート処理
  const sortedSalesData = [...salesData].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'orders':
        return b.wonOrders - a.wonOrders;
      case 'winRate':
        return b.winRate - a.winRate;
      case 'achievement':
        return b.targetAchievementRate - a.targetAchievementRate;
      default:
        return 0;
    }
  });

  // カラー設定
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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
              📈 営業パフォーマンス分析
            </h1>
            <p className="text-gray-600">
              営業担当者別の受注実績・パイプライン・目標達成率を可視化
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">今月</option>
              <option value="quarter">今四半期</option>
              <option value="year">今年</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              レポート出力
            </button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">総受注額</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{(summary.totalRevenue / 100000000).toFixed(1)}億
          </p>
          <p className="text-xs text-gray-600 mt-1">
            目標達成率: {summary.targetAchievement.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">平均受注率</span>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.averageWinRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            前月比 +2.3%{' '}
            <ArrowUpRight className="w-3 h-3 inline text-green-600" />
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">営業担当者数</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.salesRepCount}名
          </p>
          <p className="text-xs text-gray-600 mt-1">アクティブメンバー</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">平均案件規模</span>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{(summary.averageDealSize / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 mt-1">1案件あたり</p>
        </div>
      </div>

      {/* トップパフォーマーアラート */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                🏆 今月のトップパフォーマー
              </h3>
              <p className="text-sm text-green-700">
                {sortedSalesData[0]?.salesRepName}さんが目標達成率
                {sortedSalesData[0]?.targetAchievementRate.toFixed(1)}
                %で1位です！受注額¥
                {(sortedSalesData[0]?.totalRevenue / 10000).toLocaleString()}
                万円を達成しました。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 営業担当者別受注額 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            営業担当者別受注額
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sortedSalesData.slice(0, 5)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="category"
                dataKey="salesRepName"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) =>
                  `¥${(value / 1000000).toFixed(1)}M`
                }
              />
              <Bar
                dataKey="totalRevenue"
                fill="#3b82f6"
                radius={[0, 8, 8, 0]}
                name="受注額"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 月次受注推移 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            月次受注推移（6ヶ月）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
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
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                name="受注件数"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#10b981"
                strokeWidth={2}
                name="受注率 (%)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* パイプラインステージ分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            パイプラインステージ分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineStages}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.stage}: ${entry.count}件`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {pipelineStages.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value}件 (¥${(props.payload.value / 1000000).toFixed(1)}M)`,
                  props.payload.stage,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 受注率トレンド */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            受注率トレンド（6ヶ月）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
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
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#10b981"
                strokeWidth={3}
                name="受注率 (%)"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-3 text-center">
            📈 6ヶ月間で受注率が68.3%→72.4%に向上（+4.1pt）
          </p>
        </div>
      </div>

      {/* 営業担当者別詳細テーブル */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              営業担当者別詳細パフォーマンス
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">並び替え:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="revenue">受注額順</option>
                <option value="orders">受注件数順</option>
                <option value="winRate">受注率順</option>
                <option value="achievement">目標達成率順</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  営業担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  部署
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  受注件数
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  受注率
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  受注額
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  平均案件規模
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  目標達成率
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  パイプライン
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedSalesData.map((sales, index) => (
                <tr
                  key={sales.salesRepId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {sales.salesRepName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sales.salesRepId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {sales.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      {sales.wonOrders}件
                    </p>
                    <p className="text-xs text-gray-500">
                      / {sales.totalOrders}件中
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sales.winRate >= 70
                            ? 'bg-green-100 text-green-700'
                            : sales.winRate >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {sales.winRate.toFixed(1)}%
                      </span>
                      {sales.winRate >= 70 ? (
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ¥{(sales.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-gray-900 text-sm">
                      ¥{(sales.averageDealSize / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sales.targetAchievementRate >= 100
                              ? 'bg-green-500'
                              : sales.targetAchievementRate >= 90
                                ? 'bg-blue-500'
                                : sales.targetAchievementRate >= 80
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(sales.targetAchievementRate, 100)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          sales.targetAchievementRate >= 100
                            ? 'text-green-700'
                            : sales.targetAchievementRate >= 90
                              ? 'text-blue-700'
                              : 'text-red-700'
                        }`}
                      >
                        {sales.targetAchievementRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {sales.activePipeline}件
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* インサイト・改善提案 */}
      <div className="max-w-7xl mx-auto mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          インサイト・改善提案
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              💡 トップパフォーマーの成功パターン
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              田中一郎さん・佐藤花子さんは受注率72%超を維持。初回訪問から見積提出までの期間が平均7日と短く、スピード感のある提案が成功要因。
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              📊 パイプライン分析
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              「提案中」ステージで12件・¥68Mの案件が滞留。営業MTGで進捗確認と提案内容のブラッシュアップを推奨。
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              🎯 改善アクション
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              伊藤誠さん（受注率60%・目標達成率75%）に対して、トップパフォーマーとの同行訪問を実施し、提案スキルを強化。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
