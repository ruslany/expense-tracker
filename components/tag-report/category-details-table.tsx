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

interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string;
  total: number;
  percent: number;
  count: number;
  maxTransaction: number;
}

interface CategoryDetailsTableProps {
  data: CategoryBreakdown[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
  tagName: string;
  tagId?: string;
  startDate?: string;
  endDate?: string;
}

export function CategoryDetailsTable({
  data,
  grandTotal,
  totalCount,
  overallMaxTransaction,
  tagName,
  tagId,
  startDate,
  endDate,
}: CategoryDetailsTableProps) {
  const { ref: cardRef, handleScreenshot } = useScreenshot();

  function getCategoryHref(row: CategoryBreakdown) {
    const categoryId = row.categoryId ?? 'uncategorized';
    const params = new URLSearchParams({ categoryId });
    if (tagId) params.set('tagId', tagId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return `/transactions?${params.toString()}`;
  }

  return (
    <Card ref={cardRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Category Details for &quot;{tagName}&quot;</CardTitle>
        <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Screenshot">
          <Camera className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No category data available for the selected filters.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {data.map((row) => (
                <div key={row.categoryName} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={getCategoryHref(row)} className="font-medium hover:underline">
                      {row.categoryName}
                    </Link>
                    <span className="font-semibold">{formatCurrency(row.total)}</span>
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
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Max Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.categoryName}>
                      <TableCell className="font-medium">
                        <Link href={getCategoryHref(row)} className="hover:underline">
                          {row.categoryName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.maxTransaction)}
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
