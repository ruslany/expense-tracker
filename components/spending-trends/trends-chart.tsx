'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-media-query';
import { TrendIndicator } from './trend-indicator';

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

  // Calculate trend (comparing last period to previous period)
  let trendPercentage = 0;
  let comparisonLabel = '';
  if (data.length >= 2) {
    const lastPeriod = data[data.length - 1].amount;
    const previousPeriod = data[data.length - 2].amount;
    if (previousPeriod > 0) {
      trendPercentage = ((lastPeriod - previousPeriod) / previousPeriod) * 100;
    }
    comparisonLabel = `vs ${data[data.length - 2].label}`;
  }

  const chartHeight = isMobile ? 250 : 350;

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            angle={isMobile ? -45 : -30}
            textAnchor="end"
            height={60}
            className="fill-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            className="fill-muted-foreground"
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

      {data.length >= 2 && (
        <div className="flex justify-center">
          <TrendIndicator
            percentChange={trendPercentage}
            comparisonLabel={comparisonLabel}
          />
        </div>
      )}
    </div>
  );
}
