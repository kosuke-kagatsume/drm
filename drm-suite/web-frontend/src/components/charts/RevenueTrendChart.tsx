'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueTrendData {
  month: string;
  売上: number;
  粗利: number;
  キャッシュフロー?: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
}

export default function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis yAxisId="left" stroke="#6b7280" />
        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="売上"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 5 }}
          name="売上 (M)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="粗利"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', r: 5 }}
          name="粗利率 (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
