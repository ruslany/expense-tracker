import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/authorization';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_COOKIE, VALID_PAGE_SIZES } from '@/lib/constants';

export async function GET() {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  const cookieStore = await cookies();
  const pageSize = Number(cookieStore.get(PAGE_SIZE_COOKIE)?.value) || DEFAULT_PAGE_SIZE;

  return NextResponse.json({ pageSize });
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if ('response' in authResult) return authResult.response;

  const body = await request.json();
  const pageSize = Number(body.pageSize);

  if (!VALID_PAGE_SIZES.includes(pageSize)) {
    return NextResponse.json({ error: 'Invalid page size' }, { status: 400 });
  }

  const response = NextResponse.json({ pageSize });
  response.cookies.set(PAGE_SIZE_COOKIE, String(pageSize), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}
