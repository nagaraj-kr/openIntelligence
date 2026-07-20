import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function MeetingRecapPage({ params }) {
  const { id } = await params;
  
  const { data: meeting, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !meeting) {
    notFound();
  }

  const { title, description, date, venue, photos, cover_image, outcome_title, outcome_summary, attendees_count } = meeting;
  const coverPhoto = cover_image || null;

  const meetingDate = new Date(date);
  const displayTime = meetingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let finalDescription = description;
  let finalTime = displayTime;
  
  if (finalDescription) {
    const timingMatch = finalDescription.match(/\n\nTiming:\s*(.*)/);
    if (timingMatch) {
      finalTime = timingMatch[1];
      finalDescription = finalDescription.replace(timingMatch[0], '');
    }
  }

  const mMonth = meetingDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const mDay = meetingDate.getDate();
  const fullDateStr = meetingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const tags = Array.isArray(meeting.tags) ? meeting.tags : [];
  const speakers = Array.isArray(meeting.speakers) ? meeting.speakers : [];

  return (
    <div
      className="recap-page-wrapper"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #05080f 0%, #0b1120 100%)',
        padding: '3rem 1.5rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <style>{`
        .recap-container { display: flex; gap: 3rem; flex-wrap: wrap; align-items: flex-start; }
        .recap-left { flex: 1 1 350px; max-width: 400px; position: sticky; top: 7rem; }
        .recap-right { flex: 999 1 400px; min-width: 0; }
        @media (max-width: 900px) {
          .recap-container { flex-direction: column; gap: 2rem; }
          .recap-left { max-width: 100%; position: static; flex: 1 1 auto; width: 100%; }
          .recap-right { flex: 1 1 auto; width: 100%; }
        }
        @media (max-width: 600px) {
          .recap-page-wrapper { padding: 1.5rem 1rem !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Link href="/meetings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', fontSize: '0.9rem' }}>
          ← Back to Meetings
        </Link>
        
        <div className="recap-container">
          
          {/* Left Column: Image and Details Box */}
          <div className="recap-left">
            
            {/* Cover Image Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)',
              }}
            >
              {coverPhoto ? (
                <img src={coverPhoto} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No Image</div>
              )}
              
              {/* Badges */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '20px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Completed
              </div>

              {attendees_count && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  {attendees_count} attended
                </div>
              )}

              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fb923c', lineHeight: 1, marginBottom: '2px' }}>{mMonth}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{mDay}</div>
              </div>
            </div>



          </div>

          {/* Right Column: Content */}
          <div className="recap-right">
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
              {title}
            </h1>
            
            {/* Meta Details: Date, Time, Venue */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(251, 146, 60, 0.12)', border: '1px solid rgba(251, 146, 60, 0.25)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 600 }}>{fullDateStr}</div>
                </div>
              </div>

              {/* Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.25)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 600 }}>{finalTime}</div>
                </div>
              </div>

              {/* Venue */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.25)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 600 }}>{venue}</div>
                </div>
              </div>
            </div>

            {/* Speakers List under Title */}
            {speakers.length > 0 && (
              <div style={{ marginBottom: '2rem', background: 'rgba(13,17,28,0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 1rem 0' }}>🎤 Speakers</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {speakers.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', whiteSpace: 'pre-wrap' }}>
              {finalDescription}
            </p>

            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '3rem' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {(outcome_summary || outcome_title || (photos && photos.length > 0)) && (
              <div
                style={{
                  marginBottom: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(13,17,28,0.9), rgba(15,23,42,0.9))',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ borderLeft: '4px solid #fb923c', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Outcome</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                    {outcome_title || `Session Outcome`}
                  </h3>
                </div>

                {photos && photos.length > 0 && (
                  <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {photos.map((p, i) => (
                      <img key={i} src={p} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }} alt={`Outcome photo ${i + 1}`} />
                    ))}
                  </div>
                )}
                
                {outcome_summary && (
                  <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {outcome_summary}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}