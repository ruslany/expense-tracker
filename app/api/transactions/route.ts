import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getPrisma } from '@/lib/prisma';
import { transactionFilterSchema, manualTransactionCreateSchema } from '@/lib/validations';
import { computeContentHash } from '@/lib/utils';
import type { Prisma } from '@/lib/generated/prisma/client';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
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

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = manualTransactionCreateSchema.parse(body);

    const account = await prisma.account.findUnique({
      where: { id: validated.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const originalData = { source: 'manual', _id: randomUUID() };
    const contentHash = computeContentHash(originalData);

    const transaction = await prisma.transaction.create({
      data: {
        accountId: validated.accountId,
        date: validated.date,
        description: validated.description,
        amount: validated.amount,
        categoryId: validated.categoryId ?? null,
        originalData,
        contentHash,
        importedAt: new Date(),
        ...(validated.tagIds && validated.tagIds.length > 0
          ? {
              tags: {
                create: validated.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        account: { select: { id: true, name: true, institution: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
