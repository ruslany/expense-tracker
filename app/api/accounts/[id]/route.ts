import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { accountUpdateSchema } from '@/lib/validations';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = accountUpdateSchema.parse(body);

    const account = await prisma.account.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        name: true,
        institution: true,
        accountType: true,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
