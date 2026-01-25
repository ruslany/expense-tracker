import { prisma } from './prisma';

const DEFAULT_PAGE_SIZE = 10;

export async function fetchFilteredTransactions(
  query: string,
  currentPage: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const offset = (currentPage - 1) * pageSize;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { account: { name: { contains: query, mode: 'insensitive' } } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
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

export async function fetchTransactionsPages(query: string, pageSize: number = DEFAULT_PAGE_SIZE) {
  try {
    const count = await prisma.transaction.count({
      where: {
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { account: { name: { contains: query, mode: 'insensitive' } } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
    });

    const totalPages = Math.ceil(count / pageSize);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of transactions.');
  }
}
