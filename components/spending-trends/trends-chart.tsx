'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { EssentialDataPoint } from '@/app/trends/page';
import { Camera } from 'lucide-react';

interface TrendDataPoint {
  label: string;
  amount: number;
}

type TrendsChartProps =
  | {
      view: 'default';
      data: TrendDataPoint[];
      groupBy: 'month' | 'quarter' | 'year';
      monthlyBudget: number | null;
      averagePerPeriod: number;
      categoryName?: string;
    }
  | {
      view: 'essential';
      data: EssentialDataPoint[];
      groupBy: 'month' | 'quarter' | 'year';
      categoryName?: string;
    };

const defaultChartConfig = {
  amount: {
    label: 'Spent',
    color: 'var(--chart-1)',
  },
  movingAvg: {
    label: '3-period avg',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

const essentialChartConfig = {
  essential: {
    label: 'Essential',
    color: '#16a34a',
  },
  discretionary: {
    label: 'Discretionary',
    color: '#2563eb',
  },
} satisfies ChartConfig;

const budgetMultiplier = { month: 1, quarter: 3, year: 12 } as const;

export function TrendsChart(props: TrendsChartProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  async function handleScreenshot() {
    if (!cardRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, style: { borderRadius: '0' } });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }

  if (props.data.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  if (props.view === 'essential') {
    return (
      <Card ref={cardRef}>
        <CardContent className="px-2 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{props.categoryName ?? 'All Categories'}</span>
            <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Screenshot">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <ChartContainer config={essentialChartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart accessibilityLayer data={props.data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    labelFormatter={(value) => String(value)}
                    formatter={(value, name) => (
                      <div className="flex w-full items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor:
                              name === 'essential'
                                ? 'var(--color-essential)'
                                : 'var(--color-discretionary)',
                          }}
                        />
                        <div className="flex flex-1 justify-between items-center leading-none">
                          <span className="text-muted-foreground">
                            {name === 'essential' ? 'Essential' : 'Discretionary'}
                          </span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {formatCurrency(value as number)}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="essential" stackId="a" fill="var(--color-essential)" />
              <Bar dataKey="discretionary" stackId="a" fill="var(--color-discretionary)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  const budgetGoal =
    props.monthlyBudget != null ? props.monthlyBudget * budgetMultiplier[props.groupBy] : null;
  const { averagePerPeriod } = props;

  const showMA = props.groupBy === 'month';

  const dataWithMA = props.data.map((d, i) => ({
    ...d,
    movingAvg: showMA
      ? (() => {
          const window = props.data.slice(Math.max(0, i - 2), i + 1);
          return Math.round((window.reduce((s, p) => s + p.amount, 0) / window.length) * 100) / 100;
        })()
      : null,
  }));

  return (
    <Card ref={cardRef}>
      <CardContent className="px-2 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{props.categoryName ?? 'All Categories'}</span>
          <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Screenshot">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <ChartContainer config={defaultChartConfig} className="aspect-auto h-[250px] w-full">
          <ComposedChart
            accessibilityLayer
            data={dataWithMA}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[175px]"
                  labelFormatter={(value) => String(value)}
                  formatter={(value, name) => {
                    const isMA = name === 'movingAvg';
                    if (isMA && !showMA) return null;
                    return (
                      <div className="flex w-full items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: isMA
                              ? 'var(--color-movingAvg)'
                              : 'var(--color-amount)',
                          }}
                        />
                        <div className="flex flex-1 justify-between items-center leading-none">
                          <span className="text-muted-foreground">
                            {isMA ? '3-period avg' : 'Spent'}
                          </span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {formatCurrency(value as number)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="amount" fill="var(--color-amount)" />
            {showMA && (
              <Line
                dataKey="movingAvg"
                type="monotone"
                stroke="var(--color-movingAvg)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            )}
            {averagePerPeriod > 0 && (
              <ReferenceLine
                y={averagePerPeriod}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Avg ${formatCurrency(averagePerPeriod)}`,
                  position: 'insideBottomRight',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12,
                }}
              />
            )}
            {budgetGoal != null && (
              <ReferenceLine
                y={budgetGoal}
                stroke="hsl(var(--destructive))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Budget ${formatCurrency(budgetGoal)}`,
                  position: 'insideTopRight',
                  fill: 'hsl(var(--destructive))',
                  fontSize: 12,
                }}
              />
            )}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
