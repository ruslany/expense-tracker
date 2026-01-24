import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { SpendingByCategoryTable } from "@/components/spending-by-category-table";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const totalSpent = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCredits = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionCount = transactions.length;

  const maxTransaction = transactions.length > 0
    ? Math.max(...transactions.map((t) => Math.abs(t.amount)))
    : 0;

  return {
    totalSpent,
    totalCredits,
    transactionCount,
    maxTransaction,
  };
}

async function getCategorySpendingTable() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      amount: { lt: 0 },
    },
    include: {
      category: true,
    },
  });

  // Group by category with totals, count, and max
  const categoryMap = new Map<string, { total: number; count: number; max: number }>();

  for (const t of transactions) {
    const categoryName = t.category?.name ?? "Uncategorized";
    const amount = Math.abs(t.amount);
    const existing = categoryMap.get(categoryName);

    if (existing) {
      existing.total += amount;
      existing.count += 1;
      existing.max = Math.max(existing.max, amount);
    } else {
      categoryMap.set(categoryName, { total: amount, count: 1, max: amount });
    }
  }

  const grandTotal = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.total, 0);
  const totalCount = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.count, 0);
  const overallMaxTransaction = Math.max(...Array.from(categoryMap.values()).map((c) => c.max), 0);

  const data = Array.from(categoryMap.entries())
    .map(([name, stats]) => ({
      name,
      totalExpenses: Math.round(stats.total * 100) / 100,
      percent: grandTotal > 0 ? (stats.total / grandTotal) * 100 : 0,
      count: stats.count,
      maxTransaction: Math.round(stats.max * 100) / 100,
    }))
    .sort((a, b) => b.totalExpenses - a.totalExpenses);

  return {
    data,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalCount,
    overallMaxTransaction: Math.round(overallMaxTransaction * 100) / 100,
  };
}

const MONTHLY_BUDGET = 1000;

async function getSpendingOverTime() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      amount: { lt: 0 },
    },
    orderBy: { date: "asc" },
  });

  // Group by date and sum amounts
  const spendingByDate = new Map<string, number>();

  for (const t of transactions) {
    const dateKey = t.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const current = spendingByDate.get(dateKey) ?? 0;
    spendingByDate.set(dateKey, current + Math.abs(t.amount));
  }

  // Calculate running total
  let runningTotal = 0;
  return Array.from(spendingByDate.entries()).map(([date, amount]) => {
    runningTotal += amount;
    return {
      date,
      amount: Math.round(amount * 100) / 100,
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
          <p className="text-muted-foreground">
            Overview of your expenses and income
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
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
              <div className="text-2xl font-bold">
                {formatCurrency(stats.maxTransaction)}
              </div>
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
