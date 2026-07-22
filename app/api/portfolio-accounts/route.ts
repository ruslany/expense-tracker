import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { portfolioAccountSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function GET() {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const accounts = await prisma.portfolioAccount.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching portfolio accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = portfolioAccountSchema.parse(body);

    const account = await prisma.portfolioAccount.upsert({
      where: { name: validated.name },
      update: { taxCategory: validated.taxCategory },
      create: { name: validated.name, taxCategory: validated.taxCategory },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating portfolio account:', error);
    return NextResponse.json({ error: 'Failed to update portfolio account' }, { status: 500 });
  }
}
