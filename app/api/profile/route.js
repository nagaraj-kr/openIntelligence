import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

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

    const [profile, resources] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.resource.findMany({
        where:   { contributor_id: user.id },
        include: { category: true, tags: { include: { tag: true } } },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return NextResponse.json({ profile, resources });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
