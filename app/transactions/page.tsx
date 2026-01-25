import { AppShell } from '@/components/app-shell';
import { TransactionsTable } from '@/components/transactions/table';
import { SearchTransactions } from '@/components/transactions/search';
import { TransactionsPagination } from '@/components/transactions/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTransactionsPages } from '@/lib/data';

export default async function TransactionsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 10;
  const totalPages = await fetchTransactionsPages(query, pageSize);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchTransactions placeholder="Search transactions..." />
            <TransactionsTable query={query} currentPage={currentPage} pageSize={pageSize} />
            <div className="flex justify-center">
              <TransactionsPagination totalPages={totalPages} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
