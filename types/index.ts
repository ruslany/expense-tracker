export type Institution = 'fidelity' | 'citi' | 'amex' | 'firsttech' | 'manualentry';

export interface CSVFieldMapping {
  date: string;
  description: string;
  amount?: string;
  debit?: string;
  credit?: string;
  balance?: string;
  status?: string;
  cardMember?: string;
  accountNumber?: string;
  transactionType?: string;
  memo?: string;
  category?: string;
}

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  originalData: Record<string, unknown>;
  category?: string;
  tags?: string[];
}

export interface DashboardStats {
  totalSpent: number;
  totalIncome: number;
  netCashFlow: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    date: Date;
    description: string;
    amount: number;
    category: string | null;
  }>;
  spendingByDay: Array<{
    date: string;
    amount: number;
  }>;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type FundType = 'etf' | 'mutual_fund' | 'stock';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  ytdReturn: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  lastTradeTime: Date | null;
}

export interface WatchlistEntry {
  id: string;
  symbol: string;
  name: string;
  fundType: FundType;
  price: number | null;
  changePercent: number | null;
  ytdReturn: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  lastTradeTime: Date | null;
}
