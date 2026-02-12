import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { DashboardCharts } from '@/components/dashboard/charts';
import { DashboardPeriodFilter } from '@/components/dashboard/period-filter';
import { SpendingByCategoryTable } from '@/components/dashboard/spending-by-category-table';
import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp } from 'lucide-react';
import { getPrisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
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

async function getStats(year: number, month: number) {
  const prisma = await getPrisma();
  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      NOT: { splits: { some: {} } },
    },
  });

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCredits = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Net spending = expenses minus refunds/credits
  const netSpent = totalExpenses - totalCredits;

  const transactionCount = transactions.length;

  const maxTransaction =
    transactions.length > 0 ? Math.max(...transactions.map((t) => Math.abs(t.amount))) : 0;

  return {
    totalExpenses,
    netSpent,
    totalCredits,
    transactionCount,
    maxTransaction,
  };
}

async function getCategorySpendingTable(year: number, month: number) {
  const prisma = await getPrisma();
  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  // Include all transactions (expenses and credits/refunds)
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      NOT: { splits: { some: {} } },
    },
    include: {
      category: true,
    },
  });

  // Group by category with net totals (expenses - credits), count, and max expense
  const categoryMap = new Map<
    string,
    { id: string | null; expenses: number; credits: number; count: number; maxExpense: number }
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
        expenses: t.amount < 0 ? Math.abs(t.amount) : 0,
        credits: t.amount > 0 ? t.amount : 0,
        count: 1,
        maxExpense: t.amount < 0 ? Math.abs(t.amount) : 0,
      });
    }
  }

  // Calculate net spending per category (expenses - credits)
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

async function getRunningTotalForMonth(year: number, month: number) {
  const prisma = await getPrisma();
  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      NOT: { splits: { some: {} } },
    },
    orderBy: { date: 'asc' },
  });

  // Group net spending by day-of-month
  const spendingByDay = new Map<number, number>();
  for (const t of transactions) {
    const day = t.date.getUTCDate();
    const current = spendingByDay.get(day) ?? 0;
    if (t.amount < 0) {
      spendingByDay.set(day, current + Math.abs(t.amount));
    } else {
      spendingByDay.set(day, current - t.amount);
    }
  }

  // Build running total across all days in the month
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lastDayWithData = spendingByDay.size > 0 ? Math.max(...spendingByDay.keys()) : 0;
  const result = new Map<number, number>();
  let runningTotal = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const daySpending = spendingByDay.get(day) ?? 0;
    runningTotal += daySpending;
    result.set(day, Math.round(runningTotal * 100) / 100);
  }
  return { totals: result, lastDayWithData };
}

async function getSpendingOverTime(year: number, month: number) {
  const [current, prevYear] = await Promise.all([
    getRunningTotalForMonth(year, month),
    getRunningTotalForMonth(year - 1, month),
  ]);

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const monthName = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      date: `${monthName} ${day}`,
      runningTotal: day <= current.lastDayWithData ? (current.totals.get(day) ?? 0) : null,
      prevYearRunningTotal: prevYear.lastDayWithData > 0 ? (prevYear.totals.get(day) ?? 0) : null,
    };
  });
}

export default async function Dashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const currentYear = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const currentMonth = params.month ? parseInt(params.month, 10) : now.getMonth();

  const [availableYears, stats, categorySpendingTable, spendingOverTime] = await Promise.all([
    getAvailableYears(),
    getStats(currentYear, currentMonth),
    getCategorySpendingTable(currentYear, currentMonth),
    getSpendingOverTime(currentYear, currentMonth),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your expenses and income</p>
          </div>
          <DashboardPeriodFilter availableYears={availableYears} />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Net Spent"
            value={formatCurrency(stats.netSpent)}
            valueColor="red"
            subtext="After refunds"
            icon={<ArrowDownIcon className="h-4 w-4" />}
          />
          <StatCard
            label="Total Credits"
            value={formatCurrency(stats.totalCredits)}
            valueColor="green"
            subtext="This month"
            icon={<ArrowUpIcon className="h-4 w-4" />}
          />
          <StatCard
            label="Transactions"
            value={stats.transactionCount}
            subtext="This month"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            label="Max Transaction"
            value={formatCurrency(stats.maxTransaction)}
            valueColor="amber"
            subtext="This month"
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>

        {/* Charts */}
        <DashboardCharts spendingOverTime={spendingOverTime} />

        {/* Spending by Category Table */}
        <SpendingByCategoryTable
          data={categorySpendingTable.data}
          grandTotal={categorySpendingTable.grandTotal}
          totalCount={categorySpendingTable.totalCount}
          overallMaxTransaction={categorySpendingTable.overallMaxTransaction}
          year={currentYear}
          month={currentMonth}
        />
      </div>
    </AppShell>
  );
}
