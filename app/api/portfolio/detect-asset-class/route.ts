import { NextRequest, NextResponse } from 'next/server';
import { detectAssetClass } from '@/lib/market-data';
import { requireAdmin } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  const symbol = request.nextUrl.searchParams.get('symbol');
  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  const assetClass = await detectAssetClass(symbol.toUpperCase());
  return NextResponse.json({ assetClass });
}
