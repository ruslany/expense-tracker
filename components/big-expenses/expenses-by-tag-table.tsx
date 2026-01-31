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

interface TagExpense {
  tagId: string;
  tagName: string;
  total: number;
  maxTransaction: number;
  percent: number;
}

interface ExpensesByTagTableProps {
  data: TagExpense[];
  grandTotal: number;
  overallMaxTransaction: number;
}

export function ExpensesByTagTable({
  data,
  grandTotal,
  overallMaxTransaction,
}: ExpensesByTagTableProps) {
  if (data.length === 0) {
    return null;
  }

  const maxExpense = Math.max(...data.map((d) => Math.abs(d.total)), 1);

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div
            key={row.tagId}
            className="border rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{row.tagName}</span>
              <span className="font-semibold">{formatCurrency(Math.abs(row.total))}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${(Math.abs(row.total) / maxExpense) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-14 text-right">
                {row.percent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-end text-sm text-muted-foreground">
              <span>Max: {formatCurrency(Math.abs(row.maxTransaction))}</span>
            </div>
          </div>
        ))}
        {/* Mobile Total */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between font-bold">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex items-center justify-end text-sm text-muted-foreground mt-1">
            <span>Max: {formatCurrency(overallMaxTransaction)}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Percent</TableHead>
              <TableHead className="text-right">Max Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.tagId}>
                <TableCell className="font-medium">{row.tagName}</TableCell>
                <TableCell className="text-right">{formatCurrency(Math.abs(row.total))}</TableCell>
                <TableCell className="text-right">{row.percent.toFixed(2)}%</TableCell>
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
              <TableCell className="text-right font-bold">
                {formatCurrency(overallMaxTransaction)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}
