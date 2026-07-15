import prisma from '@/lib/prisma';
import Link from 'next/link';
import MeetingCard from '@/components/MeetingCard';
import MeetingsClient from './MeetingsClient';

export const metadata = {
  title: 'Community Sessions — Open Intelligence Hub',
  description: 'Upcoming and past Madurai AI Community sessions by PiBi Foundation.',
};

async function getMeetings() {
  try {
    const [upcoming, past] = await Promise.all([
      prisma.meeting.findMany({
        where:   { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
      }),
      prisma.meeting.findMany({
        where:   { date: { lt: new Date() } },
        orderBy: { date: 'desc' },
      }),
    ]);
    return { upcoming, past };
  } catch {
    return { upcoming: [], past: [] };
  }
}

export default async function MeetingsPage() {
  const { upcoming, past } = await getMeetings();

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>

        {/* ── Page Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1rem', padding: '0.3rem 1rem', borderRadius: '20px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
          }}>
            📅 Madurai AI Community
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 900, fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)', marginBottom: '0.6rem',
          }}>
            Community <span className="gradient-text">Sessions</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
            Join us every week for hands-on AI learning. 52+ weeks of consistent community building by PiBi Foundation.
          </p>
        </div>

        {/* ── Stats strip ── */}
        <div className="glass-card" style={{ marginBottom: '3rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', textAlign: 'center' }}>
          {[
            { label: 'Upcoming',       value: upcoming.length || '0',  color: '#818cf8' },
            { label: 'Past Sessions',  value: past.length     || '0',  color: '#34d399' },
            { label: 'Weeks of AI',    value: '52+',                   color: '#06b6d4' },
            { label: 'Location',       value: 'Madurai',               color: '#f472b6' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color, fontFamily: 'var(--font-display)' }}>{value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Sessions Tabs ── */}
        <MeetingsClient upcoming={upcoming} past={past} />
      </div>
    </div>
  );
}
