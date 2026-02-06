'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-media-query';

interface CategoryBreakdown {
  categoryName: string;
  total: number;
  percent: number;
  count: number;
}

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-75 text-muted-foreground">
        No data available
      </div>
    );
  }

  const MAX_SLICES = 7;
  const allSlices = data.map((item) => ({
    name: item.categoryName,
    value: Math.abs(item.total),
  }));

  let chartData: { name: string; value: number }[];
  if (allSlices.length <= MAX_SLICES) {
    chartData = allSlices;
  } else {
    const topSlices = allSlices.slice(0, MAX_SLICES - 1);
    const otherTotal = allSlices.slice(MAX_SLICES - 1).reduce((sum, s) => sum + s.value, 0);
    chartData = [...topSlices, { name: 'Other', value: otherTotal }];
  }

  const chartHeight = isMobile ? 300 : 400;
  const outerRadius = isMobile ? 60 : 100;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.name === 'Other' ? '#9ca3af' : COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value as number)}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--card-foreground))',
          }}
          itemStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
          labelStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
