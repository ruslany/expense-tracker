import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { CurrencyConverter } from '@/components/currency/currency-converter';
import { CurrencyRateTable } from '@/components/currency/currency-rate-table';
import { fetchTrackedCurrencies } from '@/lib/data';
import { fetchMarketQuotes } from '@/lib/market-data';
import type { ForexQuote } from '@/types';

export const metadata: Metadata = { title: 'Currency Exchange' };
export const dynamic = 'force-dynamic';

export default async function CurrencyPage() {
  const tracked = await fetchTrackedCurrencies();
  const symbols = tracked.map((t) => t.symbol);
  const quotes = await fetchMarketQuotes(symbols);

  const entries: ForexQuote[] = tracked.map((t) => {
    const q = quotes.find((q) => q.symbol === t.symbol);
    return {
      id: t.id,
      symbol: t.symbol,
      baseCurrency: t.baseCurrency,
      quoteCurrency: t.quoteCurrency,
      rate: q?.price ?? null,
      changePercent: q?.changePercent ?? null,
      fiftyTwoWeekHigh: q?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: q?.fiftyTwoWeekLow ?? null,
      lastTradeTime: q?.lastTradeTime ?? null,
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Currency Exchange</h1>
          <p className="text-muted-foreground">Convert currencies and track exchange rates</p>
        </div>

        <CurrencyConverter trackedRates={entries} />

        <CurrencyRateTable entries={entries} />
      </div>
    </AppShell>
  );
}
