'use client';

import { PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useScreenshot } from '@/hooks/use-screenshot';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import type { PortfolioEntry, AssetClass } from '@/types';
import { ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/types';

interface AssetAllocationChartProps {
  entries: PortfolioEntry[];
}

const chartConfig = Object.fromEntries(
  Object.entries(ASSET_CLASS_LABELS).map(([key, label]) => [
    key,
    { label, color: ASSET_CLASS_COLORS[key as AssetClass] },
  ]),
) satisfies ChartConfig;

export function AssetAllocationChart({ entries }: AssetAllocationChartProps) {
  const { ref: chartRef, handleScreenshot: handleChartScreenshot } = useScreenshot();
  const { ref: tableRef, handleScreenshot: handleTableScreenshot } = useScreenshot();

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
      fill: ASSET_CLASS_COLORS[key as AssetClass],
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) return null;

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

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
              <ChartLegend content={<ChartLegendContent nameKey="assetClass" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card ref={tableRef}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>By Asset Type</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={handleTableScreenshot}
            aria-label="Screenshot"
          >
            <Camera className="h-4 w-4" />
          </Button>
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
