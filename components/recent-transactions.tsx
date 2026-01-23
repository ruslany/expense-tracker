import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: string | null;
  merchant: string | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.merchant || transaction.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
              <div
                className={cn(
                  "text-sm font-medium",
                  transaction.amount < 0
                    ? "text-destructive"
                    : "text-green-600"
                )}
              >
                {transaction.amount < 0 ? "" : "+"}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
