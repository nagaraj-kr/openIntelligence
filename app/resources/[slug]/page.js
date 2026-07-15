import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StatusBadge from '@/components/StatusBadge';
import { parseGitHubUrl } from '@/lib/github';

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

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/resources" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Resources</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
        </div>

        {/* Main card */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {category && (
                <span style={{
                  padding: '0.25rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)',
                }}>
                  {category.icon} {category.name}
                </span>
              )}
              <StatusBadge status={status} />
            </div>

            <a
              href={github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>

          {/* Description */}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {description}
          </p>

          {/* GitHub Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
            {github_stars > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" fill="#fbbf24" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{github_stars.toLocaleString()}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>stars</span>
              </div>
            )}
            {github_language && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem' }}>{github_language}</span>
              </div>
            )}
            {updatedAgo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="13" height="13" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Updated {updatedAgo}</span>
              </div>
            )}
          </div>

          {/* Use Case */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              💡 Use Case
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, padding: '1rem', background: 'rgba(6,182,212,0.05)', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.15)' }}>
              {use_case}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' }}>
                🏷️ Tags
              </h2>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/resources?search=${tag.name}`}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      background: 'rgba(99,102,241,0.1)',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(99,102,241,0.25)',
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
        </div>

        {/* Contributor card */}
        {contributor && (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img
              src={contributor.avatar_url || '/default-avatar.png'}
              alt={contributor.username}
              style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Submitted by
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                {contributor.full_name || contributor.username}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{contributor.username}</div>
              {contributor.bio && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>{contributor.bio}</div>
              )}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              <div>Submitted</div>
              <div>{new Date(created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        )}

        {/* ── GitHub Forkers ── */}
        {forkCount > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-display)', margin: 0 }}>
                🍴 Forked by the Community
              </h2>
              <span style={{ padding: '0.2rem 0.7rem', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {forkCount} fork{forkCount !== 1 ? 's' : ''} total
              </span>
            </div>

            {forkers.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {forkers.map(f => (
                  <a
                    key={f.login}
                    href={f.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={f.login}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.3rem 0.7rem 0.3rem 0.3rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', transition: 'background 0.15s' }}>
                      <img
                        src={f.avatar_url}
                        alt={f.login}
                        width={22} height={22}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 500 }}>{f.login}</span>
                    </div>
                  </a>
                ))}
                {forkCount > forkers.length && (
                  <span style={{ padding: '0.3rem 0.7rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    +{forkCount - forkers.length} more
                  </span>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                {forkCount} fork{forkCount !== 1 ? 's' : ''} — add a GitHub token to see who forked it.
              </p>
            )}
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/resources" className="btn-outline" style={{ fontSize: '0.85rem' }}>
            ← Back to Resources
          </Link>
        </div>
      </div>
    </div>
  );
}
