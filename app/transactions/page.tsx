"use client";

import { AppShell } from "@/components/app-shell";
import { TransactionsTable } from "@/components/transactions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    date: new Date("2024-01-20"),
    description: "Whole Foods Market #123",
    amount: -87.43,
    category: "Groceries",
    account: { id: "acc1", name: "Fidelity Visa" },
  },
  {
    id: "2",
    date: new Date("2024-01-19"),
    description: "Shell Gas Station",
    amount: -45.20,
    category: "Transportation",
    account: { id: "acc1", name: "Fidelity Visa" },
  },
  {
    id: "3",
    date: new Date("2024-01-18"),
    description: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    account: { id: "acc2", name: "Citi Card" },
  },
  {
    id: "4",
    date: new Date("2024-01-17"),
    description: "Salary Deposit",
    amount: 5420.00,
    category: "Income",
    account: { id: "acc1", name: "Fidelity Visa" },
  },
  {
    id: "5",
    date: new Date("2024-01-16"),
    description: "Amazon Purchase - Electronics",
    amount: -124.56,
    category: "Shopping",
    account: { id: "acc3", name: "Amex Gold" },
  },
  {
    id: "6",
    date: new Date("2024-01-15"),
    description: "Starbucks Coffee",
    amount: -6.75,
    category: "Dining",
    account: { id: "acc1", name: "Fidelity Visa" },
  },
  {
    id: "7",
    date: new Date("2024-01-14"),
    description: "Uber Ride",
    amount: -23.40,
    category: "Transportation",
    account: { id: "acc2", name: "Citi Card" },
  },
  {
    id: "8",
    date: new Date("2024-01-13"),
    description: "Target Stores",
    amount: -67.89,
    category: "Shopping",
    account: { id: "acc1", name: "Fidelity Visa" },
  },
  {
    id: "9",
    date: new Date("2024-01-12"),
    description: "Electric Bill Payment",
    amount: -142.30,
    category: "Utilities",
    account: { id: "acc1", name: "Fidelity Visa" },
  },
  {
    id: "10",
    date: new Date("2024-01-11"),
    description: "Chipotle Mexican Grill",
    amount: -14.25,
    category: "Dining",
    account: { id: "acc3", name: "Amex Gold" },
  },
];

export default function TransactionsPage() {
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
            <TransactionsTable data={mockTransactions} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
