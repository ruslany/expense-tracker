'use client';

import { Treemap, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  name: string;
  totalExpenses: number;
  percent: number;
}

interface CategoryTreemapProps {
  data: CategoryData[];
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

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const { name, size, percent } = payload[0].payload as {
    name: string;
    size: number;
    percent: number;
  };
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        color: 'hsl(var(--card-foreground))',
        padding: '8px 12px',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
      <div>
        {formatCurrency(size)}, {percent.toFixed(1)}%
      </div>
    </div>
  );
}

interface ContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  index?: number;
}

function CustomContent({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name,
  value,
  index = 0,
}: ContentProps) {
  const color = COLORS[index % COLORS.length];
  const showLabel = width > 60 && height > 40;
  const showValue = width > 80 && height > 60;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: color, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
        rx={4}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 10 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={Math.min(14, width / 8)}
          fontWeight={600}
        >
          {name && name.length > width / 8 ? `${name.slice(0, Math.floor(width / 8))}…` : name}
        </text>
      )}
      {showValue && value !== undefined && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize={Math.min(12, width / 10)}
        >
          {formatCurrency(value)}
        </text>
      )}
    </g>
  );
}

export function CategoryTreemap({ data }: CategoryTreemapProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        No data available
      </div>
    );
  }

  const chartData = data
    .filter((d) => d.totalExpenses > 0)
    .map((d) => ({ name: d.name, size: d.totalExpenses, percent: d.percent }));

  return (
    <ResponsiveContainer width="100%" height={400} debounce={200}>
      <Treemap data={chartData} dataKey="size" content={<CustomContent />} isAnimationActive={false}>
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
