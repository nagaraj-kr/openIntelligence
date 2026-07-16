import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.role === 'ADMIN';
  } catch { return false; }
}

// POST /api/admin/meetings — create meeting
export async function POST(request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, description, date, venue, registration_link, cover_image, speakers } = await request.json();

    if (!title || !description || !date || !venue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: meeting, error } = await supabaseAdmin.from('meetings').insert({
      title,
      description,
      date:              new Date(date).toISOString(),
      venue,
      registration_link: registration_link || '',
      status:            'UPCOMING',
      tags:              [],
      speakers:          speakers || [],
      cover_image:       cover_image || null,
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, meeting }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/meetings] Error:', err.message, err.code);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/admin/meetings — list all meetings
export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { data: meetings, error } = await supabaseAdmin.from('meetings').select('*').order('date', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ meetings });
  } catch (err) {
    console.error('[GET /api/admin/meetings] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
