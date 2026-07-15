  'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Get admin info from /api/admin/check
    fetch('/api/admin/check')
      .then(r => r.json())
      .then(data => {
        if (data.isAdmin) {
          setAdminName(data.name || 'Admin');
          setAdminEmail(data.email || '');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header style={{
      position:       'sticky',
      top:            0,
      zIndex:         100,
      background:     scrolled ? 'rgba(5,8,16,0.95)' : 'rgba(5,8,16,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom:   '1px solid rgba(99,102,241,0.15)',
      transition:     'all 0.3s ease',
    }}>
      <div style={{
        maxWidth:      '1280px',
        margin:        '0 auto',
        padding:       '0 1.5rem',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        height:        '60px',
      }}>

        {/* Left — Logo + Admin Badge */}
        <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 800, color: 'white',
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Admin <span style={{ color: '#6366f1' }}>Panel</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Open Intelligence Hub
            </div>
          </div>
        </Link>

        {/* Right — Admin info + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Admin identity */}
          {adminEmail && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {adminName}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                {adminEmail}
              </div>
            </div>
          )}

          {/* Avatar placeholder */}
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: 'white',
            border: '2px solid rgba(99,102,241,0.4)',
          }}>
            {adminName?.[0]?.toUpperCase() || 'A'}
          </div>

          {/* View Site link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:    'flex', alignItems: 'center', gap: '0.3rem',
              color:      'var(--text-muted)', fontSize: '0.75rem',
              textDecoration: 'none', padding: '0.35rem 0.7rem',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View Site
          </a>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              padding:       '0.4rem 0.9rem',
              borderRadius:  '8px',
              cursor:        loggingOut ? 'not-allowed' : 'pointer',
              background:    'rgba(239,68,68,0.08)',
              border:        '1px solid rgba(239,68,68,0.25)',
              color:         '#f87171',
              fontWeight:    600,
              fontSize:      '0.8rem',
              opacity:       loggingOut ? 0.6 : 1,
              transition:    'all 0.2s',
              display:       'flex',
              alignItems:    'center',
              gap:           '0.35rem',
            }}
            onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            {loggingOut ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Logging out...
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
