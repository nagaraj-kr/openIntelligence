'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  { id: '', slug: '',              name: 'Select a category...',       icon: '' },
  { slug: 'dataset',         name: 'Public Dataset',              icon: '📚' },
  { slug: 'open-repository', name: 'Open GitHub Project',         icon: '💻' },
  { slug: 'prompt-library',  name: 'Prompt Library',              icon: '✍️' },
  { slug: 'mcp-server',      name: 'MCP Server',                  icon: '🔌' },
  { slug: 'rag-template',    name: 'RAG Template',                icon: '🧠' },
  { slug: 'ai-workflow',     name: 'AI Workflow & Automation',    icon: '⚙️' },
  { slug: 'documentation',   name: 'Documentation & Tutorial',    icon: '📖' },
];

const POPULAR_TAGS = ['Python', 'TypeScript', 'LangChain', 'Claude', 'OpenAI', 'Ollama', 'OpenTelemetry', 'RAG', 'Agents', 'FastAPI', 'Hugging Face', 'LlamaIndex'];

export default function SubmitPage() {
  const router  = useRouter();
  const supabase = createClient();

  const [user, setUser]               = useState(null);
  const [githubUrl, setGithubUrl]     = useState('');
  const [fetching, setFetching]       = useState(false);
  const [fetchError, setFetchError]   = useState('');
  const [preview, setPreview]         = useState(null);
  const [categorySlug, setCategorySlug] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag]     = useState('');
  const [useCase, setUseCase]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  // Fetch GitHub repo info
  const handleFetch = async () => {
    if (!githubUrl.trim()) return;
    setFetching(true);
    setFetchError('');
    setPreview(null);
    try {
      const res  = await fetch(`/api/github/fetch?url=${encodeURIComponent(githubUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setPreview(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTag('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview || !categorySlug || !useCase.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/resources/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          github_url:   githubUrl,
          categorySlug,
          tags:         selectedTags,
          use_case:     useCase,
          ...preview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>
            Resource Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your resource is now pending admin review. You'll see it in your profile once approved.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/profile')} className="btn-primary">View My Submissions</button>
            <button onClick={() => { setSuccess(false); setPreview(null); setGithubUrl(''); setUseCase(''); setSelectedTags([]); }} className="btn-outline">Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Submit a <span className="gradient-text">Resource</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Share an open-source AI resource with the Madurai community. GitHub URL → auto-fetch details.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1: GitHub URL */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>1</span>
              GitHub Repository URL
            </h2>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="url"
                placeholder="https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => { setGithubUrl(e.target.value); setPreview(null); setFetchError(''); }}
                className="input-field"
                style={{ flex: 1 }}
                required
              />
              <button
                type="button"
                onClick={handleFetch}
                disabled={!githubUrl.trim() || fetching}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap', opacity: (!githubUrl.trim() || fetching) ? 0.6 : 1 }}
              >
                {fetching ? '⏳ Fetching...' : '🔍 Fetch'}
              </button>
            </div>

            {fetchError && (
              <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.5rem' }}>⚠️ {fetchError}</p>
            )}

            {/* Preview */}
            {preview && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{preview.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>{preview.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {preview.github_stars > 0 && <span>⭐ {preview.github_stars}</span>}
                    {preview.github_language && <span>💻 {preview.github_language}</span>}
                  </div>
                </div>
                <p style={{ color: '#34d399', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>✅ Repository details auto-filled</p>
              </div>
            )}
          </div>

          {/* Step 2: Category */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>2</span>
              Category
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {CATEGORIES.slice(1).map(({ slug, name, icon }) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setCategorySlug(slug)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: categorySlug === slug ? '#6366f1' : 'var(--border)',
                    background: categorySlug === slug ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: categorySlug === slug ? '#818cf8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  {icon} {name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Tags */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>3</span>
              Tags (optional)
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: selectedTags.includes(tag) ? '#6366f1' : 'var(--border)',
                    background: selectedTags.includes(tag) ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: selectedTags.includes(tag) ? '#818cf8' : 'var(--text-muted)',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={addCustomTag} className="btn-outline" style={{ fontSize: '0.82rem' }}>Add</button>
            </div>
          </div>

          {/* Step 4: Use Case */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>4</span>
              How can others use this?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>Describe the use case — who benefits, how to get started, what problems it solves.</p>
            <textarea
              placeholder="e.g. This MCP server connects Claude to your PostgreSQL database, enabling natural language queries. Ideal for developers who want to build AI-powered database interfaces without writing SQL..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="input-field"
              style={{ minHeight: '120px', resize: 'vertical' }}
              required
            />
          </div>

          {submitError && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={!preview || !categorySlug || !useCase.trim() || submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', opacity: (!preview || !categorySlug || !useCase.trim() || submitting) ? 0.5 : 1 }}
          >
            {submitting ? '⏳ Submitting...' : '🚀 Submit Resource'}
          </button>
        </form>
      </div>
    </div>
  );
}
