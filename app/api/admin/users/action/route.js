import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Check admin via cookie
async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.role === 'ADMIN';
  } catch { return false; }
}

export async function PATCH(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { userId, action } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (action === 'ban') {
      await prisma.user.update({
        where: { id: userId },
        data: { bio: '__BANNED__' } // We use bio field as a temporary workaround to avoid Prisma schema migrations
      });
    } else if (action === 'unban') {
      await prisma.user.update({
        where: { id: userId },
        data: { bio: null }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/admin/users/action]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
