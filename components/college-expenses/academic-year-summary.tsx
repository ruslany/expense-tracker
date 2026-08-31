import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface AcademicYearSummaryProps {
  limitAmount: number;
  totalExpense: number;
  totalReimbursement: number;
}

export function AcademicYearSummary({
  limitAmount,
  totalExpense,
  totalReimbursement,
}: AcademicYearSummaryProps) {
  const remaining = limitAmount - totalExpense;
  const overspend = totalExpense > limitAmount;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="COA housing & food limit" value={formatCurrency(limitAmount)} />
      <StatCard
        label="Spent"
        value={formatCurrency(totalExpense)}
        valueColor={overspend ? 'red' : 'default'}
        subtext={overspend ? undefined : `${formatCurrency(totalReimbursement)} reimbursed`}
        icon={
          overspend ? (
            <Badge variant="destructive">Over budget</Badge>
          ) : undefined
        }
      />
      <StatCard
        label="Remaining"
        value={formatCurrency(Math.abs(remaining))}
        valueColor={overspend ? 'red' : 'green'}
        subtext={overspend ? 'over the limit' : undefined}
      />
    </div>
  );
}
