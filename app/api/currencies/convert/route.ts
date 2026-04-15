import { NextRequest, NextResponse } from 'next/server';
import { fetchForexRate } from '@/lib/market-data';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';
import { requireAuth } from '@/lib/authorization';

const VALID_CURRENCIES = new Set<string>(SUPPORTED_CURRENCIES);

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from')?.toUpperCase();
  const to = searchParams.get('to')?.toUpperCase();
  const amountStr = searchParams.get('amount');

  if (!from || !to || !amountStr) {
    return NextResponse.json({ error: 'Missing required params: from, to, amount' }, { status: 400 });
  }

  if (!VALID_CURRENCIES.has(from) || !VALID_CURRENCIES.has(to)) {
    return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 });
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: 'Amount must be a non-negative number' }, { status: 400 });
  }

  if (from === to) {
    return NextResponse.json({ rate: 1, result: amount, from, to, amount });
  }

  const rate = await fetchForexRate(from, to);
  if (rate === null) {
    return NextResponse.json({ error: 'Failed to fetch exchange rate' }, { status: 422 });
  }

  return NextResponse.json({ rate, result: amount * rate, from, to, amount });
}
