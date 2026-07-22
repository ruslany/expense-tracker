import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';
import { PortfolioTable } from '@/components/portfolio/portfolio-table';
import { AssetAllocationChart } from '@/components/portfolio/asset-allocation-chart';
import { PortfolioTaxSummary } from '@/components/portfolio/portfolio-tax-summary';
import { fetchPortfolioItems, fetchPortfolioAccounts } from '@/lib/data';
import { fetchMarketQuotes } from '@/lib/market-data';
import type { PortfolioEntry, TaxCategory } from '@/types';

export const metadata: Metadata = { title: 'Portfolio' };
export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const items = await fetchPortfolioItems();
  const portfolioAccounts = await fetchPortfolioAccounts();
  const accountTaxCategories = Object.fromEntries(
    portfolioAccounts.map((account) => [account.name, account.taxCategory]),
  ) as Record<string, TaxCategory>;
  const uniqueSymbols = [
    ...new Set(items.filter((item) => !item.isManual).map((item) => item.symbol)),
  ];
  const quotes = await fetchMarketQuotes(uniqueSymbols);

  const entriesWithValue = items.map((item) => {
    if (item.isManual) {
      const price = item.manualPrice;
      const currentValue = price !== null ? price * item.quantity : null;
      return {
        id: item.id,
        symbol: item.symbol,
        accountName: item.accountName,
        name: item.name,
        fundType: item.fundType,
        assetClass: item.assetClass,
        quantity: item.quantity,
        price,
        changePercent: null,
        currentValue,
        isManual: item.isManual,
        manualPrice: item.manualPrice,
      };
    }

    const quote = quotes.find((q) => q.symbol === item.symbol);
    const price = quote?.price ?? null;
    const currentValue = price !== null ? price * item.quantity : null;
    return {
      id: item.id,
      symbol: item.symbol,
      accountName: item.accountName,
      name: item.name,
      fundType: item.fundType,
      assetClass: item.assetClass,
      quantity: item.quantity,
      price,
      changePercent: quote?.changePercent ?? null,
      currentValue,
      isManual: item.isManual,
      manualPrice: item.manualPrice,
    };
  });

  const totalValue = entriesWithValue.reduce(
    (sum, e) => (e.currentValue !== null ? sum + e.currentValue : sum),
    0,
  );

  const entries: PortfolioEntry[] = entriesWithValue.map((e) => ({
    ...e,
    percentOfTotal:
      e.currentValue !== null && totalValue > 0 ? (e.currentValue / totalValue) * 100 : null,
  }));

  const categoryTotals: Record<TaxCategory, number> = {
    taxable: 0,
    tax_deferred: 0,
    tax_free: 0,
  };
  for (const entry of entries) {
    if (entry.currentValue === null) continue;
    const category = accountTaxCategories[entry.accountName] ?? 'taxable';
    categoryTotals[category] += entry.currentValue;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Track your investment positions and portfolio value
          </p>
        </div>
        <PortfolioTaxSummary totalValue={totalValue} categoryTotals={categoryTotals} />
        <AssetAllocationChart entries={entries} />
        <PortfolioTable entries={entries} accountTaxCategories={accountTaxCategories} />
      </div>
    </AppShell>
  );
}
