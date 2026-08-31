import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAdmin } from '@/lib/authorization';

const collegeBudgetUpdateSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  academicYearStart: z.coerce.date().optional(),
  academicYearEnd: z.coerce.date().optional(),
  tagId: z.string().min(1).optional(),
  limitAmount: z.number().positive().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();
    const validated = collegeBudgetUpdateSchema.parse(body);

    const budget = await prisma.collegeBudget.update({
      where: { id },
      data: validated,
      include: {
        tag: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating college budget:', error);
    return NextResponse.json({ error: 'Failed to update college budget' }, { status: 500 });
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

    await prisma.collegeBudget.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting college budget:', error);
    return NextResponse.json({ error: 'Failed to delete college budget' }, { status: 500 });
  }
}
