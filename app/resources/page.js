'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ResourceListItem from '@/components/ResourceListItem';

const ICONS = {
  all: <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97706" stroke="none"><path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4-2.4 7.6-2.4-7.6-7.6-2.4 7.6-2.4z"/></svg>,
  dataset: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  'open-repository': <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>,
  'prompt-library': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  'mcp-server': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
  'rag-template': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M4.93 4.93l14.14 14.14"/><path d="M2 12h20"/><path d="M4.93 19.07L19.07 4.93"/></svg>,
  'ai-workflow': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  documentation: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
};

const CATEGORIES = [
  { slug: 'all', name: 'All resources' },
  { slug: 'dataset', name: 'Datasets' },
  { slug: 'open-repository', name: 'GitHub Projects' },
  { slug: 'prompt-library', name: 'Prompt Libraries' },
  { slug: 'mcp-server', name: 'MCP Servers' },
  { slug: 'rag-template', name: 'RAG Templates' },
  { slug: 'ai-workflow', name: 'AI Workflows' },
  { slug: 'documentation', name: 'Documentation' },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 12;

  const [categoryCounts, setCategoryCounts] = useState({});
  const [tagCounts, setTagCounts] = useState({});
  const [globalTotal, setGlobalTotal] = useState(0);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, 
        category, 
        sort: 'newest',
        page: String(page),
        limit: String(PER_PAGE),
      });
      if (selectedTag) {
        params.set('search', selectedTag);
      }

      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, page, selectedTag]);

  const fetchAggregations = useCallback(async () => {
    try {
      const res = await fetch('/api/resources/aggregations');
      const data = await res.json();
      setCategoryCounts(data.categoryCounts || {});
      setTagCounts(data.tagCounts || {});
      setGlobalTotal(data.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);
  useEffect(() => { fetchAggregations(); }, [fetchAggregations]);
  
  useEffect(() => { setPage(1); }, [search, category, selectedTag]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '3rem', paddingBottom: '5rem', background: '#FCFBF9' }}>
      <style>{`
        .resources-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 2.5rem;
        }
        .header-layout {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3rem;
          gap: 1.5rem;
        }
        .search-bar {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (max-width: 1024px) {
          .resources-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 768px) {
          .header-layout {
            flex-direction: column;
            margin-bottom: 1.5rem;
          }
        }
        @media (max-width: 480px) {
          .container {
            padding: 0 1rem !important;
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Top Header */}
        <div className="header-layout">
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#1C1917',
              marginBottom: '0.25rem',
            }}>
              Resources
            </h1>
            <p style={{ color: '#57534E', fontSize: '0.85rem', fontWeight: 400, margin: 0 }}>
              {globalTotal} open-source AI resources from the Madurai AI community
            </p>
          </div>
          <Link href="/contribute" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#FFFFFF',
              border: '1px solid #E7E5E4',
              color: '#1C1917',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <span style={{ color: '#D97706', fontWeight: 600 }}>+</span> Submit a resource
            </button>
          </Link>
        </div>

        {/* 2-Column Layout */}
        <div className="resources-layout">
          
          {/* Sidebar */}
          <aside>
            {/* Categories */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: 600, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                CATEGORIES
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {CATEGORIES.map(({ slug, name }) => {
                  const isActive = category === slug;
                  const count = slug === 'all' ? globalTotal : (categoryCounts[slug] || 0);
                  const icon = ICONS[slug] || ICONS['documentation'];
                  
                  return (
                    <button
                      key={slug}
                      onClick={() => { setCategory(slug); setSelectedTag(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: isActive ? '#1C1917' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#57534E',
                        fontWeight: isActive ? 500 : 400,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F5F5F4'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          color: isActive ? (slug === 'all' ? '#D97706' : '#FFFFFF') : '#A8A29E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {icon}
                        </span>
                        {name}
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: isActive ? '#A8A29E' : '#D6D3D1',
                        fontWeight: isActive ? 500 : 400
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.65rem', fontWeight: 600, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  POPULAR TAGS
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {popularTags.map(([tag, count]) => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(isActive ? null : tag);
                          if (!isActive) setCategory('all');
                        }}
                        style={{
                          background: isActive ? '#1C1917' : '#FFFFFF',
                          color: isActive ? '#FFFFFF' : '#57534E',
                          border: `1px solid ${isActive ? '#1C1917' : '#E7E5E4'}`,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.15s',
                          boxShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.01)'
                        }}
                      >
                        {tag} <span style={{ color: isActive ? '#A8A29E' : '#D6D3D1' }}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main>
            {/* Search Bar Container */}
            <div className="search-bar">
              <svg width="15" height="15" fill="none" stroke="#A8A29E" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Filter by name, tag, use case..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedTag(null); }}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  flex: '1 1 150px',
                  minWidth: '150px',
                  padding: '0 0.5rem',
                  fontSize: '0.85rem',
                  color: '#1C1917',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#A8A29E', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {total} of {globalTotal}
              </span>
            </div>

            {/* List */}
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: '8px', 
              border: '1px solid #E7E5E4',
              overflow: 'hidden'
            }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: '1.5rem', borderBottom: '1px solid #F5F5F4', display: 'flex', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, background: '#F5F5F4', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ width: '40%', height: 16, background: '#F5F5F4', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '80%', height: 14, background: '#F5F5F4', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                    </div>
                  </div>
                ))
              ) : resources.length > 0 ? (
                <div>
                  {resources.map((resource) => (
                    <ResourceListItem key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#D6D3D1' }}>🔍</div>
                  <h3 style={{ color: '#1C1917', fontWeight: 600, marginBottom: '0.5rem' }}>No resources found</h3>
                  <p style={{ color: '#78716C', fontSize: '0.85rem' }}>Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 500,
                    border: '1px solid #E7E5E4', background: '#FFFFFF', borderRadius: 6,
                    opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Prev
                </button>
                <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 500, color: '#57534E' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 500,
                    border: '1px solid #E7E5E4', background: '#FFFFFF', borderRadius: 6,
                    opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
