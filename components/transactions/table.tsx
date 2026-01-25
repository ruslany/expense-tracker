import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchFilteredTransactions } from '@/lib/data';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export async function TransactionsTable({
  query,
  currentPage,
  pageSize,
}: {
  query: string;
  currentPage: number;
  pageSize: number;
}) {
  const transactions = await fetchFilteredTransactions(query, currentPage, pageSize);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <div className="max-w-75 truncate" title={transaction.description}>
                    {transaction.description}
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.category ? (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                      {transaction.category}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell>{transaction.account.name}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      'font-medium',
                      transaction.amount < 0 ? 'text-destructive' : 'text-green-600',
                    )}
                  >
                    {transaction.amount < 0 ? '' : '+'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
