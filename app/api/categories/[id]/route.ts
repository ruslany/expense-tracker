import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { categoryUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();
    const validated = categoryUpdateSchema.parse(body);

    // Check for duplicate keywords across other categories
    if (validated.keywords && validated.keywords.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { not: id } },
        select: { name: true, keywords: true },
      });

      const allKeywords = existingCategories.flatMap((c) => c.keywords.map((k) => k.toLowerCase()));
      const duplicateKeywords = validated.keywords.filter((k) =>
        allKeywords.includes(k.toLowerCase()),
      );

      if (duplicateKeywords.length > 0) {
        return NextResponse.json(
          {
            error: `Keywords already exist in other categories: ${duplicateKeywords.join(', ')}`,
          },
          { status: 400 },
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        name: true,
        keywords: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
