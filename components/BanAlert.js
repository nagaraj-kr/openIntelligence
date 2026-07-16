'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BanAlert() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'banned') {
      setShow(true);
      // Clean up the URL without triggering a page reload
      const url = new URL(window.location);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#fca5a5',
      padding: '1.25rem',
      borderRadius: '12px',
      margin: '1.5rem auto 0 auto',
      width: '90%',
      maxWidth: '1200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      fontWeight: 500,
      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)',
      zIndex: 50,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⛔</span>
        <span style={{ fontSize: '0.95rem' }}>Your account has been banned due to policy violations. You are no longer able to log in or submit resources.</span>
      </div>
      <button 
        onClick={() => setShow(false)} 
        style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.6rem', borderRadius: '6px' }}
      >
        &times;
      </button>
    </div>
  );
}
