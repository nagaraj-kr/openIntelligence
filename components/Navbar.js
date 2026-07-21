'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/resources', label: 'Resources' },
  { href: '/meetings', label: 'Book Meetings' },
  { href: '/contribute', label: 'Contribute' },
];

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMeetingsOpen, setMobileMeetingsOpen] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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

  const handleOAuthLogin = (provider) => {
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      <style>{`
        /* ── Navbar Items ── */
        .nb-desktop-auth    { display: flex; }
        .nb-hamburger       { display: none; }
        .nb-mobile-profile  { display: none; }

        @media (min-width: 769px) {
          .nb-desktop-links { display: flex !important; }
        }

        /* ── Mobile / Tablet (≤ 768px) ── */
        @media (max-width: 768px) {
          .nb-desktop-only  { display: none !important; }
          .nb-desktop-auth  { display: none !important; }
          .nb-hamburger     { display: flex !important; }
          .nb-mobile-profile { display: block !important; }
        }
      `}</style>

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(5,8,16,0.90)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
        transition: 'all 0.3s ease',
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

          {/* ── Right side ── */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>

            {/* Login/Signup or user actions */}
            <div className="nb-desktop-auth" style={{ alignItems: 'center', gap: '0.75rem' }}>
              {user ? (
                <div className="user-dropdown-container" style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '2px 10px 2px 2px',
                      background: '#FFFFFF', borderRadius: '50px',
                      border: '1px solid #E5E7EB', cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <img
                      src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff'}
                      alt="Profile"
                      style={{ width: 36, height: 36, borderRadius: '50%' }}
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                      width: '280px', background: '#FFFFFF',
                      borderRadius: '12px', border: '1px solid #E5E7EB',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.05rem', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
                          {user.user_metadata?.full_name || 'Nagaraj K R'}
                        </div>
                        <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                          {user.user_metadata?.user_name ? `@${user.user_metadata.user_name}` : (user.email || '@nagaraj-kr')}
                        </div>
                      </div>

                      <div style={{ padding: '0.5rem 0' }}>
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.25rem', color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                          Your profile
                        </Link>
                        <Link href="/profile?tab=contributions" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.25rem', color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="8" y1="9" x2="16" y2="9"></line><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="12" y2="17"></line></svg>
                          My contributions
                        </Link>
                        <Link href="/profile?tab=bookings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            My bookings
                          </div>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></span>
                        </Link>
                        <Link href="/submit" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.25rem', color: '#374151', textDecoration: 'none', fontSize: '0.95rem' }}>
                          <span style={{ fontSize: '1.4rem', lineHeight: 1, color: '#D97706', width: 18, textAlign: 'center', display: 'inline-block' }}>+</span>
                          Submit a resource
                        </Link>
                      </div>

                      <div style={{ padding: '0.5rem 0', borderTop: '1px solid #F3F4F6' }}>
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1.25rem', color: '#4B5563', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => setAuthModalOpen(true)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* MOBILE ONLY - Simple Profile Avatar */}
            {user && (
              <Link href="/profile" className="nb-mobile-profile" aria-label="My Profile">
                <img 
                  src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff'} 
                  alt="Profile" 
                  style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)' }} 
                />
              </Link>
            )}

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
            background: 'rgba(8,10,22,0.98)',
            borderTop: '1px solid rgba(99,102,241,0.15)',
            backdropFilter: 'blur(20px)',
            padding: '0.75rem 1.5rem 1.5rem',
          }}>

            {/* Nav links */}
            {NAV_LINKS.map(({ href, label }) => {
              if (label === 'Book Meetings') {
                return (
                  <div key={href} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        onClick={() => setMobileMeetingsOpen(!mobileMeetingsOpen)}
                        style={{
                          padding: '0.8rem 0',
                          color: pathname === href ? '#6366f1' : 'var(--text-secondary)',
                          fontWeight: 500,
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontFamily: 'var(--font-sans)',
                          textAlign: 'left'
                        }}
                      >
                        {label}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: mobileMeetingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>

                      {mobileMeetingsOpen && (
                        <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingBottom: '0.8rem' }}>
                          <Link href="/meetings?tab=upcoming" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Upcoming Sessions
                          </Link>
                          <Link href="/meetings?tab=past" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Past Sessions
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return (
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
              );
            })}

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
                  <button onClick={() => { setMenuOpen(false); setAuthModalOpen(true); }} className="btn-primary" style={{ padding: '0.75rem' }}>
                    Sign Up
                  </button>
                </>
              )}
            </div>

          </div>
        )}
      </header>

      {/* ── Auth Modal ── */}
      {authModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }} onClick={() => setAuthModalOpen(false)}>
          <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAuthModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textAlign: 'center' }}>Welcome to Open Intelligence</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem', marginBottom: '1rem' }}>Log in or sign up to submit resources and join events.</p>

            <button onClick={() => handleOAuthLogin('github')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: '#24292e', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              Continue with GitHub
            </button>

            <button onClick={() => handleOAuthLogin('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: '#fff', color: '#000', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </>

  );
}
