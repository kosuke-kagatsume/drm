'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  [key: string]: any;
}

interface SimplePieChartProps {
  data: DataItem[];
  colors?: string[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export default function SimplePieChart({
  data,
  colors = DEFAULT_COLORS,
  dataKey = 'value',
  nameKey = 'name',
  height = 200,
  showLegend = true,
}: SimplePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={60}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}
