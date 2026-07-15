'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call our custom admin login API — no Supabase, no shared session
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mesh-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '10%', right: '15%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo + Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 900, color: 'white',
            fontFamily: 'var(--font-display)',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}>
            🛡️
          </div>

          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            marginBottom: '0.35rem',
          }}>
            Admin <span className="gradient-text">Portal</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Open Intelligence Hub · PiBi Foundation
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="admin@pibifoundation.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingRight: '2.8rem' }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.9rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.85rem', padding: '2px',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '0.7rem 1rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                color: '#f87171',
                fontSize: '0.82rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '0.95rem',
                marginTop: '0.25rem',
                opacity: (loading || !email || !password) ? 0.6 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Verifying...
                </span>
              ) : (
                '🔐 Login to Admin Panel'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Back to site */}
          <a
            href="/"
            style={{
              display: 'block',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#818cf8'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            ← Back to Open Intelligence Hub
          </a>
        </div>

        {/* Security note */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Restricted access · Admin only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
