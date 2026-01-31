'use client';

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
import { formatCurrency } from '@/lib/utils';

interface CategorySpending {
  name: string;
  totalExpenses: number;
  percent: number;
  count: number;
  maxTransaction: number;
}

interface SpendingByCategoryTableProps {
  data: CategorySpending[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
}

export function SpendingByCategoryTable({
  data,
  grandTotal,
  totalCount,
  overallMaxTransaction,
}: SpendingByCategoryTableProps) {
  const maxExpense = Math.max(...data.map((d) => d.totalExpenses), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="space-y-3 md:hidden">
          {data.map((row) => (
            <div
              key={row.name}
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{row.name}</span>
                <span className="font-semibold">{formatCurrency(row.totalExpenses)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(row.totalExpenses / maxExpense) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-14 text-right">
                  {row.percent.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{row.count} txns</span>
                <span>Max: {formatCurrency(row.maxTransaction)}</span>
              </div>
            </div>
          ))}
          {/* Mobile Total */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between font-bold">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
              <span>{totalCount} txns</span>
              <span>Max: {formatCurrency(overallMaxTransaction)}</span>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Expenses</TableHead>
                <TableHead className="text-right">Percent</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Max Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-4 bg-muted rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${(row.totalExpenses / maxExpense) * 100}%` }}
                        />
                      </div>
                      <span className="w-24 text-right">{formatCurrency(row.totalExpenses)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{row.percent.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.maxTransaction)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold">Grand Total</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
                <TableCell className="text-right font-bold">100.00%</TableCell>
                <TableCell className="text-right font-bold">{totalCount}</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(overallMaxTransaction)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
