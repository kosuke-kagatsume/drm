'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  ChevronDown,
  Eye,
} from 'lucide-react';

// 顧客収益データの型定義
interface CustomerRevenue {
  customerId: string;
  customerName: string;
  totalRevenue: number; // 総売上
  grossProfit: number; // 粗利額
  grossProfitRate: number; // 粗利率
  orderCount: number; // 受注件数
  averageOrderValue: number; // 平均受注額
  lastOrderDate: string; // 最終受注日
  repeatRate: number; // リピート率
  growthRate: number; // 成長率（前期比）
  ltv: number; // 顧客生涯価値予測
}

export default function CustomerRevenuePage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'growth'>(
    'revenue',
  );
  const [filterMinRevenue, setFilterMinRevenue] = useState<number>(0);

  // サンプルデータ（実際はAPIから取得）
  const customerRevenueData: CustomerRevenue[] = [
    {
      customerId: 'CUST-001',
      customerName: '山田太郎',
      totalRevenue: 35000000,
      grossProfit: 8750000,
      grossProfitRate: 25.0,
      orderCount: 3,
      averageOrderValue: 11666667,
      lastOrderDate: '2024-09-15',
      repeatRate: 100,
      growthRate: 15.5,
      ltv: 52500000,
    },
    {
      customerId: 'CUST-002',
      customerName: '田中建設株式会社',
      totalRevenue: 65000000,
      grossProfit: 13000000,
      grossProfitRate: 20.0,
      orderCount: 2,
      averageOrderValue: 32500000,
      lastOrderDate: '2024-08-20',
      repeatRate: 50,
      growthRate: -5.2,
      ltv: 78000000,
    },
    {
      customerId: 'CUST-003',
      customerName: '鈴木商事',
      totalRevenue: 125000000,
      grossProfit: 31250000,
      grossProfitRate: 25.0,
      orderCount: 5,
      averageOrderValue: 25000000,
      lastOrderDate: '2024-10-01',
      repeatRate: 80,
      growthRate: 28.3,
      ltv: 187500000,
    },
    {
      customerId: 'CUST-004',
      customerName: '佐藤工業',
      totalRevenue: 48000000,
      grossProfit: 9600000,
      grossProfitRate: 20.0,
      orderCount: 4,
      averageOrderValue: 12000000,
      lastOrderDate: '2024-09-28',
      repeatRate: 75,
      growthRate: 10.8,
      ltv: 72000000,
    },
    {
      customerId: 'CUST-005',
      customerName: '伊藤建築',
      totalRevenue: 28000000,
      grossProfit: 8400000,
      grossProfitRate: 30.0,
      orderCount: 2,
      averageOrderValue: 14000000,
      lastOrderDate: '2024-07-15',
      repeatRate: 100,
      growthRate: 22.1,
      ltv: 42000000,
    },
  ];

  // サマリー計算
  const summary = {
    totalRevenue: customerRevenueData.reduce(
      (sum, c) => sum + c.totalRevenue,
      0,
    ),
    totalProfit: customerRevenueData.reduce((sum, c) => sum + c.grossProfit, 0),
    averageProfitRate:
      customerRevenueData.reduce((sum, c) => sum + c.grossProfitRate, 0) /
      customerRevenueData.length,
    totalCustomers: customerRevenueData.length,
    averageOrderValue:
      customerRevenueData.reduce((sum, c) => sum + c.averageOrderValue, 0) /
      customerRevenueData.length,
  };

  // ソート処理
  const sortedData = [...customerRevenueData].sort((a, b) => {
    if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
    if (sortBy === 'profit') return b.grossProfit - a.grossProfit;
    if (sortBy === 'growth') return b.growthRate - a.growthRate;
    return 0;
  });

  // TOP 5 データ
  const top5Revenue = sortedData.slice(0, 5);

  // 月次トレンドデータ（サンプル）
  const monthlyTrend = [
    {
      month: '4月',
      山田太郎: 8,
      田中建設: 15,
      鈴木商事: 22,
      佐藤工業: 10,
      伊藤建築: 6,
    },
    {
      month: '5月',
      山田太郎: 9,
      田中建設: 18,
      鈴木商事: 25,
      佐藤工業: 11,
      伊藤建築: 7,
    },
    {
      month: '6月',
      山田太郎: 10,
      田中建設: 16,
      鈴木商事: 28,
      佐藤工業: 12,
      伊藤建築: 8,
    },
    {
      month: '7月',
      山田太郎: 11,
      田中建設: 14,
      鈴木商事: 30,
      佐藤工業: 13,
      伊藤建築: 9,
    },
    {
      month: '8月',
      山田太郎: 12,
      田中建設: 12,
      鈴木商事: 32,
      佐藤工業: 14,
      伊藤建築: 10,
    },
    {
      month: '9月',
      山田太郎: 35,
      田中建設: 10,
      鈴木商事: 35,
      佐藤工業: 15,
      伊藤建築: 12,
    },
  ];

  // カラーパレット
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">顧客別収益分析</h1>
            <p className="text-gray-600 mt-1">Customer Revenue Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 期間選択 */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">月次</option>
              <option value="quarter">四半期</option>
              <option value="year">年次</option>
            </select>

            {/* エクスポートボタン */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              エクスポート
            </button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">総売上</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{(summary.totalRevenue / 1000000).toFixed(0)}M
          </p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.5% vs 前期
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">粗利額</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{(summary.totalProfit / 1000000).toFixed(0)}M
          </p>
          <p className="text-xs text-gray-600 mt-1">
            粗利率: {summary.averageProfitRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">顧客数</span>
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalCustomers}
          </p>
          <p className="text-xs text-gray-600 mt-1">アクティブ顧客</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">平均単価</span>
            <ArrowUpRight className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{(summary.averageOrderValue / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8.2% vs 前期
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* TOP 5 顧客ランキング */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🏆 TOP 5 顧客
          </h3>
          <div className="space-y-3">
            {top5Revenue.map((customer, index) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/customers/${customer.customerId}`)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                            ? 'bg-orange-600'
                            : 'bg-blue-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {customer.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      粗利率: {customer.grossProfitRate}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    ¥{(customer.totalRevenue / 1000000).toFixed(0)}M
                  </p>
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      customer.growthRate >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {customer.growthRate >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {customer.growthRate >= 0 ? '+' : ''}
                    {customer.growthRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 月次トレンドチャート */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            月次売上トレンド
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
                dataKey="山田太郎"
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="田中建設"
                stroke={COLORS[1]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="鈴木商事"
                stroke={COLORS[2]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="佐藤工業"
                stroke={COLORS[3]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="伊藤建築"
                stroke={COLORS[4]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 詳細テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              顧客別詳細データ
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="revenue">売上順</option>
                <option value="profit">粗利順</option>
                <option value="growth">成長率順</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  総売上
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  粗利額
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  粗利率
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  受注件数
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  平均単価
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  成長率
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  LTV予測
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.map((customer) => (
                <tr
                  key={customer.customerId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {customer.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.customerId}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ¥{(customer.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ¥{(customer.grossProfit / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        customer.grossProfitRate >= 25
                          ? 'bg-green-100 text-green-700'
                          : customer.grossProfitRate >= 20
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {customer.grossProfitRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-gray-900 text-sm">
                      {customer.orderCount}件
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-gray-900 text-sm">
                      ¥{(customer.averageOrderValue / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p
                      className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                        customer.growthRate >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {customer.growthRate >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {customer.growthRate >= 0 ? '+' : ''}
                      {customer.growthRate}%
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-purple-600 font-semibold text-sm">
                      ¥{(customer.ltv / 1000000).toFixed(0)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() =>
                        router.push(`/customers/${customer.customerId}`)
                      }
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* インサイトセクション */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          💡 インサイト
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">平均リピート率</p>
            <p className="text-2xl font-bold text-blue-600">
              {(
                customerRevenueData.reduce((sum, c) => sum + c.repeatRate, 0) /
                customerRevenueData.length
              ).toFixed(0)}
              %
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">成長顧客比率</p>
            <p className="text-2xl font-bold text-green-600">
              {(
                (customerRevenueData.filter((c) => c.growthRate > 0).length /
                  customerRevenueData.length) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">平均LTV</p>
            <p className="text-2xl font-bold text-purple-600">
              ¥
              {(
                customerRevenueData.reduce((sum, c) => sum + c.ltv, 0) /
                customerRevenueData.length /
                1000000
              ).toFixed(0)}
              M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
