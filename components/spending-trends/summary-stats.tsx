import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, Calendar, ArrowDownIcon, PieChart } from 'lucide-react';

interface SummaryStatsProps {
  totalSpent: number;
  averagePerPeriod: number;
  highestPeriod: { label: string; amount: number } | null;
  lowestPeriod: { label: string; amount: number } | null;
  view?: 'default' | 'essential';
  essentialTotal?: number;
  discretionaryTotal?: number;
}

export function SummaryStats({
  totalSpent,
  averagePerPeriod,
  highestPeriod,
  lowestPeriod,
  view = 'default',
  essentialTotal,
  discretionaryTotal,
}: SummaryStatsProps) {
  if (view === 'essential') {
    const essential = essentialTotal ?? 0;
    const discretionary = discretionaryTotal ?? 0;
    const total = essential + discretionary;
    const essentialPct = total > 0 ? Math.round((essential / total) * 100) : 0;
    const discretionaryPct = total > 0 ? 100 - essentialPct : 0;

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          valueColor="amber"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Essential Spent"
          value={formatCurrency(essential)}
          valueColor="green"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Discretionary Spent"
          value={formatCurrency(discretionary)}
          valueColor="blue"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Essential / Discretionary"
          value={total > 0 ? `${essentialPct}% / ${discretionaryPct}%` : '-'}
          icon={<PieChart className="h-4 w-4" />}
        />
      </div>
    );
  }

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
