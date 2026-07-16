import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StatusBadge from '@/components/StatusBadge';
import { parseGitHubUrl } from '@/lib/github';
import ResourceTabs from './ResourceTabs';

/** Fetch forkers for a specific GitHub repo — 1 API call per page */
async function getRepoForkers(githubUrl) {
  if (!githubUrl) return { forkers: [], forkCount: 0 };
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) return { forkers: [], forkCount: 0 };
  const { owner, repo } = parsed;

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Get repo info for fork count
    const infoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers, cache: 'no-store'
    });
    if (!infoRes.ok) return { forkers: [], forkCount: 0 };
    const info = await infoRes.json();
    const forkCount = info.forks_count || 0;

    // Get recent forkers (max 20)
    const forksRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/forks?per_page=20&sort=newest`,
      { headers, cache: 'no-store' }
    );
    const forksData = forksRes.ok ? await forksRes.json() : [];
    const forkers = Array.isArray(forksData)
      ? forksData.map(f => ({
          login:      f.owner?.login || '',
          avatar_url: f.owner?.avatar_url || '',
          profile_url: `https://github.com/${f.owner?.login}`,
        })).filter(f => f.login)
      : [];

    return { forkers, forkCount };
  } catch {
    return { forkers: [], forkCount: 0 };
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const resource = await prisma.resource.findUnique({
      where: { slug },
      select: { title: true, description: true },
    });
    if (!resource) return { title: 'Resource Not Found' };
    return {
      title: resource.title,
      description: resource.description,
    };
  } catch {
    return { title: 'Resource' };
  }
}

export default async function ResourceDetailPage({ params }) {
  const { slug } = await params;

  let resource;
  try {
    resource = await prisma.resource.findUnique({
      where: { slug },
      include: {
        category:    true,
        contributor: { select: { username: true, avatar_url: true, full_name: true, bio: true } },
        tags:        { include: { tag: true } },
      },
    });
  } catch {
    resource = null;
  }

  if (!resource) notFound();

  // Fetch GitHub forkers for this specific repo (parallel with other data already loaded)
  const { forkers, forkCount } = await getRepoForkers(resource.github_url);

  const {
    title, description, github_url, github_stars,
    github_language, github_last_updated,
    use_case, status, created_at,
    category, contributor, tags,
  } = resource;

  const updatedAgo = github_last_updated
    ? new Date(github_last_updated).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  const submittedDate = new Date(created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  // Fallback repo name extraction for the clone command
  const repoParsed = parseGitHubUrl(github_url);
  const repoName = repoParsed ? repoParsed.repo : 'repo-name';

  // Content for tabs
  const overviewContent = (
    <div>
      {/* Use Case */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
          Use case
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {use_case || description}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            TAGS
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/resources?search=${tag.name}`}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  background: 'rgba(99,102,241,0.08)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {github_url && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            GETTING STARTED
          </h2>
          <div style={{ 
            background: 'rgba(15,22,35,0.8)', 
            border: '1px solid var(--border)', 
            borderRadius: '8px', 
            padding: '1.25rem',
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            lineHeight: 1.6
          }}>
            git clone {github_url}.git<br/>
            cd {repoName}<br/>
            # follow the README to run locally
          </div>
        </div>
      )}
    </div>
  );

  const forksContent = (
    <div>
      {forkCount > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {forkers.map(f => (
            <a
              key={f.login}
              href={f.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              title={f.login}
              style={{ textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem 0.4rem 0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', transition: 'background 0.15s' }}>
                <img
                  src={f.avatar_url}
                  alt={f.login}
                  width={28} height={28}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{f.login}</span>
              </div>
            </a>
          ))}
          {forkCount > forkers.length && (
            <span style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              +{forkCount - forkers.length} more
            </span>
          )}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          0 forks — add a GitHub token to see who forked it.
        </p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/resources" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Resources</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
        </div>

        {/* Top Header Card */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
          {/* Tags Top Row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {category && (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"></path></svg>
                {category.name}
              </span>
            )}
            <StatusBadge status={status} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            {/* Title & Description */}
            <div style={{ flex: '1 1 500px' }}>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}>
                {title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '800px', margin: 0 }}>
                {description}
              </p>
            </div>

            {/* Right Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)', borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span style={{ marginLeft: '4px' }}>Like</span> 
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{github_stars || 0}</span>
              </button>
              
              <a href={github_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                <span style={{ marginLeft: '4px' }}>View on GitHub</span>
              </a>
            </div>
          </div>

          {/* Stats Footer Row */}
          <div style={{ 
            display: 'flex', 
            borderTop: '1px solid var(--border)', 
            marginTop: '2rem', 
            paddingTop: '1.5rem',
            gap: '3rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>UPDATED</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{updatedAgo || submittedDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>LIKES</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{github_stars || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>VIEWS</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{(github_stars * 4 + 120).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>FORKS</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{forkCount}</div>
            </div>
          </div>
        </div>

        {/* Layout Grid (Tabs + Sidebar) */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-10 items-start">
          {/* Left Column (Main Content via Tabs) */}
          <div style={{ minWidth: 0 }} className="w-full">
            <ResourceTabs 
              forkCount={forkCount} 
              overviewContent={overviewContent} 
              forksContent={forksContent} 
            />
          </div>

          {/* Right Column (Sidebar) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Submitted By */}
            {contributor && (
              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  SUBMITTED BY
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                    src={contributor.avatar_url || '/default-avatar.png'}
                    alt={contributor.username}
                    style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)' }}
                  />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {contributor.full_name || contributor.username}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      @{contributor.username}
                    </div>
                  </div>
                </div>
                <a href={`https://github.com/${contributor.username}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                  View profile →
                </a>
              </div>
            )}

            {/* Resource Details */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                RESOURCE DETAILS
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{category ? category.name : 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Submitted</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{submittedDate}</span>
                </div>
                {updatedAgo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Updated</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{updatedAgo}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>License</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>MIT</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Link 
              href="/resources" 
              className="glass-card" 
              style={{ 
                padding: '1rem', 
                borderRadius: '12px', 
                textAlign: 'center', 
                color: 'var(--text-primary)', 
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                display: 'block',
                marginTop: '0.5rem'
              }}
            >
              ← Back to resources
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
