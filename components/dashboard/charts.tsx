'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-media-query';

interface SpendingDataPoint {
  date: string;
  runningTotal: number | null;
  prevYearRunningTotal: number | null;
}

interface DashboardChartsProps {
  spendingOverTime: SpendingDataPoint[];
  monthlyBudget: number | null;
}

export function DashboardCharts({ spendingOverTime, monthlyBudget }: DashboardChartsProps) {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 300;
  const hasPrevYearData = spendingOverTime.some((d) => d.prevYearRunningTotal !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={spendingOverTime}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? 'preserveStartEnd' : Math.floor(spendingOverTime.length / 8)}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 50 : 30}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 45 : 60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  runningTotal: 'This Year',
                  prevYearRunningTotal: 'Last Year',
                };
                return [`$${value.toLocaleString()}`, labels[name] ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              formatter={(value: string) => (value === 'runningTotal' ? 'This Year' : 'Last Year')}
            />
            {monthlyBudget != null && (
              <ReferenceLine
                y={monthlyBudget}
                stroke="hsl(var(--destructive))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Budget $${monthlyBudget.toLocaleString()}`,
                  position: 'insideTopRight',
                  fill: 'hsl(var(--destructive))',
                  fontSize: isMobile ? 10 : 12,
                }}
              />
            )}
            {hasPrevYearData && (
              <Line
                type="monotone"
                dataKey="prevYearRunningTotal"
                name="prevYearRunningTotal"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            )}
            <Area
              type="monotone"
              dataKey="runningTotal"
              name="runningTotal"
              stroke="var(--chart-3)"
              strokeWidth={2}
              fill="color-mix(in srgb, var(--chart-3) 15%, transparent)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
