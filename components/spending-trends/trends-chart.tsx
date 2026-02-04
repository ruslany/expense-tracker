'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-media-query';

interface TrendDataPoint {
  label: string;
  amount: number;
}

interface TrendsChartProps {
  data: TrendDataPoint[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-75 text-muted-foreground">
        No data available for the selected period
      </div>
    );
  }

  const chartHeight = isMobile ? 250 : 350;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.3)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'hsl(var(--foreground))' }}
          angle={isMobile ? -45 : -30}
          textAnchor="end"
          height={80}
          dy={10}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'hsl(var(--foreground))' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value as number), 'Spent']}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--card-foreground))',
          }}
          labelStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
