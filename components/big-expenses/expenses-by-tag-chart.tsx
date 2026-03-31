'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-media-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useScreenshot } from '@/hooks/use-screenshot';

interface TagExpense {
  tagId: string;
  tagName: string;
  total: number;
  maxTransaction: number;
  count: number;
}

interface ExpensesByTagChartProps {
  data: TagExpense[];
  title: string;
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

export function ExpensesByTagChart({ data, title }: ExpensesByTagChartProps) {
  const isMobile = useIsMobile();
  const { ref: cardRef, handleScreenshot } = useScreenshot();

  const chartData = data.map((item) => ({
    name: item.tagName,
    value: Math.abs(item.total),
  }));

  const chartHeight = isMobile ? 300 : 400;
  const outerRadius = isMobile ? 60 : 100;

  return (
    <Card ref={cardRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Screenshot">
          <Camera className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-75 text-muted-foreground">
            No data for selected big expense tags
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
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
        )}
      </CardContent>
    </Card>
  );
}
