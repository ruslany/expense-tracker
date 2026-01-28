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

  return (
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
            <TableCell className="text-right">{formatCurrency(Math.abs(row.maxTransaction))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-bold">Grand Total</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
          <TableCell className="text-right font-bold">100.00%</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(overallMaxTransaction)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
