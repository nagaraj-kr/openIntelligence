'use client';

import Link from 'next/link';

const footerLinks = {
  Explore: [
    { href: '/resources', label: 'Browse Resources' },
    { href: '/meetings', label: 'Community Meetings' },
    { href: '/submit', label: 'Submit a Resource' },
  ],
  Categories: [
    { href: '/resources?category=mcp-server', label: 'MCP Servers' },
    { href: '/resources?category=dataset', label: 'Datasets' },
    { href: '/resources?category=rag-template', label: 'RAG Templates' },
    { href: '/resources?category=prompt-library', label: 'Prompt Libraries' },
  ],
  Community: [
    { href: 'https://github.com', label: 'GitHub', external: true },
    { href: '/profile', label: 'My Profile' },
    { href: '/admin', label: 'Admin Panel' },
  ],
};

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ padding: '3rem 1.5rem 2rem' }}>

        {/* Top section */}
        <style>{`
          .footer-top-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            margin-bottom: 2.5rem;
          }
          .footer-brand {
            grid-column: span 2;
          }
          @media (min-width: 640px) {
            .footer-top-grid {
              grid-template-columns: 2fr 1fr 1fr 1fr;
            }
            .footer-brand {
              grid-column: span 1;
            }
          }
          .footer-bottom-bar {
            border-top: 1px solid var(--border);
            padding-top: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            text-align: center;
          }
          .footer-bottom-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }
          @media (min-width: 640px) {
            .footer-bottom-bar {
              flex-direction: row;
              justify-content: space-between;
              text-align: left;
            }
            .footer-bottom-info {
              flex-direction: row;
              gap: 1rem;
            }
          }
        `}</style>
        <div className="footer-top-grid">

          {/* Brand */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem', marginTop: '12px' }}>
              <div style={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 800, color: 'white',
              }}>
                OI
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Open<span style={{ color: '#6366f1' }}>Intelligence</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '240px' }}>
              Building AI commons — open and free. A platform by{' '}
              <span style={{ color: 'var(--accent-primary)' }}>PiBi Foundation</span> for the Madurai AI Community.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {group}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map(({ href, label, external }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      style={{
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.target.style.color = '#6366f1'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            © {new Date().getFullYear()} PiBi Foundation · Open Intelligence Hub
          </p>
          <div className="footer-bottom-info">
            <span style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              background: 'rgba(16,185,129,0.1)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.2)',
              whiteSpace: 'nowrap',
            }}>
              Open Source
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Built with ❤️ for Madurai AI Community
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
