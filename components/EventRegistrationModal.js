import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EventRegistrationModal({ meeting, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interested: 'yes',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || user.user_metadata?.user_name || prev.name,
          email: user.email || prev.email,
        }));
      }
    }
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: meeting.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to register. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', maxWidth: '380px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Registration Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Thank you for registering for <strong>{meeting.title}</strong>. A confirmation email has been sent to {formData.email}.
            </p>
            <button onClick={onClose} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Close Window
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Register for Events</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.8rem', lineHeight: '1.3' }}>
              Join our community and stay updated on AI workshops.
            </p>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* Interested Radio */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Are you interested in joining the community meets? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="interested" 
                      value="yes" 
                      checked={formData.interested === 'yes'}
                      onChange={handleChange}
                      style={{ accentColor: '#4f46e5', width: '18px', height: '18px' }}
                    />
                    Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="interested" 
                      value="no" 
                      checked={formData.interested === 'no'}
                      onChange={handleChange}
                      style={{ accentColor: '#4f46e5', width: '18px', height: '18px' }}
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '0.7rem', background: loading ? 'rgba(79,70,229,0.5)' : '#1e3a8a', border: '1px solid #3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.25rem', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}
              >
                {loading ? 'Processing...' : 'Submit Registration →'}
              </button>
            </form>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
