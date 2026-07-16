import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const supabaseUser = data.user;
      const githubUsername = supabaseUser.user_metadata?.user_name || '';

      // Check if this GitHub username is in the admin list
      const adminUsernames = (process.env.ADMIN_GITHUB_USERNAMES || '')
        .split(',')
        .map((u) => u.trim().toLowerCase())
        .filter(Boolean);

      const isAdmin = adminUsernames.includes(githubUsername.toLowerCase());

      let dbUser;
      try {
        dbUser = await prisma.user.upsert({
          where:  { id: supabaseUser.id },
          update: {
            username:   githubUsername || supabaseUser.email || 'user',
            full_name:  supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            // Upgrade to admin if username matches — never downgrade
            ...(isAdmin ? { role: 'ADMIN' } : {}),
          },
          create: {
            id:         supabaseUser.id,
            username:   githubUsername || supabaseUser.email || 'user',
            full_name:  supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            role:       isAdmin ? 'ADMIN' : 'CONTRIBUTOR',
          },
        });
      } catch (dbError) {
        console.error('Error saving user profile:', dbError);
      }

      // Deny access if banned
      if (dbUser?.bio === '__BANNED__') {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/?error=banned`);
      }

      // Redirect admin to admin panel, others to home
      const redirectPath = isAdmin ? '/admin' : next;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error`);
}
