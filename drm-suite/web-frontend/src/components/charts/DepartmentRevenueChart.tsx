'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DepartmentData {
  name: string;
  売上: number;
  粗利率: number;
}

interface DepartmentRevenueChartProps {
  data: DepartmentData[];
}

export default function DepartmentRevenueChart({
  data,
}: DepartmentRevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
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
        <Bar
          yAxisId="left"
          dataKey="売上"
          fill="#3b82f6"
          name="売上 (M)"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="粗利率"
          fill="#10b981"
          name="粗利率 (%)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
