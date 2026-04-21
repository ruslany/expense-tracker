'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { PortfolioEntry, AssetClass } from '@/types';
import { ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/types';

interface AssetAllocationChartProps {
  entries: PortfolioEntry[];
}

export function AssetAllocationChart({ entries }: AssetAllocationChartProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const grouped = entries.reduce<Record<string, number>>((acc, entry) => {
    if (entry.currentValue === null) return acc;
    const key = entry.assetClass;
    acc[key] = (acc[key] ?? 0) + entry.currentValue;
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .map(([key, value]) => ({
      name: ASSET_CLASS_LABELS[key as AssetClass] ?? key,
      value,
      assetClass: key as AssetClass,
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 380}>
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 80 : 130}
              dataKey="value"
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.assetClass} fill={ASSET_CLASS_COLORS[entry.assetClass]} />
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
              itemStyle={{ color: 'hsl(var(--card-foreground))' }}
              labelStyle={{ color: 'hsl(var(--card-foreground))' }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 14 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
