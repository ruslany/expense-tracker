import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transactionTagsUpdateSchema } from '@/lib/validations';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    // Fetch the updated transaction with tags
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const tags =
      transaction?.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
      })) ?? [];

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error updating transaction tags:', error);
    return NextResponse.json({ error: 'Failed to update transaction tags' }, { status: 500 });
  }
}
