'use client';

import { useState } from 'react';
import HeroEventCard from '@/components/HeroEventCard';
import Link from 'next/link';

export default function MeetingsClient({ upcoming, past }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <>
      <div style={{ 
        display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: '68px', zIndex: 90, background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(12px)', padding: '0 10px'
      }}>
        <button 
          onClick={() => setActiveTab('upcoming')}
          style={{ 
            padding: '1rem 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'upcoming' ? '2px solid #818cf8' : '2px solid transparent', 
            color: activeTab === 'upcoming' ? '#818cf8' : 'var(--text-muted)', 
            fontWeight: 600, 
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            transition: 'all 0.2s'
          }}>
          Upcoming Sessions <span style={{ marginLeft: '4px', padding: '2px 8px', borderRadius: '12px', background: activeTab === 'upcoming' ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{upcoming.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          style={{ 
            padding: '1rem 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'past' ? '2px solid #34d399' : '2px solid transparent', 
            color: activeTab === 'past' ? '#34d399' : 'var(--text-muted)', 
            fontWeight: 600, 
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            transition: 'all 0.2s'
          }}>
          Past Sessions <span style={{ marginLeft: '4px', padding: '2px 8px', borderRadius: '12px', background: activeTab === 'past' ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{past.length}</span>
        </button>
      </div>

      <div style={{ minHeight: '400px' }}>
        {activeTab === 'upcoming' && (
          <section>
            {upcoming.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {upcoming.map((m) => <HeroEventCard key={m.id} meeting={m} isPast={false} />)}
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗓️</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  No upcoming sessions scheduled yet. Check back soon!
                </p>
                <Link href="/" style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                  ← Back to Home
                </Link>
              </div>
            )}
          </section>
        )}

        {activeTab === 'past' && (
          <section>
            {past.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {past.map((m) => <HeroEventCard key={m.id} meeting={m} isPast={true} />)}
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No past sessions found.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
