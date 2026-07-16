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
  const [attendedMeetings, setAttendedMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Account Linking State
  const [showEmailLink, setShowEmailLink] = useState(false);
  const [alternateEmail, setAlternateEmail] = useState('');
  const [showGithubLink, setShowGithubLink] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState('');
  
  // Expanded meetings for showing outcomes
  const [expandedMeetings, setExpandedMeetings] = useState({});

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
        setAttendedMeetings(data.attended_meetings || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveLink = async (type) => {
    setLinkSaving(true);
    setLinkSuccess('');
    try {
      const payload = type === 'email' ? { alternate_email: alternateEmail } : { github_username: githubUsername };
      const res = await fetch('/api/profile/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setLinkSuccess(type === 'email' ? 'Event Email linked successfully!' : 'GitHub linked successfully!');
        if (type === 'email') setProfile(prev => ({ ...prev, alternate_email: alternateEmail }));
        if (type === 'github') setProfile(prev => ({ ...prev, github_username: githubUsername }));
        // Refresh page to show new meetings
        if (type === 'email') window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
    setLinkSaving(false);
  };

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
      <div className="container" style={{ maxWidth: '1000px' }}>

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
                {profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.user_name || 'User'}
              </h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                @{profile?.github_username || user.user_metadata?.user_name || user.email?.split('@')[0]}
              </div>
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

        {/* Your booked meetings */}
        <div className="glass-card" style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>Your booked meetings</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Seats you've reserved at community meetups.</p>
            </div>
            <Link href="/meetings" className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              Browse meetings &rarr;
            </Link>
          </div>
          {attendedMeetings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {attendedMeetings.map((reg, index) => {
                if (!reg.meeting) return null;
                const mDate = new Date(reg.meeting.date);
                const monthShort = mDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
                const dayNum = mDate.getDate();
                const dayOfWeek = mDate.toLocaleDateString('en-IN', { weekday: 'short' });
                const monthNorm = mDate.toLocaleDateString('en-IN', { month: 'short' });
                const timeStr = mDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                const bDate = new Date(reg.created_at);
                const bookedDay = bDate.getDate();
                const bookedMonth = bDate.toLocaleDateString('en-IN', { month: 'short' });
                const bookedYear = bDate.getFullYear();
                
                // Check if upcoming
                const isUpcoming = mDate > new Date();

                return (
                  <div key={reg.id} style={{ borderBottom: index < attendedMeetings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                      {/* Date Block */}
                      <div style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: '#f8f7f4', borderRadius: '8px', padding: '0.5rem 0.7rem', minWidth: '55px'
                      }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9c814b', textTransform: 'uppercase', marginBottom: '0.1rem' }}>{monthShort}</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#18181b', lineHeight: 1.1 }}>{dayNum}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Link href={`/meetings/${reg.meeting.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>
                            {reg.meeting.title}
                          </Link>
                          <span style={{ 
                            background: isUpcoming ? '#dcfce7' : 'rgba(0,0,0,0.05)', 
                            color: isUpcoming ? '#166534' : 'var(--text-secondary)', 
                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' 
                          }}>
                            {isUpcoming ? 'UPCOMING' : 'PAST'}
                          </span>
                        </div>
                        
                        <p style={{ color: '#52525b', fontSize: '0.85rem', margin: 0 }}>
                          {dayOfWeek} {dayNum} {monthNorm}, {timeStr} &middot; {reg.meeting.venue}
                        </p>
                        <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>
                          Booked {bookedDay} {bookedMonth} {bookedYear} &middot; Host {reg.meeting.host || 'Nagaraj K R'}
                        </p>
                      </div>

                      <Link 
                        href={`/meetings/${reg.meeting.id}`}
                        className="btn-outline" 
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', alignSelf: 'center', whiteSpace: 'nowrap', textDecoration: 'none' }}
                      >
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                No bookings yet. <Link href="/meetings" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Reserve a seat</Link> at the next meetup.
              </p>
            </div>
          )}
        </div>

        {/* Account Linking Prompts */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Missing GitHub Link (for Google Users) */}
          {(!profile?.github_username && !user?.user_metadata?.user_name) && (
            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Do you have a GitHub profile?</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Link your GitHub username to showcase your profile properly on your submitted resources.
              </p>
              {!showGithubLink ? (
                <button onClick={() => setShowGithubLink(true)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                  Link GitHub Username
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. torvalds" 
                    value={githubUsername} 
                    onChange={e => setGithubUsername(e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <button onClick={() => handleSaveLink('github')} disabled={linkSaving} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                    {linkSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setShowGithubLink(false)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* Missing Event Registration Email */}
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Missing Event Sessions?</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              We search for attended sessions using <strong>{user?.email}</strong>. If you register for events using a different email (like Gmail), link it here to see them on your profile!
            </p>
            {!showEmailLink ? (
              <button onClick={() => setShowEmailLink(true)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                {profile?.alternate_email ? `Linked: ${profile.alternate_email} (Change)` : 'Link Alternate Email'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input 
                  type="email" 
                  placeholder="Your alternate email" 
                  value={alternateEmail} 
                  onChange={e => setAlternateEmail(e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#fff', fontSize: '0.85rem' }}
                />
                <button onClick={() => handleSaveLink('email')} disabled={linkSaving} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                  {linkSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setShowEmailLink(false)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Cancel</button>
              </div>
            )}
          </div>

          {linkSuccess && <div style={{ color: '#34d399', fontSize: '0.85rem', padding: '0.5rem' }}>✓ {linkSuccess}</div>}
        </div>

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
