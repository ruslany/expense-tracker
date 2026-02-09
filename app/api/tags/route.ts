import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { tagSchema } from '@/lib/validations';
import { requireAuth, requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

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

    return NextResponse.json(
      tags.map((t) => ({
        id: t.id,
        name: t.name,
        isBigExpense: t.isBigExpense,
        transactionCount: t._count.transactions,
      })),
    );
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = tagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
      },
      select: {
        id: true,
        name: true,
        isBigExpense: true,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
