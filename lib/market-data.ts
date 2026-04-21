import type { AssetClass, MarketQuote } from '@/types';
export { SUPPORTED_CURRENCIES } from '@/lib/currencies';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

interface CacheEntry {
  data: MarketQuote[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache: CacheEntry | null = null;

export async function fetchMarketQuotes(symbols: string[]): Promise<MarketQuote[]> {
  if (symbols.length === 0) return [];

  const cacheKey = symbols.sort().join(',');
  if (cache && cache.timestamp > Date.now() - CACHE_TTL_MS) {
    const cachedSymbols = cache.data
      .map((q) => q.symbol)
      .sort()
      .join(',');
    if (cachedSymbols === cacheKey) {
      return cache.data;
    }
  }

  const quotes: MarketQuote[] = [];

  for (const symbol of symbols) {
    try {
      const q = await yf.quote(symbol);
      quotes.push({
        symbol: q.symbol,
        name: q.shortName || q.longName || symbol,
        price: q.regularMarketPrice ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        ytdReturn: q.ytdReturn ?? null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? 0,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? 0,
        lastTradeTime: q.regularMarketTime ?? null,
      });
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      quotes.push({
        symbol,
        name: symbol,
        price: 0,
        changePercent: 0,
        ytdReturn: null,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        lastTradeTime: null,
      });
    }
  }

  cache = { data: quotes, timestamp: Date.now() };
  return quotes;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export async function fetchForexRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<number | null> {
  const symbol = `${fromCurrency}${toCurrency}=X`;
  try {
    const q = await yf.quote(symbol);
    return q.regularMarketPrice ?? null;
  } catch (error) {
    console.error(`Failed to fetch forex rate for ${symbol}:`, error);
    return null;
  }
}

const CATEGORY_TO_ASSET_CLASS: Array<[RegExp, AssetClass]> = [
  [/money market|stable value|cash/i, 'cash'],
  [/real estate|reit/i, 'real_estate'],
  [/commodit|precious metal|agriculture|energy limited/i, 'commodities'],
  [
    /foreign|international|emerging|world stock|global|europe|asia|japan|china|latin/i,
    'intl_equity',
  ],
  [
    /bond|fixed income|income|treasury|government|corporate|municipal|muni|inflation.protected|ultrashort|bank loan/i,
    'fixed_income',
  ],
  [/large|mid.cap|small|blend|growth|value|equity|stock|domestic/i, 'us_equity'],
];

function categoryNameToAssetClass(category: string | null | undefined): AssetClass {
  if (!category) return 'other';
  for (const [pattern, cls] of CATEGORY_TO_ASSET_CLASS) {
    if (pattern.test(category)) return cls;
  }
  return 'other';
}

export async function detectAssetClass(symbol: string): Promise<AssetClass> {
  try {
    const summary = await yf.quoteSummary(symbol, { modules: ['fundProfile', 'quoteType'] });
    const category = (summary.fundProfile as { categoryName?: string } | null)?.categoryName;
    if (category) return categoryNameToAssetClass(category);
    const quoteType = (summary.quoteType as { quoteType?: string } | null)?.quoteType;
    if (quoteType === 'EQUITY') return 'us_equity';
    return 'other';
  } catch {
    return 'other';
  }
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];

  try {
    const result = await yf.search(query);
    return (result.quotes || [])
      .filter((q: { isYahooFinance?: boolean }) => q.isYahooFinance)
      .slice(0, 10)
      .map(
        (q: {
          symbol: string;
          shortname?: string;
          longname?: string;
          typeDisp?: string;
          quoteType?: string;
          exchDisp?: string;
          exchange?: string;
        }) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          type: q.typeDisp || q.quoteType || 'Unknown',
          exchange: q.exchDisp || q.exchange || '',
        }),
      );
  } catch (error) {
    console.error('Failed to search symbols:', error);
    return [];
  }
}
