'use client';

import React, { useState, useEffect } from 'react';
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

/**
 * 顧客分析コンポーネントのProps
 */
interface CustomerAnalyticsProps {
  tenantId: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
  customerType?: 'all' | 'new' | 'existing' | 'repeat';
  status?: 'all' | 'active' | 'inactive' | 'at_risk';
}

/**
 * サマリー情報の型定義
 */
interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  repeatRate: number;
  averageLTV: number;
  atRiskCustomers: number;
  totalRevenue: number;
  revenuePerCustomer: number;
}

/**
 * 月次トレンドデータの型定義
 */
interface MonthlyCustomerTrend {
  month: string;
  newCustomers: number;
  totalCustomers: number;
  revenue: number;
  averageLTV: number;
}

/**
 * 顧客タイプ別データの型定義
 */
interface CustomerTypeData {
  type: string;
  count: number;
  percentage: number;
  revenue: number;
  averageOrderValue: number;
}

/**
 * 顧客ランキングの型定義
 */
interface CustomerRanking {
  rank: number;
  customerNo: string;
  name: string;
  company: string;
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  lastTransactionDate: string;
  type: string;
}

/**
 * APIレスポンスの型定義
 */
interface CustomerAnalyticsData {
  summary: CustomerSummary;
  monthlyTrend: MonthlyCustomerTrend[];
  customerTypeData: CustomerTypeData[];
  rankings: {
    byRevenue: CustomerRanking[];
    byTransactions: CustomerRanking[];
  };
  atRiskCustomers: CustomerRanking[];
  filters: {
    tenantId: string;
    period: string;
    customerType: string;
    status: string;
  };
  metadata: {
    totalRecords: number;
    generatedAt: string;
  };
}

/**
 * 顧客分析ダッシュボードコンポーネント
 */
