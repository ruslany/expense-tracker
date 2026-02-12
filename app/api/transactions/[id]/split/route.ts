import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { splitTransactionSchema } from '@/lib/validations';
import { computeContentHash } from '@/lib/utils';
import { requireAdmin } from '@/lib/authorization';
import { z } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();

    const validated = splitTransactionSchema.parse(body);

    const parent = await prisma.transaction.findUnique({
      where: { id },
      include: { splits: { select: { id: true } } },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (parent.parentId) {
      return NextResponse.json(
        { error: 'Cannot split a child transaction' },
        { status: 409 },
      );
    }

    if (parent.splits.length > 0) {
      return NextResponse.json(
        { error: 'Transaction is already split. Unsplit first.' },
        { status: 409 },
      );
    }

    const splitsTotal = validated.splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(splitsTotal - parent.amount) >= 0.01) {
      return NextResponse.json(
        {
          error: `Split amounts must equal the parent amount. Expected ${parent.amount}, got ${splitsTotal}.`,
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const children = await Promise.all(
        validated.splits.map((split, index) => {
          const contentHash = computeContentHash({
            ...(parent.originalData as Record<string, unknown>),
            _splitParent: parent.id,
            _splitIndex: index,
          });

          return tx.transaction.create({
            data: {
              accountId: parent.accountId,
              date: parent.date,
              description: split.description,
              amount: split.amount,
              categoryId: split.categoryId ?? null,
              originalData: parent.originalData ?? {},
              contentHash,
              importedAt: parent.importedAt,
              parentId: parent.id,
            },
            include: { category: true },
          });
        }),
      );

      return children;
    });

    return NextResponse.json({
      id: parent.id,
      splits: result.map((s) => ({
        id: s.id,
        description: s.description,
        amount: s.amount,
        category: s.category?.name ?? null,
        categoryId: s.category?.id ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Error splitting transaction:', error);
    return NextResponse.json({ error: 'Failed to split transaction' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;

    const parent = await prisma.transaction.findUnique({
      where: { id },
      include: { splits: { select: { id: true } } },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (parent.splits.length === 0) {
      return NextResponse.json(
        { error: 'Transaction is not split' },
        { status: 409 },
      );
    }

    await prisma.transaction.deleteMany({
      where: { parentId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsplitting transaction:', error);
    return NextResponse.json({ error: 'Failed to unsplit transaction' }, { status: 500 });
  }
}
