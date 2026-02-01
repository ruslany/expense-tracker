import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        keywords: true,
        _count: {
          select: { transactions: true },
        },
      },
    });

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        keywords: c.keywords,
        transactionCount: c._count.transactions,
      })),
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    // Check for duplicate keywords across all categories
    if (validated.keywords && validated.keywords.length > 0) {
      const existingCategories = await prisma.category.findMany({
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

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        keywords: validated.keywords ?? [],
      },
      select: {
        id: true,
        name: true,
        keywords: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
