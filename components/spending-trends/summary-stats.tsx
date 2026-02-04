import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface SummaryStatsProps {
  totalSpent: number;
  averagePerPeriod: number;
  highestPeriod: { label: string; amount: number } | null;
  periodsAnalyzed: number;
}

export function SummaryStats({
  totalSpent,
  averagePerPeriod,
  highestPeriod,
  periodsAnalyzed,
}: SummaryStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Spent"
        value={formatCurrency(totalSpent)}
        valueColor="red"
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
        valueColor="amber"
        subtext={highestPeriod?.label}
        icon={<Calendar className="h-4 w-4" />}
      />
      <StatCard
        label="Periods Analyzed"
        value={periodsAnalyzed}
        icon={<BarChart3 className="h-4 w-4" />}
      />
    </div>
  );
}
