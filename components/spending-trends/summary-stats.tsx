import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, Calendar, ArrowDownIcon } from 'lucide-react';

interface SummaryStatsProps {
  totalSpent: number;
  averagePerPeriod: number;
  highestPeriod: { label: string; amount: number } | null;
  lowestPeriod: { label: string; amount: number } | null;
}

export function SummaryStats({
  totalSpent,
  averagePerPeriod,
  highestPeriod,
  lowestPeriod,
}: SummaryStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Spent"
        value={formatCurrency(totalSpent)}
        valueColor="amber"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        label="Average per Period"
        value={formatCurrency(averagePerPeriod)}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        label="Highest Period"
        value={highestPeriod ? formatCurrency(highestPeriod.amount) : '-'}
        valueColor="blue"
        subtext={highestPeriod?.label}
        icon={<Calendar className="h-4 w-4" />}
      />
      <StatCard
        label="Lowest Period"
        value={lowestPeriod ? formatCurrency(lowestPeriod.amount) : '-'}
        valueColor="green"
        subtext={lowestPeriod?.label}
        icon={<ArrowDownIcon className="h-4 w-4" />}
      />
    </div>
  );
}
