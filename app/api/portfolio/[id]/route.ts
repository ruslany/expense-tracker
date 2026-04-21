import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { portfolioItemUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const { id } = await params;
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = portfolioItemUpdateSchema.parse(body);

    const item = await prisma.portfolioItem.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const { id } = await params;
    const prisma = await getPrisma();
    await prisma.portfolioItem.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
