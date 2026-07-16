import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STATUS_MAP = {
  approve: 'APPROVED',
  feature: 'FEATURED',
  reject:  'REJECTED',
  pending: 'PENDING',
};

async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.role === 'ADMIN';
  } catch { return false; }
}

// PATCH /api/admin/resources — update resource status
export async function PATCH(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { resourceId, action } = await request.json();
  const status = STATUS_MAP[action];

  if (!status) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  const { data: resource, error } = await supabaseAdmin
    .from('resources')
    .update({ status })
    .eq('id', resourceId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, resource });
}
