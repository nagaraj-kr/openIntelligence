import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Check admin via cookie (not Supabase)
async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.role === 'ADMIN';
  } catch { return false; }
}

// GET /api/admin/data
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [total, pending, approved, featured, rejected, contributors, pending_list, all_resources, meetings, users_list] = await prisma.$transaction([
      prisma.resource.count(),
      prisma.resource.count({ where: { status: 'PENDING' } }),
      prisma.resource.count({ where: { status: 'APPROVED' } }),
      prisma.resource.count({ where: { status: 'FEATURED' } }),
      prisma.resource.count({ where: { status: 'REJECTED' } }),
      prisma.user.count({ where: { role: 'CONTRIBUTOR' } }),
      prisma.resource.findMany({
        where:   { status: 'PENDING' },
        include: { category: true, contributor: { select: { username: true, avatar_url: true } }, tags: { include: { tag: true } } },
        orderBy: { created_at: 'asc' },
      }),
      prisma.resource.findMany({
        include: { category: true, contributor: { select: { username: true } } },
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
      prisma.meeting.findMany({ orderBy: { date: 'desc' } }),
      prisma.user.findMany({
        include: {
          resources: { select: { id: true, status: true } }
        },
        orderBy: { created_at: 'desc' }
      })
    ]);

    return NextResponse.json({
      stats: { total, pending, approved, featured, rejected, contributors },
      pending: pending_list,
      resources: all_resources,
      meetings,
      users: users_list,
    });
  } catch (err) {
    console.error('[GET /api/admin/data]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
