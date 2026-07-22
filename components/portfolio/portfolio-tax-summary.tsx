import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import type { TaxCategory } from '@/types';

interface PortfolioTaxSummaryProps {
  totalValue: number;
  categoryTotals: Record<TaxCategory, number>;
}

export function PortfolioTaxSummary({ totalValue, categoryTotals }: PortfolioTaxSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total" value={formatCurrency(totalValue)} valueColor="default" />
      <StatCard label="Taxable" value={formatCurrency(categoryTotals.taxable)} valueColor="amber" />
      <StatCard
        label="Tax Deferred"
        value={formatCurrency(categoryTotals.tax_deferred)}
        valueColor="blue"
      />
      <StatCard
        label="Tax Free"
        value={formatCurrency(categoryTotals.tax_free)}
        valueColor="green"
      />
    </div>
  );
}
