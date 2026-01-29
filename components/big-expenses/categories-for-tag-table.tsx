'use client';

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

interface CategoryBreakdown {
  categoryName: string;
  total: number;
  percent: number;
  count: number;
  maxTransaction: number;
}

interface CategoriesForTagTableProps {
  data: CategoryBreakdown[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
}

export function CategoriesForTagTable({
  data,
  grandTotal,
  totalCount,
  overallMaxTransaction,
}: CategoriesForTagTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground text-sm italic py-4">
        No transactions found for this tag.
      </div>
    );
  }

  const maxExpense = Math.max(...data.map((d) => Math.abs(d.total)), 1);

  return (
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
          <TableRow key={row.categoryName}>
            <TableCell className="font-medium">{row.categoryName}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-24 h-4 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(Math.abs(row.total) / maxExpense) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right">{formatCurrency(Math.abs(row.total))}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">{row.percent.toFixed(2)}%</TableCell>
            <TableCell className="text-right">{row.count}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(Math.abs(row.maxTransaction))}
            </TableCell>
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
  );
}
