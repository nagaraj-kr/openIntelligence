import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // 1. Look up admin by email in the `admins` table (separate from GitHub users)
    const { data: admin } = await supabaseAdmin.from('admins').select('*').eq('email', email).single();

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Verify password using bcrypt
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Set a secure httpOnly admin session cookie — completely separate from Supabase
    const cookieStore = await cookies();
    cookieStore.set(
      'admin_session',
      JSON.stringify({ id: admin.id, email: admin.email, name: admin.name, role: 'ADMIN' }),
      {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 60 * 8, // 8 hours
        path:     '/',
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/admin/login]', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
