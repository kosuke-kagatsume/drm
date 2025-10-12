'use client';

import { useEffect, useState } from 'react';
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
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Users,
  DollarSign,
} from 'lucide-react';

interface OrderAnalyticsProps {
  tenantId?: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

interface AnalyticsData {
  summary: {
    totalEstimates: number;
    wonEstimates: number;
    lostEstimates: number;
    negotiatingEstimates: number;
    decidedEstimates: number;
    winRate: number;
    totalAmount: number;
    wonAmount: number;
    avgDealSize: number;
  };
  monthlyTrend: Array<{
    month: string;
    total: number;
    won: number;
    lost: number;
    negotiating: number;
    winRate: number;
    amount: number;
    wonAmount: number;
  }>;
  salesPerformance: Array<{
    email: string;
    name: string;
    total: number;
    won: number;
    lost: number;
    negotiating: number;
    winRate: number;
    amount: number;
    wonAmount: number;
    avgDealSize: number;
  }>;
  lostReasons: Array<{
    reason: string;
    label: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export default function OrderAnalytics({
  tenantId = 'demo-tenant',
  period = 'monthly',
  startDate,
  endDate,
}: OrderAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [tenantId, period, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/analytics/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'データ取得に失敗しました');
      }
    } catch (err) {
      console.error('受注率分析データ取得エラー:', err);
      setError('データ取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'データがありません'}</p>
      </div>
    );
  }

  const { summary, monthlyTrend, salesPerformance, lostReasons } = data;

  // 失注理由のチャートカラー
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 受注率 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">受注率</p>
            {summary.winRate >= 60 ? (
              <TrendingUp className="w-5 h-5 text-green-300" />
            ) : (
              <TrendingDown className="w-5 h-5 text-yellow-300" />
            )}
          </div>
          <p className="text-4xl font-bold">{summary.winRate.toFixed(1)}%</p>
          <p className="text-xs text-white/60 mt-2">
            {summary.wonEstimates} / {summary.decidedEstimates}件
          </p>
        </div>

        {/* 受注金額 */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">受注金額</p>
            <DollarSign className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-4xl font-bold">
            ¥{(summary.wonAmount / 1000000).toFixed(0)}M
          </p>
          <p className="text-xs text-white/60 mt-2">
            総額: ¥{(summary.totalAmount / 1000000).toFixed(0)}M
          </p>
        </div>

        {/* 平均受注単価 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">平均受注単価</p>
            <Award className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-4xl font-bold">
            ¥{(summary.avgDealSize / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-white/60 mt-2">
            {summary.wonEstimates}件の平均
          </p>
        </div>

        {/* 交渉中案件 */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">交渉中案件</p>
            <Users className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-4xl font-bold">{summary.negotiatingEstimates}</p>
          <p className="text-xs text-white/60 mt-2">
            全{summary.totalEstimates}件中
          </p>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 受注率推移グラフ */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📈 受注率推移（月次）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#3b82f6"
                strokeWidth={3}
                name="受注率(%)"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 失注理由分析 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            ⚠️ 失注理由分析
          </h3>
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={lostReasons}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {lostReasons.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-2">
              {lostReasons.map((reason, index) => (
                <div
                  key={reason.reason}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{reason.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {reason.count}件
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 営業担当別実績 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          👥 営業担当別実績
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 受注件数比較 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">
              受注件数
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="won" fill="#22c55e" name="受注" />
                <Bar dataKey="lost" fill="#ef4444" name="失注" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 受注率ランキング */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">
              受注率ランキング
            </h4>
            <div className="space-y-3">
              {salesPerformance.map((sales, index) => (
                <div
                  key={sales.email}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                              ? 'bg-orange-600'
                              : 'bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {sales.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sales.won}/{sales.won + sales.lost}件
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {sales.winRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      ¥{(sales.wonAmount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
