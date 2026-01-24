"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

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
              <TableCell className="text-right font-bold">{formatCurrency(overallMaxTransaction)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
