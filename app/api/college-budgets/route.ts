import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { collegeBudgetSchema } from '@/lib/validations';
import { requireAuth, requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const budgets = await prisma.collegeBudget.findMany({
      orderBy: { academicYearStart: 'desc' },
      include: {
        tag: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching college budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch college budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = collegeBudgetSchema.parse(body);

    const budget = await prisma.collegeBudget.create({
      data: validated,
      include: {
        tag: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating college budget:', error);
    return NextResponse.json({ error: 'Failed to create college budget' }, { status: 500 });
  }
}
