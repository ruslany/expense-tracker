import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tagSchema } from '@/lib/validations';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isBigExpense: true,
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = tagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
      },
      select: {
        id: true,
        name: true,
        isBigExpense: true,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
