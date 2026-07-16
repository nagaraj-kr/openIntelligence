import Link from 'next/link';
import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ResourceCard from '@/components/ResourceCard';
import MeetingCard from '@/components/MeetingCard';
import WaveHero from '@/components/WaveHero';
import HeroEventCard from '@/components/HeroEventCard';
import BanAlert from '@/components/BanAlert';


// 7 categories from the project document
const CATEGORIES = [
  { icon: '📚', name: 'Public Datasets', slug: 'dataset', desc: 'High-quality datasets for AI research & model training' },
  { icon: '💻', name: 'Open GitHub Projects', slug: 'open-repository', desc: 'Open-source repos accelerating AI development' },
  { icon: '✍️', name: 'Prompt Libraries', slug: 'prompt-library', desc: 'Reusable prompts for consistent AI results' },
  { icon: '🔌', name: 'MCP Servers', slug: 'mcp-server', desc: 'Connectors linking AI agents to tools & APIs' },
  { icon: '🧠', name: 'RAG Templates', slug: 'rag-template', desc: 'Retrieval-Augmented Generation pipelines & examples' },
  { icon: '⚙️', name: 'AI Workflows & Automation', slug: 'ai-workflow', desc: 'Reusable automation playbooks for real-world tasks' },
  { icon: '📖', name: 'Documentation & Tutorials', slug: 'documentation', desc: 'Guides & tutorials that make AI accessible' },
];



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
    return data || [];
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
      .slice(0, 8);

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

      {/* ── CATEGORIES ─────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              What We Explore
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              7 categories of open AI resources for the community
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {CATEGORIES.map(({ icon, name, slug, desc }) => (
              <Link key={slug} href={`/resources?category=${slug}`} style={{ textDecoration: 'none' }}>
                <div
                  className="glass-card"
                  style={{ padding: '1.25rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}
                >
                  <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.35rem',
                  }}>
                    {icon}
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.3rem', lineHeight: 1.3 }}>
                      {name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.login}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>@{c.login}</div>
                    </div>

                    {/* Resource count badge */}
                    <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      📦 {c.resource_count} resource{c.resource_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ── CONTRIBUTE CTA ─────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div className="glass-card animate-pulse-glow" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
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
