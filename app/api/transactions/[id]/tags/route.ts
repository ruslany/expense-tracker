import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { transactionTagsUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();
    const validated = transactionTagsUpdateSchema.parse(body);

    // Delete all existing tags for this transaction
    await prisma.transactionTag.deleteMany({
      where: { transactionId: id },
    });

    // Create new tag associations
    if (validated.tagIds.length > 0) {
      await prisma.transactionTag.createMany({
        data: validated.tagIds.map((tagId) => ({
          transactionId: id,
          tagId,
        })),
      });
    }

    // Update reviewedAt and fetch tags in one round-trip
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { reviewedAt: new Date() },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const tags = transaction.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name }));
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error updating transaction tags:', error);
    return NextResponse.json({ error: 'Failed to update transaction tags' }, { status: 500 });
  }
}
