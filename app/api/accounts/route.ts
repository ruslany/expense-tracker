import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { accountSchema } from '@/lib/validations';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const accounts = await prisma.account.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        institution: true,
        accountType: true,
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const validated = accountSchema.parse(body);

    const account = await prisma.account.create({
      data: {
        name: validated.name,
        institution: validated.institution,
        accountType: validated.accountType,
      },
      select: {
        id: true,
        name: true,
        institution: true,
        accountType: true,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
