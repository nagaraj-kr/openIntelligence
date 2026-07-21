import Link from 'next/link';
import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ResourceCard from '@/components/ResourceCard';
import MeetingCard from '@/components/MeetingCard';
import WaveHero from '@/components/WaveHero';
import HeroEventCard from '@/components/HeroEventCard';
import BanAlert from '@/components/BanAlert';
import ExploreSection from '@/components/ExploreSection';


// 7 categories from the project document are now in ExploreSection.js


async function getFeaturedResources() {
  try {
    const { data: resources, error } = await supabaseAdmin
      .from('resources')
      .select('*, category:categories(*), contributor:users(username, avatar_url, bio), resource_tags(tag:tags(*))')
      .in('status', ['FEATURED', 'APPROVED'])
      .order('status', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    // Filter out banned users and map nested tags structure
    return (resources || [])
      .filter(r => !r.contributor || r.contributor.bio !== '__BANNED__')
      .map(r => ({
        ...r,
        tags: r.resource_tags || []
      }));
  } catch (err) {
    console.error("HOME PAGE DB ERROR:", err.message);
    return [];
  }
}

async function getUpcomingMeetings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('meetings')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(2);
    if (error) throw error;
    return (data || []).map(m => ({ ...m, date: m.date.endsWith('Z') ? m.date : m.date + 'Z' }));
  } catch { return []; }
}

// DB-based contributors — resource submitters (no GitHub API needed)
async function getTopContributors() {
  try {
    // Fetch all approved resources and their contributors
    const { data: resources, error: resError } = await supabaseAdmin
      .from('resources')
      .select('contributor:users(id, username, avatar_url, bio)')
      .in('status', ['APPROVED', 'FEATURED']);

    if (resError) throw resError;

    if (!resources || resources.length === 0) return { contributors: [] };

    // Group in JS
    const userMap = {};
    const counts = {};

    for (const r of resources) {
      const u = r.contributor;
      if (u && u.bio !== '__BANNED__') {
        counts[u.id] = (counts[u.id] || 0) + 1;
        if (!userMap[u.id]) userMap[u.id] = u;
      }
    }

    const contributors = Object.entries(counts)
      .map(([id, count]) => {
        const u = userMap[id];
        return {
          login: u.username || 'Anonymous',
          avatar_url: u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`,
          profile_url: u.username ? `https://github.com/${u.username}` : '#',
          resource_count: count,
        };
      })
      .sort((a, b) => b.resource_count - a.resource_count)
      .slice(0, 5);

    return { contributors };
  } catch (err) {
    console.error("Top contributors error:", err.message);
    return { contributors: [] };
  }
}

export const metadata = {
  title: 'Open Intelligence Hub — Madurai AI Community',
  description: 'Discover, submit, and showcase open-source AI resources. Built by PiBi Foundation for the Madurai AI Community.',
};

