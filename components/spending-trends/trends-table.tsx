import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { EssentialDataPoint } from '@/app/trends/page';

interface TrendDataPoint {
  label: string;
  amount: number;
}

type TrendsTableProps =
  | {
      view: 'default';
      data: TrendDataPoint[];
      groupBy: 'month' | 'quarter' | 'year';
    }
  | {
      view: 'essential';
      data: EssentialDataPoint[];
      groupBy: 'month' | 'quarter' | 'year';
    };

const periodLabel = (groupBy: 'month' | 'quarter' | 'year') => {
  if (groupBy === 'year') return 'Year';
  if (groupBy === 'quarter') return 'Quarter';
  return 'Month';
};

export function TrendsTable(props: TrendsTableProps) {
  if (props.data.length === 0) return null;

  if (props.view === 'essential') {
    const rows = props.data;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <div key={row.label} className="border rounded-lg p-3 space-y-1">
                <div className="font-medium">{row.label}</div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Essential</span>
                  <span className="font-mono">{formatCurrency(row.essential)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Discretionary</span>
                  <span className="font-mono">{formatCurrency(row.discretionary)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{periodLabel(props.groupBy)}</TableHead>
                  <TableHead className="text-right">Essential</TableHead>
                  <TableHead className="text-right">Discretionary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(row.essential)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(row.discretionary)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rows = props.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Table</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="space-y-3 md:hidden">
          {rows.map((row) => (
            <div key={row.label} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{row.label}</span>
                <span className="font-mono font-semibold">{formatCurrency(row.amount)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{periodLabel(props.groupBy)}</TableHead>
                <TableHead className="text-right">Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
