import { prisma } from './prisma';
import type { TransactionWhereInput } from './generated/prisma/models/Transaction';

const DEFAULT_PAGE_SIZE = 10;

function buildTransactionWhereClause(
  query?: string,
  categoryId?: string,
  accountId?: string,
  tagId?: string,
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

  if (tagId) {
    conditions.push({
      tags: {
        some: {
          tagId,
        },
      },
    });
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
) {
  const offset = (currentPage - 1) * pageSize;
  const where = buildTransactionWhereClause(query, categoryId, accountId, tagId);

  try {
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
) {
  const where = buildTransactionWhereClause(query, categoryId, accountId, tagId);

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

export async function fetchTags() {
  try {
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
