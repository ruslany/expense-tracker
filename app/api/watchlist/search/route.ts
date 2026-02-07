import { NextRequest, NextResponse } from 'next/server';
import { searchSymbols } from '@/lib/market-data';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchSymbols(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching symbols:', error);
    return NextResponse.json({ error: 'Failed to search symbols' }, { status: 500 });
  }
}