export default async function HomePage() {
  const [featuredResources, upcomingMeetings, { contributors: topContributors }] = await Promise.all([
    getFeaturedResources(),
    getUpcomingMeetings(),
    getTopContributors(),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <BanAlert />
      </Suspense>
      {/* ── HERO — Wave Design ──────────────────────────────────── */}
      <WaveHero />

      {/* ── UPCOMING EVENTS (Hero Banner) ───────────────────────── */}
      {upcomingMeetings.length > 0 && (
        <section style={{ padding: '3rem 1rem 0rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem', width: '100%', maxWidth: '1100px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Upcoming Sessions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Join us for our next Madurai AI Community events
            </p>
          </div>
          {upcomingMeetings.map((m) => (
            <HeroEventCard key={m.id} meeting={m} />
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <Link href="/meetings" className="btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              Explore All Events →
            </Link>
          </div>
        </section>
      )}

      {/* ── CATEGORIES (GSAP Animated) ─────────────────────────── */}
      <ExploreSection />

      {/* ── HERO TEXT & FEATURED RESOURCES ─────────────────────── */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '3rem', background: "white" }}>
        <div className="container">
          {/* Added Hero Text */}
          <div style={{ maxWidth: '800px', marginBottom: '4rem', textAlign: 'left' }}>
            <div style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              MADURAI AI COMMUNITY &middot; PIBI FOUNDATION
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, color: 'black', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              The community-curated home for<br />open-source AI.
            </h2>
            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '750px' }}>
              Datasets, GitHub projects, prompt libraries, MCP servers, RAG templates and workflows &mdash; all crowdsourced, reviewed and organised by the Madurai AI community.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/resources" style={{ background: '#0f172a', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
                Browse resources &rarr;
              </Link>
              <Link href="/submit" style={{ background: '#ffffff', color: '#0f172a', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
                Submit a resource
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Featured resources
            </h3>
            <Link href="/resources" style={{ fontSize: '0.85rem', color: '#475569', textDecoration: 'none' }}>
              View all &rarr;
            </Link>
          </div>

          {featuredResources.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '1rem',
            }}>
              {featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} variant="minimal" />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
              <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>
                Be the First Contributor!
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                The Madurai AI Community is just getting started. Submit the first open-source AI resource.
              </p>
              <Link href="/submit" className="btn-primary">
                + Submit a Resource
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* (Old upcoming events section removed) */}


      {/* ── CONTRIBUTORS LEADERBOARD ───────────────────────────── */}
      {topContributors.length > 0 && (
        <section className="section" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
                Community Contributors
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                People powering the Open Intelligence Hub with AI resources
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '700px', margin: '0 auto' }}>
              {topContributors.map((c, idx) => (
                <a
                  key={c.login}
                  href={c.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="glass-card" style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderRadius: '12px',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    border: idx === 0 ? '1px solid rgba(99,102,241,0.35)' : undefined,
                  }}>
                    {/* Rank */}
                    <div style={{
                      minWidth: 32, height: 32, borderRadius: '50%',
                      background: idx === 0 ? 'linear-gradient(135deg,#6366f1,#818cf8)'
                        : idx === 1 ? 'rgba(6,182,212,0.15)'
                          : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: idx === 0 ? '#fff' : idx === 1 ? '#06b6d4' : 'var(--text-muted)',
                      border: idx > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      flexShrink: 0,
                    }}>
                      #{idx + 1}
                    </div>

                    {/* Avatar */}
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      width={36} height={36}
                      style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', objectFit: 'cover', flexShrink: 0 }}
                    />

                    {/* Name and Badge */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {c.login}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginBottom: '0.25rem' }}>@{c.login}</div>
                      <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        📦 {c.resource_count} resource{c.resource_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ── CONTRIBUTE CTA ─────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
          <div className="glass-card animate-pulse-glow" style={{ padding: '4rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.2)' }}>
                <svg width="44" height="44" viewBox="0 0 640 512" fill="url(#handshake-grad)">
                  <defs>
                    <linearGradient id="handshake-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <path d="M323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5l-20.9 16.2L512 316.8V128h-.7l-3.9-2.5L434.8 79c-15.3-9.8-33.2-15-51.4-15c-21.8 0-43 7.5-60 21.2zm22.8 124.4l-51.7 40.2C263 274.4 217.3 268 193.7 235.6c-22.2-30.5-16.6-73.1 12.7-96.8l83.2-67.3c-11.6-4.9-24.1-7.4-36.8-7.4C234 64 215.7 69.6 200 80l-72 48V352h28.2l91.4 83.4c19.6 17.9 49.9 16.5 67.8-3.1c5.5-6.1 9.2-13.2 11.1-20.6l17 15.6c19.5 17.9 49.9 16.6 67.8-2.9c4.5-4.9 7.8-10.6 9.9-16.5c19.4 13 45.8 10.3 62.1-7.5c17.9-19.5 16.6-49.9-2.9-67.8l-134.2-123zM16 128c-8.8 0-16 7.2-16 16V352c0 8.8 7.2 16 16 16H64V128H16zM48 320a16 16 0 1 1 0 32 16 16 0 1 1 0-32zm0-240a16 16 0 1 1 0 32 16 16 0 1 1 0-32zM624 128H576V368h48c8.8 0 16-7.2 16-16V144c0-8.8-7.2-16-16-16z" />
                </svg>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Why Open Contributions Matter
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              A dataset can help a researcher build a better model. A GitHub repo can save a startup weeks of effort.
              A prompt library can improve productivity for hundreds. Together, small contributions become the foundation others build upon.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/submit" className="btn-primary">
                + Submit a Resource
              </Link>
              <Link href="/meetings" className="btn-outline">
                View Meetings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
