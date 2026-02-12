import React from 'react';
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
import { Scissors } from 'lucide-react';
import { CategoryCell } from './category-cell';
import { TagsCell } from './tags-cell';
import { TransactionActions } from './actions';
import { TransactionNotePopover } from './note-popover';

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
        {transactions.map((transaction) => {
          const isSplit = transaction.splits.length > 0;
          return (
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
                <div
                  className="text-sm font-medium flex items-center gap-1"
                  title={transaction.description}
                >
                  {isSplit && <Scissors className="size-3 text-muted-foreground shrink-0" />}
                  {transaction.description}
                </div>

                {/* Split breakdown */}
                {isSplit && (
                  <div className="rounded-md bg-muted/30 p-2 space-y-1">
                    {transaction.splits.map((split) => (
                      <div key={split.id} className="flex items-center justify-between text-xs">
                        <span className="truncate mr-2">
                          {split.description}
                          {split.category && (
                            <span className="text-muted-foreground ml-1">({split.category})</span>
                          )}
                        </span>
                        <span className="font-medium shrink-0 text-red-400/70 dark:text-red-400/50">
                          {formatCurrency(split.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <TagsCell
                  transactionId={transaction.id}
                  tags={transaction.tags}
                  allTags={allTags}
                />

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
                <div className="flex items-center justify-end gap-1">
                  <TransactionNotePopover
                    transactionId={transaction.id}
                    notes={transaction.notes}
                  />
                  <TransactionActions
                    transactionId={transaction.id}
                    date={transaction.date}
                    description={transaction.description}
                    amount={transaction.amount}
                    categoryId={transaction.categoryId}
                    categories={categories}
                    isSplit={isSplit}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            {transactions.map((transaction) => {
              const isSplit = transaction.splits.length > 0;
              return (
                <React.Fragment key={transaction.id}>
                  <TableRow>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div
                          className="max-w-75 truncate flex items-center gap-1"
                          title={transaction.description}
                        >
                          {isSplit && (
                            <Scissors className="size-3 text-muted-foreground shrink-0" />
                          )}
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
                      <div className="flex items-center gap-1">
                        <TransactionNotePopover
                          transactionId={transaction.id}
                          notes={transaction.notes}
                        />
                        <TransactionActions
                          transactionId={transaction.id}
                          date={transaction.date}
                          description={transaction.description}
                          amount={transaction.amount}
                          categoryId={transaction.categoryId}
                          categories={categories}
                          isSplit={isSplit}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  {isSplit &&
                    transaction.splits.map((split) => (
                      <TableRow key={split.id} className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell>
                          <div className="pl-5 text-sm text-muted-foreground">
                            {split.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {split.category ?? 'Uncategorized'}
                          </span>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-red-400/70 dark:text-red-400/50">
                            {formatCurrency(split.amount)}
                          </span>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
