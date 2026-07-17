'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function TypingText({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div style={{ fontSize: '1.05rem', color: '#4b5563', fontFamily: 'monospace', marginTop: '3rem', maxWidth: '400px', textAlign: 'center', lineHeight: 1.5 }}>
      {displayedText}<span style={{ borderRight: '2px solid #4b5563', animation: 'blink 1s step-end infinite' }}>&nbsp;</span>
      <style>{`
        @keyframes blink { 50% { border-color: transparent; } }
      `}</style>
    </div>
  );
}

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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-sans)', backgroundColor: '#ffffff', flexWrap: 'wrap' }}>
      
      {/* ── LEFT SIDE (Graphic & Text) ── */}
      <div style={{
        flex: '1 1 500px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '3rem',
        borderRight: '1px solid #f1f5f9',
        backgroundColor: '#ffffff'
      }}>
        {/* SVG Network Hexagon Logo with Animations */}
        {/* SVG Network Hexagon Logo with Animations */}
        <style>{`
          @keyframes slowSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulseNode {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.7; }
          }
          @keyframes dashDraw {
            0%   { stroke-dashoffset: 1; opacity: 0; }
            10%  { opacity: 1; }
            45%  { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          .hex-svg {
            animation: slowSpin 35s linear infinite;
            transform-origin: center;
          }
          .hex-node {
            animation: pulseNode 3s ease-in-out infinite;
            transform-origin: center;
            transform-box: fill-box;
          }
          .hex-node:nth-child(even) {
            animation-delay: 1.5s;
          }
          .hex-path {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation: dashDraw 5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
          }
        `}</style>
        <svg className="hex-svg" width="280" height="280" viewBox="0 0 200 200" fill="none" stroke="#0f172a" strokeWidth="2.5">
          {/* Outer Hexagon */}
          <polygon className="hex-path" pathLength="1" points="100,20 169.28,60 169.28,140 100,180 30.72,140 30.72,60" />
          
          {/* Inner Hexagon (faded) */}
          <polygon className="hex-path" pathLength="1" points="100,60 134.64,80 134.64,120 100,140 65.36,120 65.36,80" stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Lines from center to outer vertices */}
          <line className="hex-path" pathLength="1" x1="100" y1="100" x2="100" y2="20" stroke="#cbd5e1" strokeWidth="1.2" />
          <line className="hex-path" pathLength="1" x1="100" y1="100" x2="169.28" y2="60" stroke="#cbd5e1" strokeWidth="1.2" />
          <line className="hex-path" pathLength="1" x1="100" y1="100" x2="169.28" y2="140" stroke="#cbd5e1" strokeWidth="1.2" />
          <line className="hex-path" pathLength="1" x1="100" y1="100" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="1.2" />
          <line className="hex-path" pathLength="1" x1="100" y1="100" x2="30.72" y2="140" stroke="#cbd5e1" strokeWidth="1.2" />
          <line className="hex-path" pathLength="1" x1="100" y1="100" x2="30.72" y2="60" stroke="#cbd5e1" strokeWidth="1.2" />
          
          {/* Outer Nodes */}
          <circle className="hex-node" cx="100" cy="20" r="4.5" fill="#0f172a" />
          <circle className="hex-node" cx="169.28" cy="60" r="4.5" fill="#0f172a" />
          <circle className="hex-node" cx="169.28" cy="140" r="4.5" fill="#0f172a" />
          <circle className="hex-node" cx="100" cy="180" r="4.5" fill="#0f172a" />
          <circle className="hex-node" cx="30.72" cy="140" r="4.5" fill="#0f172a" />
          <circle className="hex-node" cx="30.72" cy="60" r="4.5" fill="#0f172a" />
          
          {/* Center Node */}
          <circle className="hex-node" cx="100" cy="100" r="5" fill="#0f172a" style={{ animationDelay: '0.75s' }} />
        </svg>

        <TypingText text="intelligence is not closed it's open , collaboration and infinite" />
      </div>

      {/* ── RIGHT SIDE (Login Form) ── */}
      <div style={{
        flex: '1 1 500px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '3rem 2rem',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '0.35rem',
              letterSpacing: '-0.5px'
            }}>
              Admin Portal
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Open Intelligence Hub · PiBi Foundation
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#ffffff',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Email */}
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '0.85rem 1rem',
                    borderRadius: '10px', border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#0f172a',
                    outline: 'none', transition: 'all 0.2s',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#94a3b8'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: '#475569', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '0.85rem 1rem', paddingRight: '2.8rem',
                      borderRadius: '10px', border: '1px solid #e2e8f0',
                      background: '#f8fafc', color: '#0f172a',
                      outline: 'none', transition: 'all 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#94a3b8'; e.target.style.background = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '1rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      color: '#94a3b8', cursor: 'pointer',
                      padding: 0, display: 'flex'
                    }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 10.5c2.4 4 6.4 6.5 10 6.5s7.6-2.5 10-6.5" /><line x1="4.8" y1="14.4" x2="3.6" y2="17" /><line x1="9.3" y1="17.4" x2="8.8" y2="20.2" /><line x1="14.7" y1="17.4" x2="15.2" y2="20.2" /><line x1="19.2" y1="14.4" x2="20.4" y2="17" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c2.4-4.5 6.4-7 10-7s7.6 2.5 10 7c-2.4 4.5-6.4 7-10 7s-7.6-2.5-10-7z" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="3.2" x2="12" y2="1.2" /><line x1="5.2" y1="5.6" x2="4.2" y2="4" /><line x1="18.8" y1="5.6" x2="19.8" y2="4" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: '#0f172a', color: 'white',
                  border: 'none', borderRadius: '10px',
                  fontWeight: 600, fontSize: '0.95rem',
                  marginTop: '0.75rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  opacity: (loading || !email || !password) ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}
              >
                {loading ? 'Verifying...' : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Login to Admin Panel
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ margin: '1.75rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Back to site */}
            <a
              href="/"
              style={{
                display: 'block', textAlign: 'center',
                color: '#64748b', fontSize: '0.85rem', textDecoration: 'none'
              }}
            >
              ← Back to Open Intelligence Hub
            </a>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Restricted access · Admin only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
