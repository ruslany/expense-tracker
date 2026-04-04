'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Camera } from 'lucide-react';
import { useScreenshot } from '@/hooks/use-screenshot';

interface SpendingDataPoint {
  date: string;
  runningTotal: number | null;
  prevYearRunningTotal: number | null;
  essentialRunningTotal: number | null;
}

interface OverviewChartsProps {
  spendingOverTime: SpendingDataPoint[];
  monthlyBudget: number | null;
  year: number;
  month: number;
}

export function OverviewCharts({ spendingOverTime, monthlyBudget, year, month }: OverviewChartsProps) {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 300;
  const hasPrevYearData = spendingOverTime.some((d) => d.prevYearRunningTotal !== null);
  const hasEssentialData = spendingOverTime.some((d) => d.essentialRunningTotal !== null);
  const { ref: cardRef, handleScreenshot } = useScreenshot();

  return (
    <Card ref={cardRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Spending Over Time</CardTitle>
          <CardDescription>
            {new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Screenshot">
          <Camera className="h-4 w-4" />
        </Button>
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
                  essentialRunningTotal: 'Essential',
                };
                return [`$${value.toLocaleString()}`, labels[name] ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  runningTotal: 'This Year',
                  prevYearRunningTotal: 'Last Year',
                  essentialRunningTotal: 'Essential',
                };
                return labels[value] ?? value;
              }}
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
            {hasEssentialData && (
              <Line
                type="monotone"
                dataKey="essentialRunningTotal"
                name="essentialRunningTotal"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
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
