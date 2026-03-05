'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
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
    }
  | {
      view: 'essential';
      data: EssentialDataPoint[];
      groupBy: 'month' | 'quarter' | 'year';
    };

const defaultChartConfig = {
  amount: {
    label: 'Spent',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const essentialChartConfig = {
  essential: {
    label: 'Essential',
    color: 'var(--chart-1)',
  },
  discretionary: {
    label: 'Discretionary',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const budgetMultiplier = { month: 1, quarter: 3, year: 12 } as const;

export function TrendsChart(props: TrendsChartProps) {
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
      <Card>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={essentialChartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={props.data}
              margin={{ left: 12, right: 12 }}
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

  return (
    <Card>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={defaultChartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={props.data}
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
                  className="w-[150px]"
                  labelFormatter={(value) => String(value)}
                  formatter={(value) => (
                    <div className="flex w-full items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: 'var(--color-amount)' }}
                      />
                      <div className="flex flex-1 justify-between items-center leading-none">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatCurrency(value as number)}
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="amount" fill="var(--color-amount)" />
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
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
