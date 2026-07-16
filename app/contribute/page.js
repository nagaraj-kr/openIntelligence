'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ContributePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        // If already logged in, go directly to the submit page
        router.push('/submit');
      } else {
        setLoading(false);
      }
    });
  }, [router, supabase]);

  const handleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (loading) {
    return <div style={{ minHeight: 'calc(100vh - 68px)', background: '#FAFAF9' }}></div>;
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAF9',
      padding: '2rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        padding: '3rem 2.5rem',
        maxWidth: '560px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Plus Icon Container */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#F3EFE7',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          margin: '0 auto 1.5rem auto'
        }}>
          +
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '1rem',
          fontFamily: 'var(--font-inter), sans-serif',
          letterSpacing: '-0.025em'
        }}>
          Sign in to contribute
        </h1>

        {/* Subtext */}
        <p style={{
          color: '#6B7280',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          maxWidth: '400px',
          margin: '0 auto 2rem auto'
        }}>
          Contributions are attributed to your GitHub profile so the community can find and follow you.
        </p>

        {/* Button */}
        <button
          onClick={handleLogin}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.8rem 2.5rem',
            background: '#1c1917',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#292524'}
          onMouseOut={(e) => e.currentTarget.style.background = '#1c1917'}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          Continue with GitHub
        </button>

        <div style={{ margin: 0 }}>
          <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
            Or <Link href="/resources" style={{ color: '#9CA3AF', textDecoration: 'underline' }}>browse resources</Link> first.
          </span>
        </div>
      </div>
    </div>
  );
}
