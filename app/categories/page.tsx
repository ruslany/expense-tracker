import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { DateRangeFilter } from '@/components/date-range-filter';
import { SummaryStats } from '@/components/summary-stats';
import { SpendingByCategoryTable } from '@/components/overview/spending-by-category-table';
import { CategoryTreemap } from '@/components/categories-report/category-treemap';
import { getPrisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Spending by Category' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}

async function getCategoryReport(startDate: Date | null, endDate: Date | null) {
  const prisma = await getPrisma();

  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) {
    const nextDay = new Date(endDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    dateFilter.lt = nextDay;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      NOT: { splits: { some: {} } },
    },
    include: { category: true },
  });

  const categoryMap = new Map<
    string,
    {
      id: string | null;
      isEssential: boolean;
      expenses: number;
      credits: number;
      count: number;
      maxExpense: number;
    }
  >();

  for (const t of transactions) {
    const categoryName = t.category?.name ?? 'Uncategorized';
    const existing = categoryMap.get(categoryName);
    if (existing) {
      if (t.amount < 0) {
        existing.expenses += Math.abs(t.amount);
        existing.maxExpense = Math.max(existing.maxExpense, Math.abs(t.amount));
      } else {
        existing.credits += t.amount;
      }
      existing.count += 1;
    } else {
      categoryMap.set(categoryName, {
        id: t.category?.id ?? null,
        isEssential: t.category?.isEssential ?? false,
        expenses: t.amount < 0 ? Math.abs(t.amount) : 0,
        credits: t.amount > 0 ? t.amount : 0,
        count: 1,
        maxExpense: t.amount < 0 ? Math.abs(t.amount) : 0,
      });
    }
  }

  const grandTotal = Array.from(categoryMap.values()).reduce(
    (sum, c) => sum + (c.expenses - c.credits),
    0,
  );
  const totalCount = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.count, 0);
  const overallMaxTransaction = Math.max(
    ...Array.from(categoryMap.values()).map((c) => c.maxExpense),
    0,
  );

  const data = Array.from(categoryMap.entries())
    .map(([name, stats]) => {
      const netSpending = stats.expenses - stats.credits;
      return {
        id: stats.id,
        name,
        isEssential: stats.isEssential,
        totalExpenses: Math.round(netSpending * 100) / 100,
        percent: grandTotal > 0 ? (netSpending / grandTotal) * 100 : 0,
        count: stats.count,
        maxTransaction: Math.round(stats.maxExpense * 100) / 100,
      };
    })
    .sort((a, b) => b.totalExpenses - a.totalExpenses);

  return {
    data,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalCount,
    overallMaxTransaction: Math.round(overallMaxTransaction * 100) / 100,
  };
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const startDateStr = params.startDate ?? null;
  const endDateStr = params.endDate ?? null;
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  const report = await getCategoryReport(startDate, endDate);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  const treemapSubtitle =
    startDate && endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : startDate
        ? `From ${formatDate(startDate)}`
        : endDate
          ? `Until ${formatDate(endDate)}`
          : 'All time';

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spending by Category</h1>
            <p className="text-muted-foreground">Analyze spending by category over a date range</p>
          </div>
          <DateRangeFilter
            key={`dates-${startDateStr}-${endDateStr}`}
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            storageKey="category-report-dates"
          />
        </div>

        <SummaryStats
          totalExpenses={report.grandTotal}
          transactionCount={report.totalCount}
          maxTransaction={report.overallMaxTransaction}
        />

        <CategoryTreemap
          data={report.data}
          title="Spending by Category"
          subtitle={treemapSubtitle}
        />

        <SpendingByCategoryTable
          data={report.data}
          grandTotal={report.grandTotal}
          totalCount={report.totalCount}
          overallMaxTransaction={report.overallMaxTransaction}
          startDate={startDateStr ?? undefined}
          endDate={endDateStr ?? undefined}
        />
      </div>
    </AppShell>
  );
}
