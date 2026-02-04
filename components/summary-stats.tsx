import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Hash, ArrowUpRight } from 'lucide-react';

interface SummaryStatsProps {
  totalExpenses: number;
  transactionCount: number;
  maxTransaction: number;
}

export function SummaryStats({
  totalExpenses,
  transactionCount,
  maxTransaction,
}: SummaryStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total Expenses"
        value={formatCurrency(totalExpenses)}
        valueColor="red"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        label="Transaction Count"
        value={transactionCount.toLocaleString()}
        icon={<Hash className="h-4 w-4" />}
      />
      <StatCard
        label="Max Transaction"
        value={formatCurrency(maxTransaction)}
        icon={<ArrowUpRight className="h-4 w-4" />}
      />
    </div>
  );
}
