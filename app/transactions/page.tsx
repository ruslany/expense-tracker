import { AppShell } from '@/components/app-shell';
import { TransactionsTable } from '@/components/transactions/table';
import { SearchTransactions } from '@/components/transactions/search';
import { TransactionsPagination } from '@/components/transactions/pagination';
import { CategoryFilter, AccountFilter, TagFilter } from '@/components/transactions/filters';
import { DateRangeFilter } from '@/components/date-range-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTransactionsPages, fetchCategories, fetchAccounts, fetchTags } from '@/lib/data';

export default async function TransactionsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    pageSize?: string;
    categoryId?: string;
    accountId?: string;
    tagId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 10;
  const categoryId = searchParams?.categoryId;
  const accountId = searchParams?.accountId;
  const tagId = searchParams?.tagId;
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;

  const [totalPages, categories, accounts, tags] = await Promise.all([
    fetchTransactionsPages(query, pageSize, categoryId, accountId, tagId, startDate, endDate),
    fetchCategories(),
    fetchAccounts(),
    fetchTags(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">View and manage all your transactions</p>
          </div>
          <DateRangeFilter
            key={`dates-${startDate}-${endDate}`}
            startDate={startDate ? new Date(startDate + 'T00:00:00') : undefined}
            endDate={endDate ? new Date(endDate + 'T00:00:00') : undefined}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <SearchTransactions placeholder="Search transactions..." />
              <CategoryFilter categories={categories} />
              <AccountFilter accounts={accounts} />
              <TagFilter tags={tags} />
            </div>
            <TransactionsTable
              query={query}
              currentPage={currentPage}
              pageSize={pageSize}
              categoryId={categoryId}
              accountId={accountId}
              tagId={tagId}
              startDate={startDate}
              endDate={endDate}
            />
            <div className="flex justify-center">
              <TransactionsPagination totalPages={totalPages} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
