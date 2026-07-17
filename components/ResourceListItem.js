"use client";

import Link from 'next/link';

const ICONS = {
  all: <svg width="18" height="18" viewBox="0 0 24 24" fill="#D97706" stroke="none"><path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z"/></svg>,
  dataset: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  'open-repository': <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>,
  'prompt-library': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  'mcp-server': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
  'rag-template': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M4.93 4.93l14.14 14.14"/><path d="M2 12h20"/><path d="M4.93 19.07L19.07 4.93"/></svg>,
  'ai-workflow': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  documentation: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
};

export default function ResourceListItem({ resource }) {
  const {
    title,
    slug,
    description,
    github_stars,
    github_last_updated,
    use_case,
    category,
    contributor,
    tags = [],
  } = resource;

  const icon = ICONS[category?.slug] || ICONS['documentation'];
  
  // Fake views for the mockup if missing
  const views = Math.floor(Math.random() * 5000) + 100;

  const timeAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  // Base background for tags
  const tagStyle = {
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: 500,
    background: '#FDFBF7',
    color: '#78716C',
    border: '1px solid #F0EBE1',
    whiteSpace: 'nowrap'
  };

  return (
    <Link href={`/resources/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          padding: '1.2rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#FFFFFF',
          borderBottom: '1px solid #F5F5F4',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FCFBF9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
      >
        {/* Left: Category Icon */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#F5F5F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A8A29E'
          }}>
            {icon}
          </div>
        </div>

        {/* Middle: Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {/* Title / Contributor */}
          <h3 style={{
            color: '#1C1917',
            fontSize: '0.9rem',
            fontWeight: 600,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {contributor?.username ? (
              <span style={{ color: '#78716C', fontWeight: 500 }}>{contributor.username}/</span>
            ) : null}
            {title}
          </h3>
          
          {/* Description */}
          <p style={{
            color: '#57534E',
            fontSize: '0.8rem',
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {description || use_case}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
            {category?.name && (
              <span style={tagStyle}>
                {category.name}
              </span>
            )}
            {tags.slice(0, 4).map(({ tag }) => (
              <span key={tag.id} style={tagStyle}>
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Stats */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.3rem',
          color: '#A8A29E',
          fontSize: '0.7rem',
          minWidth: '80px',
          paddingTop: '0.1rem'
        }}>
          {github_stars !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#D97706', fontWeight: 500 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {github_stars}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#A8A29E', fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {views}
          </div>
          {github_last_updated && (
            <div style={{ marginTop: '0.2rem' }}>
              Updated {timeAgo(github_last_updated)}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
