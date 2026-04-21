import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { portfolioItemSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const items = await prisma.portfolioItem.findMany({
      orderBy: { symbol: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = portfolioItemSchema.parse(body);

    const existing = await prisma.portfolioItem.findUnique({
      where: { symbol_accountName: { symbol: validated.symbol, accountName: validated.accountName } },
    });

    if (existing) {
      return NextResponse.json(
        { error: `${validated.symbol} already exists in ${validated.accountName}` },
        { status: 409 },
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        symbol: validated.symbol,
        accountName: validated.accountName,
        name: validated.name,
        fundType: validated.fundType,
        quantity: validated.quantity,
        assetClass: validated.assetClass,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    return NextResponse.json({ error: 'Failed to add to portfolio' }, { status: 500 });
  }
}
