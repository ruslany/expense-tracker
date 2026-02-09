import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { transactionUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();

    const validated = transactionUpdateSchema.parse(body);

    const transaction = await prisma.transaction.update({
      where: { id },
      data: validated,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
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

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
