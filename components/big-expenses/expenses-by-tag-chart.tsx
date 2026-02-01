'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-media-query';

interface TagExpense {
  tagId: string;
  tagName: string;
  total: number;
  maxTransaction: number;
  percent: number;
}

interface ExpensesByTagChartProps {
  data: TagExpense[];
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

export function ExpensesByTagChart({ data }: ExpensesByTagChartProps) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-75 text-muted-foreground">
        No data for selected big expense tags
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.tagName,
    value: Math.abs(item.total),
    percent: item.percent,
  }));

  const chartHeight = isMobile ? 250 : 350;
  const outerRadius = isMobile ? 70 : 120;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={!isMobile}
          label={
            isMobile ? false : ({ name, percent }) => `${name} (${(percent ?? 0).toFixed(1)}%)`
          }
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
