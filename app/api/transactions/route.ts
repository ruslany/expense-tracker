import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transactionFilterSchema } from '@/lib/validations';
import type { Prisma } from '@/lib/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validated = transactionFilterSchema.parse(params);

    const {
      startDate,
      endDate,
      accountId,
      categoryId,
      minAmount,
      maxAmount,
      search,
      page,
      pageSize,
    } = validated;

    const where: Prisma.TransactionWhereInput = {};

    if (startDate || endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (startDate) {
        dateFilter.gte = startDate;
      }
      if (endDate) {
        dateFilter.lte = endDate;
      }
      where.date = dateFilter;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              institution: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
