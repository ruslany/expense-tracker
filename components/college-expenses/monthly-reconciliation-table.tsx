import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface MonthlyRow {
  monthKey: string;
  expenseTotal: number;
  expenseReceiptCount: number;
  reimbursement: { date: Date; amount: number; receiptCount: number } | null;
  matched: boolean;
  note: string | null;
}

interface MonthlyReconciliationTableProps {
  rows: MonthlyRow[];
  tagId: string;
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function monthHref(monthKey: string, tagId: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0];
  const params = new URLSearchParams({ tagId, startDate, endDate });
  return `/transactions?${params.toString()}`;
}

function receiptsBadge(row: MonthlyRow) {
  const hasExpenseReceipt = row.expenseReceiptCount > 0;
  const hasReimbursementReceipt = (row.reimbursement?.receiptCount ?? 0) > 0;
  if (hasExpenseReceipt && hasReimbursementReceipt) {
    return <Badge variant="secondary">Both attached</Badge>;
  }
  if (hasExpenseReceipt || hasReimbursementReceipt) {
    return <Badge variant="outline">Partial</Badge>;
  }
  return <Badge variant="outline">None</Badge>;
}

export function MonthlyReconciliationTable({ rows, tagId }: MonthlyReconciliationTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Reconciliation</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses or reimbursements found for this budget.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Expense</TableHead>
                  <TableHead>Reimbursement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.monthKey}>
                    <TableCell className="font-medium">{monthLabel(row.monthKey)}</TableCell>
                    <TableCell className="text-right">
                      {row.expenseTotal > 0 ? (
                        <Link href={monthHref(row.monthKey, tagId)} className="hover:underline">
                          {formatCurrency(row.expenseTotal)}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {row.reimbursement
                        ? `${formatCurrency(row.reimbursement.amount)} on ${formatDate(row.reimbursement.date)}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {row.matched ? (
                        <Badge variant="secondary">Matched</Badge>
                      ) : (
                        <Badge variant="destructive">{row.note}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{receiptsBadge(row)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
