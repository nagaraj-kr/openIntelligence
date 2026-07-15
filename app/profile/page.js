'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from '@/components/StatusBadge';

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUser(user);

      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setResources(data.resources || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = activeTab === 'all'
    ? resources
    : resources.filter((r) => r.status === activeTab.toUpperCase());

  const counts = {
    all: resources.length,
    pending: resources.filter((r) => r.status === 'PENDING').length,
    approved: resources.filter((r) => r.status === 'APPROVED').length,
    featured: resources.filter((r) => r.status === 'FEATURED').length,
    rejected: resources.filter((r) => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '860px' }}>

        {/* Profile header */}
        {user && (
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="Avatar"
              style={{ width: 70, height: 70, borderRadius: '50%', border: '2.5px solid rgba(99,102,241,0.5)', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-display)', margin: '0 0 0.2rem' }}>
                {user.user_metadata?.full_name || user.user_metadata?.user_name}
              </h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{user.user_metadata?.user_name}</div>
              {profile?.bio && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>{profile.bio}</div>}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
              {[
                { label: 'Submitted', value: counts.all },
                { label: 'Approved', value: counts.approved + counts.featured },
                { label: 'Featured', value: counts.featured },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#818cf8', fontFamily: 'var(--font-display)' }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            <Link href="/submit" className="btn-primary" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              + Submit Resource
            </Link>
          </div>
        )}

        {/* Tab filter */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {Object.entries(counts).map(([tab, count]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                borderColor: activeTab === tab ? '#6366f1' : 'var(--border)',
                background: activeTab === tab ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: activeTab === tab ? '#818cf8' : 'var(--text-secondary)',
              }}
            >
              {tab} ({count})
            </button>
          ))}
        </div>

        {/* Resources list */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((resource) => (
              <div key={resource.id} className="glass-card" style={{ padding: '1.1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <Link href={`/resources/${resource.slug}`} style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                      {resource.title}
                    </Link>
                    <StatusBadge status={resource.status} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                    {resource.category?.name} · Submitted {new Date(resource.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {resource.github_stars > 0 && (
                    <span style={{ color: '#fbbf24', fontSize: '0.78rem' }}>⭐ {resource.github_stars}</span>
                  )}
                  <a href={resource.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
                    GitHub →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {activeTab === 'all' ? "You haven't submitted any resources yet." : `No ${activeTab} resources.`}
            </p>
            {activeTab === 'all' && (
              <Link href="/submit" className="btn-primary">Submit your first resource →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
