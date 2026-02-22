import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { csvMappingUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();
    const validated = csvMappingUpdateSchema.parse(body);

    const mapping = await prisma.cSVMapping.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        institution: true,
        skipPatterns: true,
      },
    });

    return NextResponse.json(mapping);
  } catch (error) {
    console.error('Error updating CSV mapping:', error);
    return NextResponse.json({ error: 'Failed to update CSV mapping' }, { status: 500 });
  }
}
