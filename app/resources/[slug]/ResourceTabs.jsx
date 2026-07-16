"use client";

import { useState } from 'react';

export default function ResourceTabs({ forkCount = 0, overviewContent, forksContent }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'forks', label: `Forks (${forkCount})` },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 0.5rem',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '300px' }}>
        {activeTab === 'overview' && overviewContent}
        {activeTab === 'forks' && forksContent}
        {activeTab === 'activity' && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent activity to display.
          </div>
        )}
      </div>
    </div>
  );
}
