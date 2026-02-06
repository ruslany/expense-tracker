import { AppShell } from '@/components/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard/charts';
import { DashboardPeriodFilter } from '@/components/dashboard/period-filter';
import { SpendingByCategoryTable } from '@/components/spending-by-category-table';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp } from 'lucide-react';
import { getPrisma } from '@/lib/prisma';

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
    },
    include: {
      category: true,
    },
  });

  // Group by category with net totals (expenses - credits), count, and max expense
  const categoryMap = new Map<
    string,
    { expenses: number; credits: number; count: number; maxExpense: number }
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
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Net Spent</p>
                <ArrowDownIcon className="h-4 w-4 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive mt-1">
                {formatCurrency(stats.netSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">After refunds</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(stats.totalCredits)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-1">{stats.transactionCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Max Transaction</p>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(stats.maxTransaction)}</div>
              <p className="text-xs text-muted-foreground mt-0.5">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <DashboardCharts spendingOverTime={spendingOverTime} />

        {/* Spending by Category Table */}
        <SpendingByCategoryTable
          data={categorySpendingTable.data}
          grandTotal={categorySpendingTable.grandTotal}
          totalCount={categorySpendingTable.totalCount}
          overallMaxTransaction={categorySpendingTable.overallMaxTransaction}
        />
      </div>
    </AppShell>
  );
}
