import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
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
  startDate,
  endDate,
}: {
  query: string;
  currentPage: number;
  pageSize: number;
  categoryId?: string;
  accountId?: string;
  tagId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [transactions, categories, allTags] = await Promise.all([
    fetchFilteredTransactions(
      query,
      currentPage,
      pageSize,
      categoryId,
      accountId,
      tagId,
      startDate,
      endDate,
    ),
    fetchCategories(),
    fetchTags(),
  ]);

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-muted-foreground">
        No transactions found.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4 space-y-3">
              {/* Header: Date and Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    transaction.amount < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400',
                  )}
                >
                  {transaction.amount < 0 ? '' : '+'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>

              {/* Description */}
              <div className="text-sm font-medium" title={transaction.description}>
                {transaction.description}
              </div>

              {/* Tags */}
              <TagsCell transactionId={transaction.id} tags={transaction.tags} allTags={allTags} />

              {/* Category and Account */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <CategoryCell
                    transactionId={transaction.id}
                    categoryId={transaction.categoryId}
                    categoryName={transaction.category}
                    categories={categories}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{transaction.account.name}</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <TransactionActions
                  transactionId={transaction.id}
                  date={transaction.date}
                  description={transaction.description}
                  amount={transaction.amount}
                  categoryId={transaction.categoryId}
                  categories={categories}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
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
            {transactions.map((transaction) => (
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
                      transaction.amount < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400',
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
                    categoryId={transaction.categoryId}
                    categories={categories}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
