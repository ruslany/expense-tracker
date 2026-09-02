import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface CalendarYearRow {
  year: number;
  expenseTotal: number;
  reimbursementTotal: number;
}

interface CalendarYearRollupTableProps {
  rows: CalendarYearRow[];
}

export function CalendarYearRollupTable({ rows }: CalendarYearRollupTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Year Rollup</CardTitle>
        <CardDescription>
          The 529 plan reports distributions per calendar year on Form 1099-Q, while the budget
          above is tracked per academic year. Use this to see what each tax year&apos;s figures will
          look like.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No data for this budget.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Calendar Year</TableHead>
                  <TableHead className="text-right">Expenses Paid</TableHead>
                  <TableHead className="text-right">529 Distributions</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell className="font-medium">{row.year}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.expenseTotal)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.reimbursementTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.expenseTotal - row.reimbursementTotal)}
                    </TableCell>
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
