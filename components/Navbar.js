'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/resources', label: 'Resources' },
  { href: '/meetings',  label: 'Book Meetings' },
  { href: '/contribute',label: 'Contribute' },
];

export default function Navbar() {
  const pathname  = usePathname();
  const supabase  = createClient();
  const [user,     setUser]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = () => supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setMenuOpen(false); };

  return (
    <>
      <style>{`
        /* ── Desktop (≥ 769px): show Login/Signup, hide hamburger ── */
        .nb-desktop-auth    { display: flex; }
        .nb-hamburger       { display: none; }

        @media (min-width: 769px) {
          .nb-desktop-links { display: flex !important; }
        }

        /* ── Mobile / Tablet (≤ 768px): hide desktop auth, show hamburger ── */
        @media (max-width: 768px) {
          .nb-desktop-auth  { display: none !important; }
          .nb-hamburger     { display: flex !important; }
        }
      `}</style>

      <header style={{
        position:       'sticky',
        top:            0,
        zIndex:         100,
        background:     scrolled ? 'rgba(5,8,16,0.90)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)'         : 'none',
        borderBottom:   scrolled ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
        transition:     'all 0.3s ease',
      }}>
        <nav className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px',
        }}>

          {/* ── Logo ── */}
          <div style={{ flex: 1, display: 'flex' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800, color: 'white',
                fontFamily: 'var(--font-display)',
              }}>OI</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Open<span style={{ color: '#6366f1' }}>Intelligence</span>
              </span>
            </Link>
          </div>

          {/* ── Desktop Links (Center) ── */}
          {!user && (
            <div className="nb-desktop-links" style={{ display: 'none', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href} style={{
                    textDecoration: 'none',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Right side ── */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>

            {/* DESKTOP ONLY — Login/Signup or user actions */}
            <div className="nb-desktop-auth" style={{ alignItems: 'center', gap: '0.75rem' }}>
              {user ? (
                <>
                  <Link href="/submit" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>
                    + Submit
                  </Link>
                  <Link href="/profile">
                    <img
                      src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff'}
                      alt="Profile"
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #6366f1', cursor: 'pointer' }}
                    />
                  </Link>
                  <button onClick={handleLogout} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}>
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={handleLogin} className="btn-outline" style={{
                  fontSize: '0.85rem', padding: '0.45rem 0.9rem',
                  border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(235,250,255,0.9)',
                  background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  Sign in
                </button>
              )}
            </div>

            {/* MOBILE / TABLET ONLY — Hamburger button */}
            <button
              className="nb-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: 'var(--text-primary)', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>

          </div>
        </nav>

        {/* ── Mobile / Tablet slide-down menu ── */}
        {menuOpen && (
          <div style={{
            background:  'rgba(8,10,22,0.98)',
            borderTop:   '1px solid rgba(99,102,241,0.15)',
            backdropFilter: 'blur(20px)',
            padding:     '0.75rem 1.5rem 1.5rem',
          }}>

            {/* Nav links */}
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '0.8rem 0',
                  color: pathname === href ? '#6366f1' : 'var(--text-secondary)',
                  textDecoration: 'none', fontWeight: 500,
                  borderBottom: '1px solid rgba(99,102,241,0.08)',
                }}
              >
                {label}
              </Link>
            ))}

            {/* Auth section */}
            <div style={{ marginTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user ? (
                <>
                  <Link href="/submit" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center', padding: '0.75rem' }}>
                    + Submit Resource
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)', textDecoration: 'none',
                  }}>
                    <img src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff'}
                      alt="Profile" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    My Profile
                  </Link>
                  <button onClick={handleLogout} style={{
                    padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171', fontWeight: 500,
                  }}>Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); handleLogin(); }} style={{
                    padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(99,102,241,0.4)',
                    color: 'rgba(235,250,255,0.9)', fontWeight: 500,
                  }}>Login</button>
                  <button onClick={() => { setMenuOpen(false); handleLogin(); }} className="btn-primary" style={{ padding: '0.75rem' }}>
                    Sign Up
                  </button>
                </>
              )}
            </div>

          </div>
        )}
      </header>
    </>
  );
}