const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({
  tenantId,
  period = 'monthly',
  customerType = 'all',
  status = 'all',
}) => {
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          tenantId,
          period,
          customerType,
          status,
        });

        const response = await fetch(`/api/analytics/customers?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch customer analytics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId, period, customerType, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto mb-4"></div>
          <p className="text-gray-600">顧客データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600 font-semibold mb-2">
          ❌ エラーが発生しました
        </p>
        <p className="text-red-500 text-sm">
          {error || 'データの取得に失敗しました'}
        </p>
      </div>
    );
  }

  const { summary, monthlyTrend, customerTypeData, rankings, atRiskCustomers } =
    data;

  // チャート用のカラーパレット（Dandoriブランドカラー）
  const CHART_COLORS = ['#0099CC', '#FF9933', '#FF3366', '#FFCC33', '#66CCFF'];

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 総顧客数 */}
        <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">総顧客数</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-4xl font-bold mb-2">{summary.totalCustomers}</p>
          <p className="text-sm opacity-80">
            アクティブ: {summary.activeCustomers}社
          </p>
        </div>

        {/* 新規顧客数 */}
        <div className="bg-gradient-to-br from-dandori-orange to-dandori-yellow text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">新規顧客</h3>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-4xl font-bold mb-2">{summary.newCustomers}</p>
          <p className="text-sm opacity-80">今年獲得した新規顧客</p>
        </div>

        {/* リピート率 */}
        <div className="bg-gradient-to-br from-dandori-pink to-dandori-orange text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">リピート率</h3>
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-4xl font-bold mb-2">
            {summary.repeatRate.toFixed(1)}%
          </p>
          <p className="text-sm opacity-80">優良リピート顧客の割合</p>
        </div>

        {/* 平均LTV */}
        <div className="bg-gradient-to-br from-dandori-yellow to-dandori-orange text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">平均LTV</h3>
            <span className="text-2xl">💎</span>
          </div>
          <p className="text-4xl font-bold mb-2">
            ¥{(summary.averageLTV / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm opacity-80">顧客生涯価値</p>
        </div>
      </div>

      {/* リスク顧客アラート */}
      {atRiskCustomers.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-red-700">
                リスク顧客アラート
              </h3>
              <p className="text-sm text-red-600">
                {atRiskCustomers.length}社の顧客が離脱リスクあり
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {atRiskCustomers.slice(0, 3).map((customer) => (
              <div
                key={customer.customerNo}
                className="bg-white border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      {customer.company}
                    </p>
                    <p className="text-sm text-gray-600">{customer.name}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    リスク
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">最終取引</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        customer.lastTransactionDate,
                      ).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">取引回数</p>
                    <p className="font-semibold text-gray-900">
                      {customer.totalTransactions}回
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">総取引額</p>
                    <p className="font-semibold text-gray-900">
                      ¥{(customer.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 月次トレンド */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          顧客数・売上推移（月次）
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${month}月`;
              }}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any, name: string) => {
                if (name === '売上(百万円)') {
                  return [`¥${value.toFixed(1)}M`, name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="newCustomers"
              stroke="#FF9933"
              strokeWidth={2}
              name="新規顧客"
              dot={{ fill: '#FF9933', r: 4 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalCustomers"
              stroke="#0099CC"
              strokeWidth={3}
              name="総顧客数"
              dot={{ fill: '#0099CC', r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#FF3366"
              strokeWidth={2}
              name="売上(百万円)"
              dot={{ fill: '#FF3366', r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 顧客タイプ別分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 顧客タイプ分布 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            顧客タイプ分布
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) =>
                  `${entry.type}: ${entry.percentage.toFixed(1)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {customerTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: string, props: any) => {
                  return [
                    `${value}社 (${props.payload.percentage.toFixed(1)}%)`,
                    props.payload.type,
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {customerTypeData.map((item, index) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  ></div>
                  <span className="font-semibold text-gray-900">
                    {item.type}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {item.count}社
                  </p>
                  <p className="text-xs text-gray-500">
                    平均注文額: ¥{(item.averageOrderValue / 1000000).toFixed(1)}
                    M
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* タイプ別売上 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            顧客タイプ別売上
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => `¥${(value / 1000000).toFixed(1)}M`}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#0099CC"
                name="売上額(円)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 顧客ランキング */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 売上高ランキング */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            売上高TOP10
          </h3>
          <div className="space-y-3">
            {rankings.byRevenue.slice(0, 10).map((customer) => (
              <div
                key={customer.customerNo}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5 hover:from-dandori-blue/10 hover:to-dandori-sky/10 rounded-lg transition-colors border border-gray-100"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    customer.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      : customer.rank === 2
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : customer.rank === 3
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                          : 'bg-gradient-to-br from-dandori-blue to-dandori-sky'
                  }`}
                >
                  {customer.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {customer.company}
                  </p>
                  <p className="text-sm text-gray-600">{customer.name}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>{customer.type}</span>
                    <span>取引{customer.totalTransactions}回</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-dandori-blue">
                    ¥{(customer.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-gray-500">
                    平均: ¥{(customer.averageOrderValue / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 取引回数ランキング */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            取引回数TOP10
          </h3>
          <div className="space-y-3">
            {rankings.byTransactions.slice(0, 10).map((customer) => (
              <div
                key={customer.customerNo}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-dandori-orange/5 to-dandori-yellow/5 hover:from-dandori-orange/10 hover:to-dandori-yellow/10 rounded-lg transition-colors border border-gray-100"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    customer.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      : customer.rank === 2
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : customer.rank === 3
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                          : 'bg-gradient-to-br from-dandori-orange to-dandori-yellow'
                  }`}
                >
                  {customer.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {customer.company}
                  </p>
                  <p className="text-sm text-gray-600">{customer.name}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>{customer.type}</span>
                    <span>
                      ¥{(customer.totalRevenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-dandori-orange">
                    {customer.totalTransactions}回
                  </p>
                  <p className="text-xs text-gray-500">
                    平均: ¥{(customer.averageOrderValue / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* データ情報 */}
      <div className="bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5 rounded-lg p-4 border border-dandori-blue/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <span>📊 データ件数: {data.metadata.totalRecords}件</span>
            <span>
              🕐 更新時刻:{' '}
              {new Date(data.metadata.generatedAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white border border-dandori-blue/30 rounded-full text-xs font-semibold text-dandori-blue">
              {data.filters.customerType === 'all'
                ? '全タイプ'
                : data.filters.customerType}
            </span>
            <span className="px-3 py-1 bg-white border border-dandori-blue/30 rounded-full text-xs font-semibold text-dandori-blue">
              {data.filters.status === 'all'
                ? '全ステータス'
                : data.filters.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
