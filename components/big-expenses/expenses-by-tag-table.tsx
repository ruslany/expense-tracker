'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useScreenshot } from '@/hooks/use-screenshot';
import { formatCurrency } from '@/lib/utils';

interface TagExpense {
  tagId: string;
  tagName: string;
  total: number;
  maxTransaction: number;
  count: number;
}

interface ExpensesByTagTableProps {
  data: TagExpense[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
  year: number;
}

export function ExpensesByTagTable({
  data,
  grandTotal,
  totalCount,
  overallMaxTransaction,
  year,
}: ExpensesByTagTableProps) {
  const { ref: cardRef, handleScreenshot } = useScreenshot();

  function getTagHref(row: TagExpense) {
    const startDate = new Date(Date.UTC(year, 0, 1)).toISOString().split('T')[0];
    const endDate = new Date(Date.UTC(year, 11, 31)).toISOString().split('T')[0];
    const params = new URLSearchParams({ tagId: row.tagId, startDate, endDate });
    return `/transactions?${params.toString()}`;
  }

  return (
    <Card ref={cardRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tag Details ({year})</CardTitle>
        <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Screenshot">
          <Camera className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses found for the selected year.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {data.map((row) => (
                <div key={row.tagId} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={getTagHref(row)} className="font-medium hover:underline">
                      {row.tagName}
                    </Link>
                    <span className="font-semibold">{formatCurrency(Math.abs(row.total))}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{row.count} txns</span>
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
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Max Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.tagId}>
                      <TableCell className="font-medium">
                        <Link href={getTagHref(row)} className="hover:underline">
                          {row.tagName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Math.abs(row.total))}
                      </TableCell>
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
                    <TableCell className="text-right font-bold">
                      {formatCurrency(grandTotal)}
                    </TableCell>
                    <TableCell className="text-right font-bold">{totalCount}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(overallMaxTransaction)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
