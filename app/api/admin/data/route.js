import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
    const [
      totalRes, pendingRes, approvedRes, featuredRes, rejectedRes, contributorsRes,
      pendingListRes, allResourcesRes, meetingsRes, usersRes
    ] = await Promise.all([
      supabaseAdmin.from('resources').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabaseAdmin.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabaseAdmin.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'FEATURED'),
      supabaseAdmin.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CONTRIBUTOR'),
      
      supabaseAdmin.from('resources').select('*, category:categories(*), contributor:users(username, avatar_url), resource_tags(tag:tags(*))').eq('status', 'PENDING').order('created_at', { ascending: true }),
      supabaseAdmin.from('resources').select('*, category:categories(*), contributor:users(username)').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('meetings').select('*').order('date', { ascending: false }),
      supabaseAdmin.from('users').select('*, resources(id, status)').order('created_at', { ascending: false })
    ]);

    const pending_list = (pendingListRes.data || []).map(r => ({ ...r, tags: r.resource_tags || [] }));

    return NextResponse.json({
      stats: {
        total: totalRes.count || 0,
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        featured: featuredRes.count || 0,
        rejected: rejectedRes.count || 0,
        contributors: contributorsRes.count || 0
      },
      pending: pending_list,
      resources: allResourcesRes.data || [],
      meetings: meetingsRes.data || [],
      users: usersRes.data || [],
    });
  } catch (err) {
    console.error('[GET /api/admin/data]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
