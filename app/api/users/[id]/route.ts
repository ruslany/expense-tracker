import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { userRoleUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/authorization';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;
    const body = await request.json();
    const validated = userRoleUpdateSchema.parse(body);

    const user = await prisma.userRole.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent demoting the ADMIN_EMAIL user
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (adminEmail && user.email === adminEmail && validated.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change the role of the primary admin' },
        { status: 400 },
      );
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && validated.role !== 'admin') {
      const adminCount = await prisma.userRole.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last admin' }, { status: 400 });
      }
    }

    const updated = await prisma.userRole.update({
      where: { id },
      data: { role: validated.role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if ('response' in authResult) return authResult.response;

  try {
    const prisma = await getPrisma();
    const { id } = await params;

    const user = await prisma.userRole.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the ADMIN_EMAIL user
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (adminEmail && user.email === adminEmail) {
      return NextResponse.json({ error: 'Cannot delete the primary admin' }, { status: 400 });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await prisma.userRole.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 });
      }
    }

    await prisma.userRole.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
