import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { csvMappingSchema } from '@/lib/validations';
import type { Prisma } from '@/lib/generated/prisma/client';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const mappings = await prisma.cSVMapping.findMany({
      orderBy: { institution: 'asc' },
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Error fetching CSV mappings:', error);
    return NextResponse.json({ error: 'Failed to fetch CSV mappings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = csvMappingSchema.parse(body);

    const mapping = await prisma.cSVMapping.upsert({
      where: { institution: validated.institution },
      update: {
        fieldMapping: validated.fieldMapping as Prisma.InputJsonValue,
        dateFormat: validated.dateFormat,
      },
      create: {
        institution: validated.institution,
        fieldMapping: validated.fieldMapping as Prisma.InputJsonValue,
        dateFormat: validated.dateFormat,
      },
    });

    return NextResponse.json(mapping);
  } catch (error) {
    console.error('Error creating/updating CSV mapping:', error);
    return NextResponse.json({ error: 'Failed to create/update CSV mapping' }, { status: 500 });
  }
}
