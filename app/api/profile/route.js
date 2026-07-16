import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
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

    const [profileRes, resourcesRes] = await Promise.all([
      supabaseAdmin.from('users').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('resources').select('*, category:categories(*), resource_tags(tag:tags(*))').eq('contributor_id', user.id).order('created_at', { ascending: false }),
    ]);

    const profile = profileRes.data;
    const resources = (resourcesRes.data || []).map(r => ({
      ...r,
      tags: r.resource_tags || []
    }));

    return NextResponse.json({ profile, resources });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
