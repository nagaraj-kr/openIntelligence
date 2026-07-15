'use client';

import { useState, useEffect, useCallback } from 'react';
import ResourceCard from '@/components/ResourceCard';

const CATEGORIES = [
  { slug: 'all',          name: 'All',                     icon: '🔍' },
  { slug: 'dataset',      name: 'Datasets',                icon: '📚' },
  { slug: 'open-repository', name: 'Open GitHub Projects', icon: '💻' },
  { slug: 'prompt-library',  name: 'Prompt Libraries',     icon: '✍️' },
  { slug: 'mcp-server',   name: 'MCP Servers',             icon: '🔌' },
  { slug: 'rag-template', name: 'RAG Templates',           icon: '🧠' },
  { slug: 'ai-workflow',  name: 'AI Workflows',            icon: '⚙️' },
  { slug: 'documentation', name: 'Documentation',          icon: '📖' },
];

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'stars',   label: 'Most Stars'   },
  { value: 'featured', label: 'Featured'    },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('all');
  const [sort, setSort]           = useState('newest');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const PER_PAGE = 12;

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, category, sort,
        page: String(page),
        limit: String(PER_PAGE),
      });
      const res  = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);
  useEffect(() => { setPage(1); }, [search, category, sort]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
          }}>
            Browse <span className="gradient-text">Resources</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {total} open-source AI resources from the community
          </p>
        </div>

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <svg
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24"
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(({ slug, name, icon }) => (
            <button
              key={slug}
              onClick={() => setCategory(slug)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: category === slug ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderColor: category === slug ? '#6366f1' : 'var(--border)',
                color: category === slug ? '#818cf8' : 'var(--text-secondary)',
              }}
            >
              {icon} {name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ height: '220px', padding: '1.25rem' }}>
                <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '8px', height: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span key={`ellipsis-${p}`} style={{ color: 'var(--text-muted)', padding: '0.45rem 0.5rem', fontSize: '0.85rem' }}>...</span>
                      )}
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={page === p ? 'btn-primary' : 'btn-outline'}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', minWidth: '40px' }}
                      >
                        {p}
                      </button>
                    </>
                  ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-outline"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', opacity: page === totalPages ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              No resources found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {search ? `No results for "${search}" in ${category === 'all' ? 'all categories' : category}` : 'No resources in this category yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
