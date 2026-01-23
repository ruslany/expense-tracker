import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { RecentTransactions } from "@/components/recent-transactions";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp } from "lucide-react";

// Mock data for demonstration
const mockStats = {
  totalSpent: 3245.67,
  totalIncome: 5420.00,
  netCashFlow: 2174.33,
  transactionCount: 47,
};

const mockRecentTransactions = [
  { id: "1", date: new Date("2024-01-20"), description: "Whole Foods Market", amount: -87.43, category: "Groceries" },
  { id: "2", date: new Date("2024-01-19"), description: "Shell Gas Station", amount: -45.20, category: "Transportation" },
  { id: "3", date: new Date("2024-01-18"), description: "Netflix Subscription", amount: -15.99, category: "Entertainment" },
  { id: "4", date: new Date("2024-01-17"), description: "Salary Deposit", amount: 5420.00, category: "Income" },
  { id: "5", date: new Date("2024-01-16"), description: "Amazon Purchase", amount: -124.56, category: "Shopping" },
];

export default function Dashboard() {
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
                {formatCurrency(mockStats.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(mockStats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(mockStats.netCashFlow)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.transactionCount}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <DashboardCharts />

        {/* Recent Transactions */}
        <RecentTransactions transactions={mockRecentTransactions} />
      </div>
    </AppShell>
  );
}
