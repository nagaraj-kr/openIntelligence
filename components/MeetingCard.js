import Link from 'next/link';

export default function MeetingCard({ meeting, isPast = false }) {
  const {
    title, description, date, venue, registration_link,
    status, outcome_title, outcome_summary, attendees_count,
  } = meeting;

  // Guard against null arrays from pre-migration DB rows
  const tags   = Array.isArray(meeting.tags)   ? meeting.tags   : [];
  const photos = Array.isArray(meeting.photos) ? meeting.photos : [];

  const isCompleted = status === 'COMPLETED' || isPast;
  const meetingDate = new Date(date);
  const day   = meetingDate.toLocaleDateString('en-IN', { day: '2-digit' });
  const month = meetingDate.toLocaleDateString('en-IN', { month: 'short' });
  const year  = meetingDate.getFullYear();
  const timeStr = meetingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let finalDescription = description;
  let displayTime = timeStr;
  
  if (finalDescription) {
    const timingMatch = finalDescription.match(/\n\nTiming:\s*(.*)/);
    if (timingMatch) {
      displayTime = timingMatch[1];
      finalDescription = finalDescription.replace(timingMatch[0], '');
    }
  }

  return (
    <article
      className="glass-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        opacity: isCompleted ? 0.9 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top row: date block + content */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Date block */}
        <div style={{
          minWidth: '64px', textAlign: 'center',
          background: isCompleted
            ? 'rgba(71,85,105,0.18)'
            : 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))',
          border: `1px solid ${isCompleted ? 'rgba(71,85,105,0.3)' : 'rgba(99,102,241,0.3)'}`,
          borderRadius: '12px',
          padding: '0.6rem 0.5rem',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isCompleted ? 'var(--text-muted)' : '#818cf8', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
            {day}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isCompleted ? 'var(--text-muted)' : 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {month}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {year}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '180px' }}>

          {/* Status + attendees */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '0.15rem 0.55rem', borderRadius: '20px',
              fontSize: '0.68rem', fontWeight: 600,
              background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.12)',
              color:      isCompleted ? '#34d399' : '#818cf8',
              border:     `1px solid ${isCompleted ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isCompleted ? '#34d399' : '#818cf8',
                display: 'inline-block',
                animation: isCompleted ? 'none' : 'pulse 2s infinite',
              }} />
              {isCompleted ? '✅ Completed' : '📅 Upcoming'}
            </span>

            {attendees_count && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                👥 {attendees_count} attended
              </span>
            )}
          </div>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
            {title}
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {finalDescription}
          </p>

          {/* Meta: time + venue */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {displayTime}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {venue}
            </span>
          </div>

          {/* Topics / Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '0.1rem' }}>
              {tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: '0.65rem', padding: '2px 9px', borderRadius: '20px',
                  background: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                  border: '1px solid rgba(6,182,212,0.2)', fontWeight: 600,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Register CTA — upcoming only */}
          {!isCompleted && registration_link && (
            <Link
              href={registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: 'fit-content', fontSize: '0.8rem', padding: '0.45rem 1.1rem', marginTop: '0.25rem' }}
            >
              Register Now →
            </Link>
          )}
        </div>
      </div>

      {/* ── Outcome section — completed events only ── */}
      {isCompleted && (outcome_title || outcome_summary) && (
        <div style={{
          borderTop: '1px solid rgba(52,211,153,0.15)',
          paddingTop: '1rem',
          background: 'rgba(16,185,129,0.04)',
          borderRadius: '0 0 12px 12px',
          margin: '0 -1.5rem -1.5rem',
          padding: '1rem 1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem' }}>🎯</span>
            <h4 style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem', margin: 0, fontFamily: 'var(--font-display)' }}>
              Session Outcome
            </h4>
          </div>
          {outcome_title && (
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.4rem' }}>
              {outcome_title}
            </p>
          )}
          {outcome_summary && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
              {outcome_summary}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
