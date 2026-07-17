import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await request.json();
    const updateData = {};

    if (payload.alternate_email !== undefined) {
      updateData.alternate_email = payload.alternate_email;
    }
    if (payload.github_username !== undefined) {
      updateData.github_username = payload.github_username;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin.from('users').update(updateData).eq('id', user.id);
    if (dbError) throw dbError;

    // Also save to auth.users user_metadata to prevent db triggers from wiping it on login
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: updateData
    });
    if (authError) console.error("Error updating user_metadata:", authError);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
