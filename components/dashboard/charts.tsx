'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-media-query';

interface SpendingDataPoint {
  date: string;
  amount: number;
  runningTotal: number;
  budget: number;
}

interface DashboardChartsProps {
  spendingOverTime: SpendingDataPoint[];
}

export function DashboardCharts({ spendingOverTime }: DashboardChartsProps) {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 300;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={spendingOverTime}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? 'preserveStartEnd' : 0}
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
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
            <Line
              type="monotone"
              dataKey="amount"
              name="Daily Spending"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={isMobile ? false : { fill: 'hsl(var(--primary))' }}
            />
            <Line
              type="monotone"
              dataKey="runningTotal"
              name="Running Total"
              stroke="#10b981"
              strokeWidth={2}
              dot={isMobile ? false : { fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="budget"
              name="Budget"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
