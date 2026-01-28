import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchFilteredTransactions, fetchCategories, fetchTags } from '@/lib/data';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { CategoryCell } from './category-cell';
import { TagsCell } from './tags-cell';
import { TransactionActions } from './actions';

export async function TransactionsTable({
  query,
  currentPage,
  pageSize,
  categoryId,
  accountId,
  tagId,
}: {
  query: string;
  currentPage: number;
  pageSize: number;
  categoryId?: string;
  accountId?: string;
  tagId?: string;
}) {
  const [transactions, categories, allTags] = await Promise.all([
    fetchFilteredTransactions(query, currentPage, pageSize, categoryId, accountId, tagId),
    fetchCategories(),
    fetchTags(),
  ]);

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
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="max-w-75 truncate" title={transaction.description}>
                      {transaction.description}
                    </div>
                    <TagsCell
                      transactionId={transaction.id}
                      tags={transaction.tags}
                      allTags={allTags}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <CategoryCell
                    transactionId={transaction.id}
                    categoryId={transaction.categoryId}
                    categoryName={transaction.category}
                    categories={categories}
                  />
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
                <TableCell>
                  <TransactionActions
                    transactionId={transaction.id}
                    date={transaction.date}
                    description={transaction.description}
                    amount={transaction.amount}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
