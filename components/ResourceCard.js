"use client";

import Link from 'next/link';

const categoryColors = {
  'mcp-server': { from: '#6366f1', to: '#8b5cf6' },
  'dataset': { from: '#06b6d4', to: '#0891b2' },
  'rag-template': { from: '#10b981', to: '#059669' },
  'prompt-library': { from: '#f59e0b', to: '#d97706' },
  'ai-workflow': { from: '#ec4899', to: '#db2777' },
  'open-repository': { from: '#3b82f6', to: '#2563eb' },
  'documentation': { from: '#8b5cf6', to: '#7c3aed' },
};

export default function ResourceCard({ resource, variant = 'light' }) {
  const {
    title,
    slug,
    description,
    github_stars,
    github_language,
    github_last_updated,
    status,
    use_case,
    category,
    contributor,
    tags = [],
  } = resource;

  const colors = categoryColors[category?.slug] || { from: '#6366f1', to: '#8b5cf6' };
  const isFeatured = status === 'FEATURED';

  const timeAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  if (variant === 'minimal') {
    return (
      <Link href={`/resources/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <article
          style={{
            padding: '1.25rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            transition: 'border-color 0.2s ease-in-out',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          {/* Title */}
          <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'monospace', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            <span style={{ color: '#6b7280', fontWeight: 500 }}>
              {contributor?.username || 'anonymous'}/
            </span>
            <span style={{ color: '#111827', fontWeight: 600 }}>
              {title}
            </span>
          </h3>

          {/* Description */}
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description || use_case}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.25rem' }}>
              {tags.slice(0, 3).map(({ tag }) => (
                <span key={tag.id} style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: '#f3f4f6',
                  color: '#4b5563',
                }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/resources/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        className="glass-card"
        style={{
          padding: '1.25rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          outline: isFeatured ? `1.5px solid #6366f1` : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Featured glow top bar */}
        {isFeatured && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
          }} />
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
            {/* Category icon pill */}
            {category && (
              <span style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${colors.from}22, ${colors.to}22)`,
                color: colors.from,
                border: `1px solid ${colors.from}44`,
                whiteSpace: 'nowrap',
              }}>
                {category.icon} {category.name}
              </span>
            )}
          </div>

          {/* Stars */}
          {github_stars > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {github_stars.toLocaleString()}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          color: 'var(--text-primary)',
          fontSize: '1rem',
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
          fontFamily: 'var(--font-display)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.82rem',
          lineHeight: 1.55,
          margin: 0,
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
          {description || use_case}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map(({ tag }) => (
              <span key={tag.id} style={{
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 500,
                background: 'rgba(99,102,241,0.1)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0.15rem 0' }}>
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.65rem',
          marginTop: 'auto',
          gap: '0.5rem',
        }}>
          {/* Contributor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {contributor?.avatar_url && (
              <img src={contributor.avatar_url} alt={contributor.username} style={{ width: 18, height: 18, borderRadius: '50%' }} />
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {contributor?.username || 'Anonymous'}
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            {github_language && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: github_language === 'Python' ? '#3572A5' : github_language === 'TypeScript' ? '#3178c6' : '#6366f1',
                  display: 'inline-block',
                }} />
                {github_language}
              </span>
            )}
            {github_last_updated && <span>{timeAgo(github_last_updated)}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
