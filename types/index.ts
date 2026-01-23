export type Institution = "fidelity" | "citi" | "amex";

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
}

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  originalData: Record<string, unknown>;
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
  category?: string;
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
