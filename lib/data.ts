import { prisma } from './prisma';
import type { TransactionWhereInput } from './generated/prisma/models/Transaction';

const DEFAULT_PAGE_SIZE = 10;

function buildTransactionWhereClause(
  query?: string,
  categoryId?: string,
  accountId?: string,
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
    conditions.push({ categoryId });
  }

  if (accountId) {
    conditions.push({ accountId });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export async function fetchFilteredTransactions(
  query: string,
  currentPage: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  categoryId?: string,
  accountId?: string,
) {
  const offset = (currentPage - 1) * pageSize;
  const where = buildTransactionWhereClause(query, categoryId, accountId);

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
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
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transactions.');
  }
}

export async function fetchCategories() {
  try {
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
) {
  const where = buildTransactionWhereClause(query, categoryId, accountId);

  try {
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
