import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { trackedCurrencySchema } from '@/lib/validations';
import { requireAuth, requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const items = await prisma.trackedCurrency.findMany({
      orderBy: { symbol: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching tracked currencies:', error);
    return NextResponse.json({ error: 'Failed to fetch tracked currencies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = trackedCurrencySchema.parse(body);

    if (validated.baseCurrency === validated.quoteCurrency) {
      return NextResponse.json(
        { error: 'Base and quote currencies must be different' },
        { status: 400 },
      );
    }

    const existing = await prisma.trackedCurrency.findUnique({
      where: { symbol: validated.symbol },
    });

    if (existing) {
      return NextResponse.json({ error: 'Currency pair already tracked' }, { status: 409 });
    }

    const item = await prisma.trackedCurrency.create({
      data: {
        symbol: validated.symbol,
        baseCurrency: validated.baseCurrency,
        quoteCurrency: validated.quoteCurrency,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding tracked currency:', error);
    return NextResponse.json({ error: 'Failed to add currency pair' }, { status: 500 });
  }
}
