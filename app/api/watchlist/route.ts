import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { watchlistItemSchema } from '@/lib/validations';
import { requireAuth, requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const items = await prisma.watchlistItem.findMany({
      orderBy: { symbol: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = watchlistItemSchema.parse(body);

    const existing = await prisma.watchlistItem.findUnique({
      where: { symbol: validated.symbol },
    });

    if (existing) {
      return NextResponse.json({ error: 'Symbol already in watchlist' }, { status: 409 });
    }

    const item = await prisma.watchlistItem.create({
      data: {
        symbol: validated.symbol,
        name: validated.name,
        fundType: validated.fundType,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}
