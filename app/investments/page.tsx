import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { TradingViewChart } from '@/components/investments/tradingview-chart';
import { WatchlistTable } from '@/components/investments/watchlist-table';
import { fetchWatchlistItems } from '@/lib/data';
import { fetchMarketQuotes } from '@/lib/market-data';
import type { WatchlistEntry } from '@/types';

export const metadata: Metadata = { title: 'Investments' };
export const dynamic = 'force-dynamic';

export default async function InvestmentsPage() {
  const items = await fetchWatchlistItems();
  const symbols = items.map((item) => item.symbol);
  const quotes = await fetchMarketQuotes(symbols);

  const entries: WatchlistEntry[] = items.map((item) => {
    const quote = quotes.find((q) => q.symbol === item.symbol);
    return {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      fundType: item.fundType,
      price: quote?.price ?? null,
      changePercent: quote?.changePercent ?? null,
      ytdReturn: quote?.ytdReturn ?? null,
      fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quote?.fiftyTwoWeekLow ?? null,
      lastTradeTime: quote?.lastTradeTime ?? null,
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">Track your ETFs, mutual funds, and stocks</p>
        </div>

        <WatchlistTable entries={entries} />

        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-3">Market Chart</h2>
          <div className="rounded-lg border overflow-hidden">
            <TradingViewChart />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
