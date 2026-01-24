import { AppShell } from "@/components/app-shell";
import { TransactionsTable } from "@/components/transactions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

async function getTransactions() {
  const transactions = await prisma.transaction.findMany({
    include: {
      account: true,
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((t) => ({
    id: t.id,
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category?.name ?? null,
    account: {
      id: t.account.id,
      name: t.account.name,
    },
  }));
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable data={transactions} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
