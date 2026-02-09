import { getPrisma } from './prisma';
import type { TransactionWhereInput } from './generated/prisma/models/Transaction';
import type { FundType } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

function buildTransactionWhereClause(
  query?: string,
  categoryId?: string,
  accountId?: string,
  tagId?: string,
  startDate?: string,
  endDate?: string,
): TransactionWhereInput {
  const conditions: TransactionWhereInput[] = [];

  if (query) {
    conditions.push({
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { account: { name: { contains: query, mode: 'insensitive' } } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    });
  }

  if (categoryId) {
    if (categoryId === 'uncategorized') {
      conditions.push({ categoryId: null });
    } else {
      conditions.push({ categoryId });
    }
  }

  if (accountId) {
    conditions.push({ accountId });
  }

  if (tagId) {
    conditions.push({
      tags: {
        some: {
          tagId,
        },
      },
    });
  }

  const dateFilter: Record<string, Date> = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    const nextDay = new Date(endDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    dateFilter.lt = nextDay;
  }
  if (Object.keys(dateFilter).length > 0) {
    conditions.push({ date: dateFilter });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export async function fetchFilteredTransactions(
  query: string,
  currentPage: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  categoryId?: string,
  accountId?: string,
  tagId?: string,
  startDate?: string,
  endDate?: string,
) {
  const offset = (currentPage - 1) * pageSize;
  const where = buildTransactionWhereClause(
    query,
    categoryId,
    accountId,
    tagId,
    startDate,
    endDate,
  );

  try {
    const prisma = await getPrisma();
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: pageSize,
      skip: offset,
    });

    return transactions.map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category?.name ?? null,
      categoryId: t.category?.id ?? null,
      account: {
        id: t.account.id,
        name: t.account.name,
      },
      tags: t.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
      })),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transactions.');
  }
}

export async function fetchCategories() {
  try {
    const prisma = await getPrisma();
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    return categories;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchTransactionsPages(
  query: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
  categoryId?: string,
  accountId?: string,
  tagId?: string,
  startDate?: string,
  endDate?: string,
) {
  const where = buildTransactionWhereClause(
    query,
    categoryId,
    accountId,
    tagId,
    startDate,
    endDate,
  );

  try {
    const prisma = await getPrisma();
    const count = await prisma.transaction.count({ where });

    const totalPages = Math.ceil(count / pageSize);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of transactions.');
  }
}

export async function fetchAccounts() {
  try {
    const prisma = await getPrisma();
    const accounts = await prisma.account.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    return accounts;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch accounts.');
  }
}

export async function fetchTags() {
  try {
    const prisma = await getPrisma();
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    return tags;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tags.');
  }
}

export async function fetchCategoriesWithKeywords() {
  try {
    const prisma = await getPrisma();
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        keywords: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      keywords: c.keywords,
      transactionCount: c._count.transactions,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function fetchTagsWithTransactionCount() {
  try {
    const prisma = await getPrisma();
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isBigExpense: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      isBigExpense: t.isBigExpense,
      transactionCount: t._count.transactions,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tags.');
  }
}

export async function fetchAccountsWithTransactionCount() {
  try {
    const prisma = await getPrisma();
    const accounts = await prisma.account.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        institution: true,
        accountType: true,
        _count: {
          select: { transactions: true },
        },
      },
    });
    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      institution: a.institution,
      accountType: a.accountType,
      transactionCount: a._count.transactions,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch accounts.');
  }
}

export async function fetchWatchlistItems() {
  try {
    const prisma = await getPrisma();
    const items = await prisma.watchlistItem.findMany({
      orderBy: { symbol: 'asc' },
    });
    return items.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      fundType: item.fundType as FundType,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch watchlist items.');
  }
}

export async function fetchUsers() {
  try {
    const prisma = await getPrisma();
    const users = await prisma.userRole.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}
