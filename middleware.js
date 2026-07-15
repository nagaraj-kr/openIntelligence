import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // ─── Admin routes: check admin_session cookie (NOT Supabase) ─────────────────
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isAdminRoute) {
    const adminSessionRaw = request.cookies.get('admin_session')?.value;
    let isAdmin = false;
    try {
      if (adminSessionRaw) {
        const session = JSON.parse(adminSessionRaw);
        isAdmin = session?.role === 'ADMIN';
      }
    } catch { isAdmin = false; }

    if (!isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  // ─── User contributor routes: check Supabase session ─────────────────────────
  // Only call Supabase auth for protected routes — avoids rate limiting on public pages
  const contributorRoutes = ['/submit', '/profile'];
  const isContributorRoute = contributorRoutes.some((r) => pathname.startsWith(r));

  if (isContributorRoute) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/';
        redirectUrl.searchParams.set('auth', 'required');
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Middleware auth error:', error.message);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
