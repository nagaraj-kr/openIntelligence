'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CATEGORIES = [
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>, name: 'Public Datasets', slug: 'dataset', desc: 'High-quality datasets for AI research & model training', bg: '#fef2f2', color: '#dc2626', examples: ['HuggingFace', 'Kaggle', 'ImageNet', 'Audio Corpora'] },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, name: 'Open GitHub Projects', slug: 'open-repository', desc: 'Open-source repos accelerating AI development', bg: '#f0fdf4', color: '#16a34a', examples: ['LLM Frameworks', 'Agent Tooling', 'Model Implementations'] },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>, name: 'Prompt Libraries', slug: 'prompt-library', desc: 'Reusable prompts for consistent AI results', bg: '#eff6ff', color: '#2563eb', examples: ['System Prompts', 'Chain of Thought', 'Few-shot Templates'] },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>, name: 'MCP Servers', slug: 'mcp-server', desc: 'Connectors linking AI agents to tools & APIs', bg: '#fdf4ff', color: '#c026d3', examples: ['Database Connectors', 'API Integrations', 'Local Filesystem'] },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>, name: 'RAG Templates', slug: 'rag-template', desc: 'Retrieval-Augmented Generation pipelines & examples', bg: '#fefce8', color: '#ca8a04', examples: ['Vector DBs', 'Document Loaders', 'Chunking Strategies'] },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1"></rect><path d="M6 21V3"></path><path d="M10 17.5 6 21l-4-3.5"></path><path d="M10 10.5 6 7l-4 3.5"></path><path d="M6 14h4a2 2 0 0 0 2-2v-2"></path><rect width="7" height="7" x="14" y="14" rx="1"></rect></svg>, name: 'AI Workflows & Automation', slug: 'ai-workflow', desc: 'Reusable automation playbooks for real-world tasks', bg: '#f5f3ff', color: '#7c3aed', examples: ['n8n Workflows', 'LangChain Graphs', 'Zapier + AI'] },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>, name: 'Documentation & Tutorials', slug: 'documentation', desc: 'Guides & tutorials that make AI accessible', bg: '#fff7ed', color: '#ea580c', examples: ['Beginner Guides', 'Architecture Docs', 'Fine-tuning Tutorials'] },
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

        <style>{`
          .explore-cards-container {
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            height: 480px;
          }
          .explore-card {
            padding: 1.5rem;
          }
          .explore-card-link {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          .explore-card-icon {
            flex-shrink: 0;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            font-size: 2rem;
          }
          .explore-card-title {
            font-size: 1.25rem;
          }
          .explore-card-desc {
            font-size: 0.875rem;
          }
          .explore-card-tag {
            font-size: 0.75rem;
          }
          
          @media (min-width: 640px) {
            .explore-cards-container {
              height: 350px;
            }
            .explore-card {
              padding: 2.5rem;
            }
            .explore-card-link {
              flex-direction: row;
              gap: 1.5rem;
              align-items: center;
            }
            .explore-card-icon {
              width: 80px;
              height: 80px;
              font-size: 2.5rem;
            }
            .explore-card-title {
              font-size: 1.5rem;
            }
            .explore-card-desc {
              font-size: 1rem;
            }
            .explore-card-tag {
              font-size: 0.875rem;
            }
          }
        `}</style>
        
        <div className="explore-cards-container">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.slug}
              ref={(el) => (cardsRef.current[idx] = el)}
              className="explore-card"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                zIndex: idx + 1,
                transformOrigin: 'top center',
                willChange: 'transform, opacity',
              }}
            >
              <Link href={`/resources?category=${cat.slug}`} className="explore-card-link">
                <div 
                  className="explore-card-icon"
                  style={{
                    background: cat.bg || 'rgba(99,102,241,0.12)',
                    border: `1px solid ${cat.color || 'rgba(99,102,241,0.2)'}`,
                    color: cat.color,
                  }}
                >
                  {cat.icon}
                </div>
                <div style={{ flex: 1, width: '100%' }}>
                  <h3 className="explore-card-title" style={{ color: 'var(--text-primary)', fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.2 }}>
                    {cat.name}
                  </h3>
                  <p className="explore-card-desc" style={{ color: 'var(--text-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    {cat.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {cat.examples.map(ex => (
                      <span key={ex} className="explore-card-tag" style={{ background: 'var(--bg-default, #f8fafc)', border: '1px solid var(--border)', padding: '0.35rem 0.85rem', borderRadius: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>
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
