import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { z } from 'zod';

const tagUpdateSchema = z.object({
  isBigExpense: z.boolean().optional(),
  name: z.string().min(1).max(50).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();
    const validated = tagUpdateSchema.parse(body);

    const tag = await prisma.tag.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        name: true,
        isBigExpense: true,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const prisma = await getPrisma();
    const { id } = await params;

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
