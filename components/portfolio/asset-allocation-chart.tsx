'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-media-query';
import { formatCurrency } from '@/lib/utils';
import type { PortfolioEntry, AssetClass } from '@/types';
import { ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/types';

interface AssetAllocationChartProps {
  entries: PortfolioEntry[];
}

export function AssetAllocationChart({ entries }: AssetAllocationChartProps) {
  const isMobile = useIsMobile();

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

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  const chartHeight = isMobile ? 300 : 400;
  const outerRadius = isMobile ? 60 : 100;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
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

      <Card>
        <CardHeader>
          <CardTitle>By Asset Type</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {chartData.map((row) => (
              <div key={row.assetClass} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{row.name}</span>
                  <span className="font-semibold">{formatCurrency(row.value)}</span>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {totalValue > 0 ? ((row.value / totalValue) * 100).toFixed(1) : '0.0'}%
                </div>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalValue)}</span>
              </div>
              <div className="text-sm text-muted-foreground text-right">100.0%</div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={row.assetClass}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ASSET_CLASS_COLORS[row.assetClass] }}
                        />
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.value)}</TableCell>
                    <TableCell className="text-right">
                      {totalValue > 0 ? ((row.value / totalValue) * 100).toFixed(1) : '0.0'}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalValue)}
                  </TableCell>
                  <TableCell className="text-right font-bold">100.0%</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
