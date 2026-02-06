import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YearFilter } from '@/components/big-expenses/year-filter';
import { ParamsInitializer } from '@/components/big-expenses/params-initializer';
import { ExpensesByTagChart } from '@/components/big-expenses/expenses-by-tag-chart';
import { ExpensesByTagTable } from '@/components/big-expenses/expenses-by-tag-table';
import { SummaryStats } from '@/components/summary-stats';
import { getPrisma } from '@/lib/prisma';

export async function generateMetadata({ searchParams }: PageProps) {
  const { year } = await searchParams;
  const displayYear = year || new Date().getFullYear();
  return { title: `${displayYear} Big Expenses` };
}

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

async function getAvailableYears() {
  const prisma = await getPrisma();
  const result = await prisma.transaction.findMany({
    select: { date: true },
    distinct: ['date'],
  });

  const years = new Set<number>();
  for (const t of result) {
    years.add(t.date.getUTCFullYear());
  }

  const yearsArray = Array.from(years).sort((a, b) => b - a);
  if (yearsArray.length === 0) {
    yearsArray.push(new Date().getFullYear());
  }
  return yearsArray;
}

interface TagExpense {
  tagId: string;
  tagName: string;
  total: number;
  maxTransaction: number;
  count: number;
}

async function getExpensesByBigExpenseTags(year: number): Promise<{
  data: TagExpense[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
}> {
  const prisma = await getPrisma();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  // Include all transactions (expenses and refunds) to get net amounts
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: yearStart, lt: yearEnd },
      tags: {
        some: {
          tag: { isBigExpense: true },
        },
      },
    },
    include: {
      tags: {
        include: { tag: true },
        where: { tag: { isBigExpense: true } },
      },
    },
  });

  const tagMap = new Map<
    string,
    { name: string; total: number; maxTransaction: number; count: number }
  >();

  for (const t of transactions) {
    for (const tt of t.tags) {
      const existing = tagMap.get(tt.tagId);
      // Negate amount: expenses (-) become positive, refunds (+) become negative (deductions)
      const netAmount = -t.amount;
      const absAmount = Math.abs(t.amount);
      if (existing) {
        existing.total += netAmount;
        existing.maxTransaction = Math.max(existing.maxTransaction, absAmount);
        existing.count += 1;
      } else {
        tagMap.set(tt.tagId, {
          name: tt.tag.name,
          total: netAmount,
          maxTransaction: absAmount,
          count: 1,
        });
      }
    }
  }

  const grandTotal = Array.from(tagMap.values()).reduce((sum, t) => sum + t.total, 0);
  const totalCount = Array.from(tagMap.values()).reduce((sum, t) => sum + t.count, 0);
  const overallMaxTransaction = Math.max(
    ...Array.from(tagMap.values()).map((t) => t.maxTransaction),
    0,
  );

  const data: TagExpense[] = Array.from(tagMap.entries())
    .map(([tagId, stats]) => ({
      tagId,
      tagName: stats.name,
      total: stats.total,
      maxTransaction: stats.maxTransaction,
      count: stats.count,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    data,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalCount,
    overallMaxTransaction: Math.round(overallMaxTransaction * 100) / 100,
  };
}

export default async function BigExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentYear = params.year ? parseInt(params.year, 10) : new Date().getFullYear();

  const [availableYears, expensesByTag] = await Promise.all([
    getAvailableYears(),
    getExpensesByBigExpenseTags(currentYear),
  ]);

  return (
    <AppShell>
      <ParamsInitializer availableYears={availableYears} availableTagIds={[]} />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{currentYear} Big Expenses</h1>
            <p className="text-muted-foreground">Track yearly expenses by tag</p>
          </div>
          <YearFilter availableYears={availableYears} />
        </div>

        <SummaryStats
          totalExpenses={expensesByTag.grandTotal}
          transactionCount={expensesByTag.totalCount}
          maxTransaction={expensesByTag.overallMaxTransaction}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Tag ({currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesByTagChart data={expensesByTag.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tag Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesByTagTable
                data={expensesByTag.data}
                grandTotal={expensesByTag.grandTotal}
                totalCount={expensesByTag.totalCount}
                overallMaxTransaction={expensesByTag.overallMaxTransaction}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
