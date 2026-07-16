'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CATEGORIES = [
  { icon: '📚', name: 'Public Datasets', slug: 'dataset', desc: 'High-quality datasets for AI research & model training', bg: '#fef2f2', color: '#dc2626', examples: ['HuggingFace', 'Kaggle', 'ImageNet', 'Audio Corpora'] },
  { icon: '💻', name: 'Open GitHub Projects', slug: 'open-repository', desc: 'Open-source repos accelerating AI development', bg: '#f0fdf4', color: '#16a34a', examples: ['LLM Frameworks', 'Agent Tooling', 'Model Implementations'] },
  { icon: '✍️', name: 'Prompt Libraries', slug: 'prompt-library', desc: 'Reusable prompts for consistent AI results', bg: '#eff6ff', color: '#2563eb', examples: ['System Prompts', 'Chain of Thought', 'Few-shot Templates'] },
  { icon: '🔌', name: 'MCP Servers', slug: 'mcp-server', desc: 'Connectors linking AI agents to tools & APIs', bg: '#fdf4ff', color: '#c026d3', examples: ['Database Connectors', 'API Integrations', 'Local Filesystem'] },
  { icon: '🧠', name: 'RAG Templates', slug: 'rag-template', desc: 'Retrieval-Augmented Generation pipelines & examples', bg: '#fefce8', color: '#ca8a04', examples: ['Vector DBs', 'Document Loaders', 'Chunking Strategies'] },
  { icon: '⚙️', name: 'AI Workflows & Automation', slug: 'ai-workflow', desc: 'Reusable automation playbooks for real-world tasks', bg: '#f5f3ff', color: '#7c3aed', examples: ['n8n Workflows', 'LangChain Graphs', 'Zapier + AI'] },
  { icon: '📖', name: 'Documentation & Tutorials', slug: 'documentation', desc: 'Guides & tutorials that make AI accessible', bg: '#fff7ed', color: '#ea580c', examples: ['Beginner Guides', 'Architecture Docs', 'Fine-tuning Tutorials'] },
];

gsap.registerPlugin(ScrollTrigger);

export default function ExploreSection() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = cardsRef.current;
      if (cards.length === 0) return;

      // Set initial state for all cards except the first
      gsap.set(cards.slice(1), { y: typeof window !== 'undefined' ? window.innerHeight : 800, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top+=80',
          end: `+=${cards.length * 100}%`, // Scroll duration
          scrub: true, // Instant scrub feels less stuck than delayed scrub
          pin: true,
        }
      });

      cards.forEach((card, i) => {
        if (i === 0) return;

        const startTime = i - 1; // Start immediately at 0 for the first animation

        // Bring the current card up
        tl.to(card, {
          y: 0, // Land exactly at the top
          opacity: 1,
          duration: 1,
          ease: 'none',
        }, startTime);

        // Hide and shrink the immediate previous card
        tl.to(cards[i - 1], {
          scale: 0.9, // Shrink slightly
          opacity: 0, // Fade out completely as requested
          y: -20, // Push up slightly
          duration: 1,
          ease: 'none',
        }, startTime);
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup GSAP animations on unmount
  }, []);

  return (
    <section className="section" style={{ paddingTop: '4rem', paddingBottom: '3rem', overflow: 'hidden' }}>
      <div className="container" ref={containerRef} style={{ position: 'relative', height: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            What We Explore
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            7 categories of open AI resources for the community
          </p>
        </div>

        <div style={{ position: 'relative', height: '350px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.slug}
              ref={(el) => (cardsRef.current[idx] = el)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                zIndex: idx + 1,
                transformOrigin: 'top center',
                willChange: 'transform, opacity',
              }}
            >
              <Link href={`/resources?category=${cat.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: 80, height: 80, flexShrink: 0,
                  background: cat.bg || 'rgba(99,102,241,0.12)',
                  border: `1px solid ${cat.color || 'rgba(99,102,241,0.2)'}`,
                  borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem',
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
                    {cat.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    {cat.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {cat.examples.map(ex => (
                      <span key={ex} style={{ background: 'var(--bg-default, #f8fafc)', border: '1px solid var(--border)', padding: '0.35rem 0.85rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
