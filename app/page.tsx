import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard-charts';
import { SpendingByCategoryTable } from '@/components/spending-by-category-table';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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

async function getCategorySpendingTable() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

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
    0
  );
  const totalCount = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.count, 0);
  const overallMaxTransaction = Math.max(
    ...Array.from(categoryMap.values()).map((c) => c.maxExpense),
    0
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

const MONTHLY_BUDGET = 7000;

async function getSpendingOverTime() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  // Include all transactions (expenses and credits/refunds)
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: { date: 'asc' },
  });

  // Group by date and calculate net spending (expenses - credits)
  const spendingByDate = new Map<string, { expenses: number; credits: number }>();

  for (const t of transactions) {
    const dateKey = t.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const current = spendingByDate.get(dateKey) ?? { expenses: 0, credits: 0 };
    if (t.amount < 0) {
      current.expenses += Math.abs(t.amount);
    } else {
      current.credits += t.amount;
    }
    spendingByDate.set(dateKey, current);
  }

  // Calculate running total of net spending
  let runningTotal = 0;
  return Array.from(spendingByDate.entries()).map(([date, { expenses, credits }]) => {
    const netAmount = expenses - credits;
    runningTotal += netAmount;
    return {
      date,
      amount: Math.round(netAmount * 100) / 100,
      runningTotal: Math.round(runningTotal * 100) / 100,
      budget: MONTHLY_BUDGET,
    };
  });
}

export default async function Dashboard() {
  const [stats, categorySpendingTable, spendingOverTime] = await Promise.all([
    getStats(),
    getCategorySpendingTable(),
    getSpendingOverTime(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your expenses and income</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Spent</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats.netSpent)}
              </div>
              <p className="text-xs text-muted-foreground">After refunds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalCredits)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.transactionCount}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Transaction</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.maxTransaction)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
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
