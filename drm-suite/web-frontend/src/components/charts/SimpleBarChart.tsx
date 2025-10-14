'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataItem {
  [key: string]: any;
}

interface SimpleBarChartProps {
  data: DataItem[];
  dataKey: string;
  xAxisKey: string;
  barColor?: string;
  height?: number;
  showGrid?: boolean;
}

export default function SimpleBarChart({
  data,
  dataKey,
  xAxisKey,
  barColor = '#3b82f6',
  height = 200,
  showGrid = true,
}: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey={xAxisKey} style={{ fontSize: '10px' }} />
        <YAxis style={{ fontSize: '10px' }} />
        <Tooltip />
        <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
