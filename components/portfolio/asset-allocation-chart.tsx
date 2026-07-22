'use client';

import { useState } from 'react';
import { PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScreenshot } from '@/hooks/use-screenshot';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import type { PortfolioEntry, AssetClass } from '@/types';
import { ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/types';

interface AssetAllocationChartProps {
  entries: PortfolioEntry[];
}

type GroupByOption = 'assetClass' | 'account';

// Fixed-order categorical palette, validated for CVD-safe adjacent contrast.
// Accounts beyond this length fall back to a shared neutral color rather than
// cycling hues, which would make two different accounts look identical.
const ACCOUNT_COLORS = [
  '#2a78d6',
  '#1baf7a',
  '#eda100',
  '#008300',
  '#4a3aa7',
  '#e34948',
  '#e87ba4',
  '#eb6834',
];
const ACCOUNT_COLOR_FALLBACK = ASSET_CLASS_COLORS.other;

// Bundle accounts beyond this count into "Other" so the pie doesn't get
// overloaded with slices, and so every remaining slice keeps a distinct color
// instead of several unrelated accounts sharing the fallback gray.
const MAX_ACCOUNT_SLICES = ACCOUNT_COLORS.length;

// Accounts making up less than this share of the total also get bundled into
// "Other", even when there are few accounts overall — thin slices otherwise
// produce overlapping percentage labels on the pie.
const MIN_ACCOUNT_SLICE_PERCENT = 4;

const UNASSIGNED_ACCOUNT_LABEL = 'Unassigned';
const OTHER_ACCOUNT_LABEL = 'Other';

interface AllocationRow {
  groupKey: string;
  name: string;
  value: number;
  fill: string;
}

function buildAssetClassRows(entries: PortfolioEntry[]): AllocationRow[] {
  const grouped = entries.reduce<Record<string, number>>((acc, entry) => {
    if (entry.currentValue === null) return acc;
    acc[entry.assetClass] = (acc[entry.assetClass] ?? 0) + entry.currentValue;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([key, value]) => ({
      groupKey: key,
      name: ASSET_CLASS_LABELS[key as AssetClass] ?? key,
      value,
      fill: ASSET_CLASS_COLORS[key as AssetClass],
    }))
    .sort((a, b) => b.value - a.value);
}

function buildAccountRows(entries: PortfolioEntry[]): AllocationRow[] {
  const grouped = entries.reduce<Record<string, number>>((acc, entry) => {
    if (entry.currentValue === null) return acc;
    const key = entry.accountName || UNASSIGNED_ACCOUNT_LABEL;
    acc[key] = (acc[key] ?? 0) + entry.currentValue;
    return acc;
  }, {});

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, value]) => sum + value, 0);
  const countLimit = sorted.length > MAX_ACCOUNT_SLICES ? MAX_ACCOUNT_SLICES - 1 : sorted.length;

  const topEntries: [string, number][] = [];
  const otherEntries: [string, number][] = [];
  sorted.forEach(([key, value], i) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    if (i < countLimit && percent >= MIN_ACCOUNT_SLICE_PERCENT) {
      topEntries.push([key, value]);
    } else {
      otherEntries.push([key, value]);
    }
  });

  const rows: AllocationRow[] = topEntries.map(([key, value], i) => ({
    groupKey: key,
    name: key,
    value,
    fill: ACCOUNT_COLORS[i] ?? ACCOUNT_COLOR_FALLBACK,
  }));

  if (otherEntries.length > 0) {
    const otherTotal = otherEntries.reduce((sum, [, value]) => sum + value, 0);
    rows.push({
      groupKey: OTHER_ACCOUNT_LABEL,
      name: OTHER_ACCOUNT_LABEL,
      value: otherTotal,
      fill: ACCOUNT_COLOR_FALLBACK,
    });
  }

  return rows;
}

export function AssetAllocationChart({ entries }: AssetAllocationChartProps) {
  const { ref: chartRef, handleScreenshot: handleChartScreenshot } = useScreenshot();
  const { ref: tableRef, handleScreenshot: handleTableScreenshot } = useScreenshot();
  const [groupBy, setGroupBy] = useState<GroupByOption>(() => {
    try {
      return (
        (localStorage.getItem('portfolio-allocation-group-by') as GroupByOption | null) ??
        'assetClass'
      );
    } catch {
      return 'assetClass';
    }
  });

  const handleGroupByChange = (value: GroupByOption) => {
    setGroupBy(value);
    try {
      localStorage.setItem('portfolio-allocation-group-by', value);
    } catch {
      // ignore
    }
  };

  const chartData =
    groupBy === 'assetClass' ? buildAssetClassRows(entries) : buildAccountRows(entries);

  if (chartData.length === 0) return null;

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  const chartConfig: ChartConfig = Object.fromEntries(
    chartData.map((row) => [row.groupKey, { label: row.name, color: row.fill }]),
  );
  const breakdownLabel = groupBy === 'assetClass' ? 'Asset Type' : 'Account';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card ref={chartRef}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Asset Allocation</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={handleChartScreenshot}
            aria-label="Screenshot"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, item) => (
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.payload?.fill }}
                        />
                        <span>{name}</span>
                        <span className="ml-auto font-medium">
                          {formatCurrency(value as number)}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
              />
              <ChartLegend content={<ChartLegendContent nameKey="groupKey" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card ref={tableRef}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>By {breakdownLabel}</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Select
              value={groupBy}
              onValueChange={(value) => handleGroupByChange(value as GroupByOption)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assetClass">By Asset Type</SelectItem>
                <SelectItem value="account">By Account</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleTableScreenshot}
              aria-label="Screenshot"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {chartData.map((row) => (
              <div key={row.groupKey} className="border rounded-lg p-3 space-y-1">
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
                  <TableHead>{breakdownLabel}</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={row.groupKey}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: row.fill }}
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
