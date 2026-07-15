'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import EventRegistrationModal from './EventRegistrationModal';

export default function HeroEventCard({ meeting, isPast = false }) {
  const { title, description, date, venue, registration_link, photos, cover_image } = meeting;
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
        {!isPast && isClient && !timeLeft.expired && (
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

        {isPast ? (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setShowOutcome(true)} style={{ display: 'inline-flex', padding: '0.8rem 1.5rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', alignItems: 'center', gap: '6px' }}>
              View Outcomes
            </button>
            {showOutcome && (() => {
              const modalBgImage = meeting.photos && meeting.photos.length > 0 ? meeting.photos[0] : null;

              return (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(12px)' }} onClick={() => setShowOutcome(false)}>
                  <div
                    className="glass-card"
                    style={{
                      padding: '2rem',
                      borderRadius: '24px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      width: '100%',
                      maxWidth: '650px',
                      background: '#ffffff',
                      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="custom-scrollbar" style={{ maxHeight: 'calc(80vh - 4rem)', overflowY: 'auto' }}>
                      
                      {/* First Card - Image Banner */}
                      <div style={{ 
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                        background: modalBgImage 
                          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${modalBgImage})` 
                          : 'rgba(0,0,0,0.05)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '200px',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}>
                        <h3 style={{ 
                          color: '#ffffff', 
                          fontWeight: 300, 
                          fontSize: '1rem', 
                          margin: 0, 
                          textTransform: 'uppercase', 
                          letterSpacing: '2px',
                          position: 'absolute',
                          top: '16px',
                          left: '16px'
                        }}>Outcome Details</h3>
                      </div>

                      {/* Second Card - Content */}
                      <div style={{ 
                        background: 'rgba(0, 0, 0, 0.02)', 
                        padding: '1.5rem', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        {meeting.outcome_title && <h4 style={{ color: '#059669', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 12px 0', textTransform: 'uppercase' }}>{meeting.outcome_title}</h4>}
                        <div style={{
                          color: '#334155',
                          fontSize: '0.95rem',
                          lineHeight: '1.8',
                          whiteSpace: 'pre-wrap',
                          background: 'rgba(0, 0, 0, 0.04)',
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
                        }}>
                          {meeting.outcome_summary || <span style={{ fontStyle: 'italic', color: '#64748b' }}>Outcome details will be updated soon.</span>}
                        </div>
                      </div>

                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button onClick={() => setShowOutcome(false)} style={{ padding: '0.6rem 1.25rem', background: '#2563eb', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          registration_link ? (
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
          )
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
            {/* Blurred backdrop for premium look regardless of aspect ratio */}
            <img src={coverPhoto} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, filter: 'blur(20px)', opacity: 0.4, transform: 'scale(1.1)' }} />
            {/* Actual contained image */}
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
