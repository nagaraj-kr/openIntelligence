'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import EventRegistrationModal from './EventRegistrationModal';

export default function HeroEventCard({ meeting, isPast = false }) {
  const { title, description, date, venue, registration_link, photos, cover_image, outcome_title, outcome_summary, attendees_count } = meeting;
  const coverPhoto = cover_image || null;

  const meetingDate = new Date(date);
  const dayStr = meetingDate.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' });
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

  const mMonth = meetingDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const mDay = meetingDate.getDate();
  const shortDateStr = `${meetingDate.toLocaleDateString('en-US', { month: 'short' })} ${mDay}, ${meetingDate.getFullYear()}`;
  const fullDateStr = meetingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const tags = Array.isArray(meeting.tags) ? meeting.tags : [];

  // Countdown Logic
  const calculateTimeLeft = () => {
    const difference = +new Date(date) - +new Date();
    if (difference > 0) {
      return {
        expired: false,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { expired: true };
  };

  const [timeLeft, setTimeLeft] = useState({ expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  const format = (num) => String(num || 0).padStart(2, '0');

  const Box = ({ value, label }) => (
    <div style={{ background: 'rgba(5, 8, 20, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '55px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{format(value)}</span>
      <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginTop: '4px', fontWeight: 600 }}>{label}</span>
    </div>
  );

  if (isPast) {
    return (
      <>
        {/* Past Session Card UI */}
        <div style={{ display: 'flex', flexDirection: 'row', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', flexWrap: 'wrap' }}>
          {/* Image Side */}
          <div style={{ width: '100%', maxWidth: '180px', flex: '0 0 auto', background: '#ffffff', display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
              {coverPhoto ? (
                   <img src={coverPhoto} alt={title} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '16px 0 0 16px' }} />
              ) : (
                 <div style={{ width: '100%', minHeight: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px 0 0 16px' }}>
                   <span style={{ color: '#94a3b8' }}>No image</span>
                 </div>
              )}
              
              {/* Date Badge */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ffffff', borderRadius: '6px', padding: '4px 6px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', lineHeight: 1, marginBottom: '2px' }}>{mMonth}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{mDay}</div>
              </div>

              {/* Attendees Badge */}
              {attendees_count && (
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(30,41,59,0.85)', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  {attendees_count}
                </div>
              )}
            </div>
          </div>

          {/* Content Side */}
          <div style={{ padding: '1.5rem', flex: '999 1 320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>Completed</span>
              {(outcome_title || outcome_summary) && (
                <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>Outcome published</span>
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>{title}</h3>
            
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {outcome_summary || finalDescription}
            </p>

            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {shortDateStr}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {venue}
                </span>
              </div>
              <Link href={`/meetings/${meeting.id}`} style={{ color: '#ea580c', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View recap →
              </Link>
            </div>
          </div>
        </div>

      </>
    );
  }

  // Original Upcoming Session UI
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 'clamp(1rem, 3vw, 1.5rem)',
      padding: 'clamp(1.25rem, 4vw, 1.75rem)',
      margin: '0 auto',
      maxWidth: '1100px',
      width: '100%',
      background: 'linear-gradient(135deg, rgba(13,17,28,0.9), rgba(15,23,42,0.9))',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
    }}>
      {/* Left Content */}
      <div style={{ 
        flex: 1, 
        minWidth: 'min(100%, 320px)', 
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#fbbf24' }}>✨</span> Featured
          </span>
          <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(16,185,129,0.3)' }}>
            Limited Seats
          </span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          {title}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
          {finalDescription}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontSize: '0.9rem' }}>📅</span> {dayStr}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontSize: '0.9rem' }}>⏰</span> {displayTime}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ fontSize: '0.9rem' }}>📍</span> {venue}
          </div>
        </div>

        {/* Countdown */}
        {isClient && !timeLeft.expired && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {timeLeft.days !== undefined && (
              <>
                <Box value={timeLeft.days} label="Days" />
                <Box value={timeLeft.hours} label="Hours" />
                <Box value={timeLeft.minutes} label="Mins" />
                <Box value={timeLeft.seconds} label="Secs" />
              </>
            )}
          </div>
        )}

        {registration_link ? (
          <Link href={registration_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', padding: '0.8rem 1.5rem', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', alignItems: 'center', gap: '6px' }}>
            Register (External) →
          </Link>
        ) : (
          <>
            <button onClick={() => setShowRegistration(true)} style={{ display: 'inline-flex', padding: '0.8rem 1.5rem', background: '#4f46e5', border: '1px solid #6366f1', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}>
              Register Free →
            </button>
            {showRegistration && (
              <EventRegistrationModal meeting={meeting} onClose={() => setShowRegistration(false)} />
            )}
          </>
        )}
      </div>

      {/* Right Image/Banner */}
      <div style={{ 
        flex: 1, 
        minWidth: 'min(100%, 320px)', 
        background: 'rgba(5, 8, 20, 0.5)', 
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '16px',
        overflow: 'hidden',
        minHeight: '200px',
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)'
      }}>
        {coverPhoto ? (
          <>
            <img src={coverPhoto} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, filter: 'blur(20px)', opacity: 0.4, transform: 'scale(1.1)' }} />
            <img src={coverPhoto} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0, padding: '1rem', zIndex: 1 }} />
          </>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', width: '100%' }}>
            <h3 style={{ color: '#818cf8', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No cover image available</p>
          </div>
        )}
      </div>
    </div>
  );
}
