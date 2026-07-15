import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Check admin session via the custom admin_session cookie only.
// This is COMPLETELY SEPARATE from Supabase auth —
// so admin login/logout never affects the public user navbar.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return NextResponse.json({ isAdmin: false });

    const session = JSON.parse(raw);
    const isAdmin = session?.role === 'ADMIN';
    return NextResponse.json({ isAdmin, email: session?.email, name: session?.name });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
