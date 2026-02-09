import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

export function isAdmin(session: Session): boolean {
  return session.user?.role === 'admin';
}

export async function requireAuth(): Promise<
  { session: Session } | { response: NextResponse }
> {
  const session = await auth();
  if (!session?.user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdmin(): Promise<
  { session: Session } | { response: NextResponse }
> {
  const result = await requireAuth();
  if ('response' in result) {
    return result;
  }
  if (!isAdmin(result.session)) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return result;
}
