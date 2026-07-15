// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import StatusBadge from '@/components/StatusBadge';

// const TABS = ['overview', 'pending', 'resources', 'events', 'settings'];

// // ─── Reusable field component ────────────────────────────────────────────────
// function Field({ label, children }) {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//       <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
//       {children}
//     </div>
//   );
// }

// export default function AdminPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [adminUser, setAdminUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');

//   // Data
//   const [stats, setStats] = useState({});
//   const [pending, setPending] = useState([]);
//   const [allResources, setAllResources] = useState([]);
//   const [meetings, setMeetings] = useState([]);

//   // Create/Edit event form
//   const [showEventForm, setShowEventForm] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);
//   const [eventForm, setEventForm] = useState({
//     title: '', description: '', date: '', time: '', venue: '', registration_link: '',
//   });
//   const [savingEvent, setSavingEvent] = useState(false);
//   const [eventError, setEventError] = useState('');

//   // Outcome form (shown for past events)
//   const [showOutcomeForm, setShowOutcomeForm] = useState(false);
//   const [outcomeEvent, setOutcomeEvent] = useState(null);
//   const [outcomeForm, setOutcomeForm] = useState({
//     outcome_title: '', outcome_summary: '', attendees_count: '', tags: '',
//   });
//   const [savingOutcome, setSavingOutcome] = useState(false);

//   // Settings
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [pwLoading, setPwLoading] = useState(false);
//   const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
//   const [showNewPw, setShowNewPw] = useState(false);
//   const [actionLoading, setActionLoading] = useState('');

//   const loadData = useCallback(async () => {
//     const res = await fetch('/api/admin/data');
//     if (!res.ok) return;
//     const data = await res.json();
//     setStats(data.stats || {});
//     setPending(data.pending || []);
//     setAllResources(data.resources || []);
//     setMeetings(data.meetings || []);
//   }, []);

//   useEffect(() => {
//     async function init() {
//       // Check admin via cookie (no Supabase — admin session is completely separate)
//       const res = await fetch('/api/admin/check');
//       const data = await res.json();
//       if (!data.isAdmin) { router.replace('/admin/login'); return; }
//       setAdminUser({ email: data.email });
//       await loadData();
//       setLoading(false);
//     }
//     init();
//   }, []);

//   const handleResourceAction = async (resourceId, action) => {
//     setActionLoading(resourceId + action);
//     await fetch('/api/admin/resources', {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ resourceId, action }),
//     });
//     await loadData();
//     setActionLoading('');
//   };

//   // ── Create / Edit event ────────────────────────────────────────────────────
//   const resetEventForm = () => {
//     setEventForm({ title: '', description: '', date: '', time: '', venue: '', registration_link: '' });
//     setEditingEvent(null);
//     setShowEventForm(false);
//   };

//   const openEditEvent = (meeting) => {
//     const d = new Date(meeting.date);
//     setEventForm({
//       title: meeting.title,
//       description: meeting.description,
//       date: d.toISOString().split('T')[0],
//       time: d.toTimeString().slice(0, 5),
//       venue: meeting.venue,
//       registration_link: meeting.registration_link,
//     });
//     setEditingEvent(meeting);
//     setShowEventForm(true);
//     setShowOutcomeForm(false);
//     setActiveTab('events');
//   };

//   const handleSaveEvent = async (e) => {
//     e.preventDefault();
//     setSavingEvent(true);
//     setEventError('');
//     const dateTime = new Date(`${eventForm.date}T${eventForm.time || '10:00'}`).toISOString();
//     const payload = { ...eventForm, date: dateTime };
//     const url = editingEvent ? `/api/admin/meetings/${editingEvent.id}` : '/api/admin/meetings';
//     const method = editingEvent ? 'PUT' : 'POST';
//     try {
//       const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       const data = await res.json();
//       if (!res.ok) {
//         setEventError(data.error || `Request failed (${res.status})`);
//         setSavingEvent(false);
//         return;
//       }
//       await loadData();
//       resetEventForm();
//     } catch (err) {
//       setEventError(err.message || 'Network error');
//     }
//     setSavingEvent(false);
//   };

//   const handleDeleteEvent = async (id) => {
//     if (!confirm('Delete this event?')) return;
//     await fetch(`/api/admin/meetings/${id}`, { method: 'DELETE' });
//     await loadData();
//   };

//   // ── Add / Edit outcome ─────────────────────────────────────────────────────
//   const openOutcomeForm = (meeting) => {
//     setOutcomeEvent(meeting);
//     setOutcomeForm({
//       outcome_title: meeting.outcome_title || '',
//       outcome_summary: meeting.outcome_summary || '',
//       attendees_count: meeting.attendees_count?.toString() || '',
//       tags: (meeting.tags || []).join(', '),
//     });
//     setShowOutcomeForm(true);
//     setShowEventForm(false);
//     setActiveTab('events');
//   };

//   const handleSaveOutcome = async (e) => {
//     e.preventDefault();
//     if (!outcomeEvent?.id) return;   // guard — outcomeEvent must exist
//     setSavingOutcome(true);
//     const tagsArr = outcomeForm.tags.split(',').map(t => t.trim()).filter(Boolean);
//     await fetch(`/api/admin/meetings/${outcomeEvent.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         outcome_title: outcomeForm.outcome_title,
//         outcome_summary: outcomeForm.outcome_summary,
//         attendees_count: outcomeForm.attendees_count,
//         tags: tagsArr,
//         status: 'COMPLETED',
//       }),
//     });
//     await loadData();
//     setShowOutcomeForm(false);
//     setOutcomeEvent(null);
//     setSavingOutcome(false);
//   };

//   if (loading) return (
//     <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <span style={{ color: 'var(--text-muted)' }}>Loading admin panel...</span>
//     </div>
//   );



//   // Treat null/undefined status (pre-migration rows) as UPCOMING
//   const upcoming = meetings.filter(m => !m.status || m.status === 'UPCOMING');
//   const completed = meetings.filter(m => m.status === 'COMPLETED');

//   return (
//     <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
//       <div className="container">


//         {/* Tabs + pending badge */}
//         <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
//           {TABS.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               style={{
//                 padding: '0.55rem 1rem', background: 'none', border: 'none',
//                 borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
//                 color: activeTab === tab ? '#818cf8' : 'var(--text-secondary)',
//                 fontWeight: activeTab === tab ? 700 : 500,
//                 fontSize: '0.88rem', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
//               }}
//             >
//               {tab === 'pending' && pending.length > 0 ? `Pending (${pending.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
//               {tab === 'events' ? ` (${meetings.length})` : ''}
//             </button>
//           ))}
//           {/* Spacer */}
//           <div style={{ flex: 1 }} />
//           {pending.length > 0 && (
//             <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
//               ⏳ {pending.length} pending
//             </span>
//           )}
//         </div>

//         {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
//         {activeTab === 'overview' && (
//           <div>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
//               {[
//                 { label: 'Total Resources', value: stats.total || 0, color: '#818cf8', icon: '📦' },
//                 { label: 'Pending Review', value: stats.pending || 0, color: '#fbbf24', icon: '⏳' },
//                 { label: 'Approved', value: stats.approved || 0, color: '#34d399', icon: '✅' },
//                 { label: 'Featured', value: stats.featured || 0, color: '#06b6d4', icon: '⭐' },
//                 { label: 'Contributors', value: stats.contributors || 0, color: '#a78bfa', icon: '👥' },
//                 { label: 'Upcoming Events', value: upcoming.length, color: '#f472b6', icon: '📅' },
//                 { label: 'Past Sessions', value: completed.length, color: '#94a3b8', icon: '🎯' },
//               ].map(({ label, value, color, icon }) => (
//                 <div key={label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
//                   <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{icon}</div>
//                   <div style={{ fontSize: '1.8rem', fontWeight: 900, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
//                   <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.3rem' }}>{label}</div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
//               <button onClick={() => setActiveTab('pending')} className="btn-primary" style={{ fontSize: '0.85rem' }}>
//                 Review Pending ({pending.length})
//               </button>
//               <button onClick={() => { setActiveTab('events'); setShowEventForm(true); }} className="btn-outline" style={{ fontSize: '0.85rem' }}>
//                 + Add Event
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ── PENDING ──────────────────────────────────────────────────────── */}
//         {activeTab === 'pending' && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//             {pending.length === 0 ? (
//               <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
//                 <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
//                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All caught up! No pending resources.</p>
//               </div>
//             ) : pending.map((r) => (
//               <div key={r.id} className="glass-card" style={{ padding: '1.25rem' }}>
//                 <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
//                   <div style={{ flex: 1, minWidth: '240px' }}>
//                     <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
//                       <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{r.title}</h3>
//                       {r.category && (
//                         <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.2)' }}>
//                           {r.category.icon} {r.category.name}
//                         </span>
//                       )}
//                     </div>
//                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{r.description}</p>
//                     <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
//                       <span>by @{r.contributor?.username}</span>
//                       {r.github_stars > 0 && <span>⭐ {r.github_stars}</span>}
//                       {r.github_language && <span>💻 {r.github_language}</span>}
//                       <a href={r.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>GitHub ↗</a>
//                     </div>
//                   </div>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '120px' }}>
//                     <button onClick={() => handleResourceAction(r.id, 'approve')} disabled={!!actionLoading}
//                       style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#34d399', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(16,185,129,0.3)' }}>
//                       ✅ Approve
//                     </button>
//                     <button onClick={() => handleResourceAction(r.id, 'feature')} disabled={!!actionLoading}
//                       style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.12)', color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
//                       ⭐ Feature
//                     </button>
//                     <button onClick={() => handleResourceAction(r.id, 'reject')} disabled={!!actionLoading}
//                       style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
//                       ❌ Reject
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── RESOURCES ────────────────────────────────────────────────────── */}
//         {activeTab === 'resources' && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
//             {allResources.map((r) => (
//               <div key={r.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
//                 <div style={{ flex: 1, minWidth: '200px' }}>
//                   <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
//                     <Link href={`/resources/${r.slug}`} style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>{r.title}</Link>
//                     <StatusBadge status={r.status} />
//                   </div>
//                   <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', margin: '2px 0 0' }}>
//                     {r.category?.name} · @{r.contributor?.username}
//                   </p>
//                 </div>
//                 <div style={{ display: 'flex', gap: '0.4rem' }}>
//                   {r.status !== 'FEATURED' && <button onClick={() => handleResourceAction(r.id, 'feature')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px', cursor: 'pointer' }}>⭐ Feature</button>}
//                   {r.status !== 'APPROVED' && r.status !== 'FEATURED' && <button onClick={() => handleResourceAction(r.id, 'approve')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', cursor: 'pointer' }}>✅ Approve</button>}
//                   {r.status !== 'REJECTED' && <button onClick={() => handleResourceAction(r.id, 'reject')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer' }}>❌ Reject</button>}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── EVENTS TAB ───────────────────────────────────────────────────── */}
//         {activeTab === 'events' && (
//           <div>

//             {/* Action bar */}
//             {!showEventForm && !showOutcomeForm && (
//               <button
//                 onClick={() => { setShowEventForm(true); resetEventForm(); }}
//                 className="btn-primary"
//                 style={{ marginBottom: '1.5rem', fontSize: '0.88rem' }}
//               >
//                 + Create New Event
//               </button>
//             )}

//             {/* ── CREATE / EDIT Event Form ────────────────────────────────── */}
//             {showEventForm && (
//               <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderColor: 'rgba(99,102,241,0.3)' }}>
//                 <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
//                   {editingEvent ? '✏️ Edit Event' : '📅 Create New Event'}
//                 </h3>
//                 <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
//                   <Field label="Event Title">
//                     <input required placeholder="e.g. Build a RAG Pipeline with LangChain" value={eventForm.title}
//                       onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="input-field" />
//                   </Field>
//                   <Field label="Description / Agenda">
//                     <textarea required placeholder="What will be covered, who should attend..." value={eventForm.description}
//                       onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="input-field" style={{ minHeight: '80px' }} />
//                   </Field>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
//                     <Field label="Date">
//                       <input required type="date" value={eventForm.date}
//                         onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="input-field" />
//                     </Field>
//                     <Field label="Time">
//                       <input type="time" value={eventForm.time}
//                         onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="input-field" />
//                     </Field>
//                   </div>
//                   <Field label="Venue">
//                     <input required placeholder="e.g. PiBi Office, Madurai / Online – Google Meet"
//                       value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} className="input-field" />
//                   </Field>
//                   <Field label="Registration / Join Link (optional)">
//                     <input type="url" placeholder="https://..." value={eventForm.registration_link}
//                       onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })} className="input-field" />
//                   </Field>
//                   <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
//                     <button type="button" onClick={resetEventForm} className="btn-outline" style={{ fontSize: '0.85rem' }}>Cancel</button>
//                     <button type="submit" disabled={savingEvent} className="btn-primary" style={{ fontSize: '0.85rem', opacity: savingEvent ? 0.7 : 1 }}>
//                       {savingEvent ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {/* ── ADD OUTCOME Form ─────────────────────────────────────────── */}
//             {showOutcomeForm && outcomeEvent && (
//               <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderColor: 'rgba(52,211,153,0.35)' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
//                   <div>
//                     <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem', margin: 0 }}>
//                       🎯 Add Session Outcome
//                     </h3>
//                     <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
//                       For: <strong style={{ color: 'var(--text-secondary)' }}>{outcomeEvent.title}</strong>
//                     </p>
//                   </div>
//                   <span style={{ padding: '0.25rem 0.7rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
//                     → COMPLETED
//                   </span>
//                 </div>

//                 <form onSubmit={handleSaveOutcome} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
//                   <Field label="Session Outcome Title">
//                     <input required placeholder="e.g. Built a RAG Pipeline with 28 Attendees!"
//                       value={outcomeForm.outcome_title}
//                       onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome_title: e.target.value })} className="input-field" />
//                   </Field>
//                   <Field label="What happened? What was built / discussed?">
//                     <textarea required placeholder="Describe what was covered, demos built, key learnings, feedback from attendees..."
//                       value={outcomeForm.outcome_summary}
//                       onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome_summary: e.target.value })}
//                       className="input-field" style={{ minHeight: '110px' }} />
//                   </Field>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
//                     <Field label="Attendees Count">
//                       <input type="number" min="0" placeholder="e.g. 28"
//                         value={outcomeForm.attendees_count}
//                         onChange={(e) => setOutcomeForm({ ...outcomeForm, attendees_count: e.target.value })} className="input-field" />
//                     </Field>
//                     <Field label="Topics Covered (comma-separated)">
//                       <input placeholder="e.g. RAG, LangChain, Agents, MCP"
//                         value={outcomeForm.tags}
//                         onChange={(e) => setOutcomeForm({ ...outcomeForm, tags: e.target.value })} className="input-field" />
//                     </Field>
//                   </div>
//                   <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
//                     💡 Photo upload coming soon — use Supabase Storage directly for now.
//                   </div>
//                   <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
//                     <button type="button" onClick={() => { setShowOutcomeForm(false); setOutcomeEvent(null); }} className="btn-outline" style={{ fontSize: '0.85rem' }}>Cancel</button>
//                     <button type="submit" disabled={savingOutcome} style={{
//                       padding: '0.55rem 1.2rem', borderRadius: '10px', border: 'none',
//                       background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff',
//                       fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', opacity: savingOutcome ? 0.7 : 1,
//                     }}>
//                       {savingOutcome ? 'Saving...' : '✅ Mark as Completed'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {/* ── Events list ──────────────────────────────────────────────── */}
//             {meetings.length === 0 ? (
//               <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
//                 <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
//                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No events yet. Create your first event!</p>
//               </div>
//             ) : (
//               <>
//                 {/* Upcoming */}
//                 {upcoming.length > 0 && (
//                   <div style={{ marginBottom: '1.5rem' }}>
//                     <h4 style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                       <span style={{ width: 8, height: 8, background: '#34d399', borderRadius: '50%', display: 'inline-block' }} />
//                       Upcoming ({upcoming.length})
//                     </h4>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
//                       {upcoming.map((m) => (
//                         <EventRow key={m.id} m={m} onEdit={openEditEvent} onDelete={handleDeleteEvent} onOutcome={openOutcomeForm} showOutcomeBtn />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Completed */}
//                 {completed.length > 0 && (
//                   <div>
//                     <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                       <span style={{ width: 8, height: 8, background: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block' }} />
//                       Completed ({completed.length})
//                     </h4>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
//                       {completed.map((m) => (
//                         <EventRow key={m.id} m={m} onEdit={openEditEvent} onDelete={handleDeleteEvent} onOutcome={openOutcomeForm} showOutcomeBtn={false} />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         )}

//         {/* ── SETTINGS ─────────────────────────────────────────────────────── */}
//         {activeTab === 'settings' && (
//           <div style={{ maxWidth: '520px' }}>
//             <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
//               <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '0.95rem' }}>👤 Admin Account</h3>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//                 <div style={{ display: 'flex', gap: '0.75rem' }}>
//                   <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', minWidth: '80px' }}>Email</span>
//                   <span style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}>{adminUser?.email}</span>
//                 </div>
//                 <div style={{ display: 'flex', gap: '0.75rem' }}>
//                   <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', minWidth: '80px' }}>Role</span>
//                   <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>🛡️ ADMIN</span>
//                 </div>
//               </div>
//             </div>

//             <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
//               <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '0.95rem' }}>🔑 Change Password</h3>
//               {pwMessage.text && (
//                 <div style={{
//                   padding: '0.7rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem',
//                   background: pwMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
//                   color: pwMessage.type === 'success' ? '#34d399' : '#f87171',
//                   border: `1px solid ${pwMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
//                 }}>
//                   {pwMessage.type === 'success' ? '✅' : '⚠️'} {pwMessage.text}
//                 </div>
//               )}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                 <div style={{ position: 'relative' }}>
//                   <input type={showNewPw ? 'text' : 'password'} placeholder="New password (min 8 chars)"
//                     value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
//                     className="input-field" style={{ paddingRight: '2.8rem' }} />
//                   <button type="button" onClick={() => setShowNewPw(!showNewPw)}
//                     style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
//                     {showNewPw ? '🙈' : '👁️'}
//                   </button>
//                 </div>
//                 <input type="password" placeholder="Confirm new password" value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
//                 <button
//                   onClick={async () => {
//                     if (newPassword.length < 8) { setPwMessage({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
//                     if (newPassword !== confirmPassword) { setPwMessage({ type: 'error', text: 'Passwords do not match' }); return; }
//                     setPwLoading(true); setPwMessage({ type: '', text: '' });
//                     const { error } = await supabase.auth.updateUser({ password: newPassword });
//                     if (error) { setPwMessage({ type: 'error', text: error.message }); }
//                     else { setPwMessage({ type: 'success', text: 'Password updated successfully!' }); setNewPassword(''); setConfirmPassword(''); }
//                     setPwLoading(false);
//                   }}
//                   disabled={!newPassword || !confirmPassword || pwLoading}
//                   className="btn-primary"
//                   style={{ opacity: (!newPassword || !confirmPassword || pwLoading) ? 0.6 : 1, fontSize: '0.88rem' }}>
//                   {pwLoading ? 'Updating...' : '🔐 Update Password'}
//                 </button>
//               </div>
//             </div>

//             <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }}
//               style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
//               🚪 Logout from Admin
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Shared Event Row Component ────────────────────────────────────────────────
// function EventRow({ m, onEdit, onDelete, onOutcome, showOutcomeBtn }) {
//   const dateStr = new Date(m.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
//   const isCompleted = m.status === 'COMPLETED';

//   return (
//     <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', opacity: isCompleted ? 0.75 : 1 }}>
//       <div style={{ flex: 1, minWidth: '200px' }}>
//         <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
//           <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{m.title}</h4>
//           <span style={{
//             fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '10px',
//             background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
//             color: isCompleted ? '#34d399' : '#818cf8',
//             border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.2)'}`,
//             fontWeight: 600,
//           }}>
//             {isCompleted ? '✅ Completed' : '📅 Upcoming'}
//           </span>
//           {isCompleted && m.attendees_count && (
//             <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>👥 {m.attendees_count}</span>
//           )}
//         </div>
//         <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', margin: 0 }}>{dateStr} · {m.venue}</p>
//         {isCompleted && m.outcome_title && (
//           <p style={{ color: '#34d399', fontSize: '0.74rem', margin: '4px 0 0', fontStyle: 'italic' }}>📋 {m.outcome_title}</p>
//         )}
//         {(m.tags || []).length > 0 && (
//           <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
//             {(m.tags || []).map(t => (
//               <span key={t} style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: '10px', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>{t}</span>
//             ))}
//           </div>
//         )}
//       </div>
//       <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
//         <button onClick={() => onEdit(m)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
//         {!isCompleted && (
//           <button onClick={() => onOutcome(m)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', cursor: 'pointer' }}>🎯 Add Outcome</button>
//         )}
//         {isCompleted && (
//           <button onClick={() => onOutcome(m)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', background: 'rgba(99,102,241,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>📝 Edit Outcome</button>
//         )}
//         <button onClick={() => onDelete(m.id)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
//       </div>
//     </div>
//   );
// }


// glm code 
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';

const TABS = ['overview', 'pending', 'resources', 'events', 'contributors', 'settings'];

// ─── Reusable UI Components ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// Reusable Button to eliminate repetitive inline styles
function Btn({ children, onClick, variant = 'primary', type = 'button', disabled, style }) {
  const baseStyle = {
    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid transparent',
    opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto', ...style
  };

  const variants = {
    primary: { background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', border: 'none' },
    success: { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
    danger: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
    outline: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    warning: { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...variants[variant] }}>
      {children}
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [eventTab, setEventTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [eventSearch, setEventSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('select'); // 'select', 'pending', 'complete'
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data
  const [stats, setStats] = useState({});
  const [pending, setPending] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // Create/Edit event form
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', end_time: '', venue: '', registration_link: '', photos: '' });
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventError, setEventError] = useState('');

  // Outcome form
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeEvent, setOutcomeEvent] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome_title: '', outcome_summary: '', attendees_count: '', tags: '', photos: '' });
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [viewingOutcome, setViewingOutcome] = useState(null);

  // GitHub Contributors
  const [ghData, setGhData] = useState(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState('');

  const loadContributors = useCallback(async () => {
    setGhLoading(true); setGhError('');
    try {
      const res = await fetch('/api/github/contributors');
      const data = await res.json();
      if (data.error && !data.leaderboard?.length && !data.resources?.length) {
        setGhError(data.error);
      } else {
        setGhData(data);
      }
    } catch (e) {
      setGhError(e.message);
    }
    setGhLoading(false);
  }, []);

  // Settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [showNewPw, setShowNewPw] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const loadData = useCallback(async () => {
    const res = await fetch('/api/admin/data');
    if (!res.ok) return;
    const data = await res.json();
    setStats(data.stats || {});
    setPending(data.pending || []);
    setAllResources(data.resources || []);
    setMeetings(data.meetings || []);
  }, []);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      if (!data.isAdmin) { router.replace('/admin/login'); return; }
      setAdminUser({ email: data.email });
      await loadData();
      setLoading(false);
    }
    init();
  }, [router, loadData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResourceAction = async (resourceId, action) => {
    setActionLoading(resourceId + action);
    await fetch('/api/admin/resources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId, action }),
    });
    await loadData();
    setActionLoading('');
  };

  // ── Event Handlers ──────────────────────────────────────────────────────────
  const resetEventForm = () => {
    setEventForm({ title: '', description: '', date: '', time: '', end_time: '', venue: '', registration_link: '', cover_image: '' });
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleEventImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setEventForm({ ...eventForm, cover_image: data.url });
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const handleOutcomeImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const existingPhotos = outcomeForm.photos ? outcomeForm.photos.split(',').map(p => p.trim()).filter(Boolean) : [];
        setOutcomeForm({ ...outcomeForm, photos: [...existingPhotos, data.url].join(', ') });
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const openEditEvent = (meeting) => {
    const d = new Date(meeting.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    setEventForm({
      title: meeting.title,
      description: meeting.description,
      date: `${year}-${month}-${day}`,
      time: `${hours}:${mins}`,
      end_time: '', // Parse logic could be complex, resetting for edit
      venue: meeting.venue,
      registration_link: meeting.registration_link,
      cover_image: meeting.cover_image || ''
    });
    setEditingEvent(meeting);
    setShowEventForm(true);
    setShowOutcomeForm(false);
    setActiveTab('events');
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    setEventError('');
    const dateTime = new Date(`${eventForm.date}T${eventForm.time || '10:00'}`).toISOString();

    const url = editingEvent ? `/api/admin/meetings/${editingEvent.id}` : '/api/admin/meetings';
    const method = editingEvent ? 'PUT' : 'POST';
    try {
      const payload = { ...eventForm, date: dateTime };
      if (payload.end_time) {
        payload.description = `${payload.description}\n\nTiming: ${payload.time || ''} to ${payload.end_time}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setEventError(data.error || `Request failed (${res.status})`);
        setSavingEvent(false);
        return;
      }
      await loadData();
      resetEventForm();
    } catch (err) {
      setEventError(err.message || 'Network error');
    }
    setSavingEvent(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/admin/meetings/${id}`, { method: 'DELETE' });
    await loadData();
  };

  const openOutcomeForm = (meeting) => {
    setOutcomeEvent(meeting);
    setOutcomeForm({
      outcome_title: meeting.outcome_title || '',
      outcome_summary: meeting.outcome_summary || '',
      attendees_count: meeting.attendees_count?.toString() || '',
      tags: (meeting.tags || []).join(', '),
      photos: (meeting.photos || []).join(', '),
    });
    setShowOutcomeForm(true);
    setShowEventForm(false);
    setActiveTab('events');
  };

  const handleSaveOutcome = async (e) => {
    e.preventDefault();
    if (!outcomeEvent?.id) return;
    setSavingOutcome(true);
    const tagsArr = outcomeForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const photosArr = outcomeForm.photos.split(',').map(t => t.trim()).filter(Boolean);
    await fetch(`/api/admin/meetings/${outcomeEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome_title: outcomeForm.outcome_title,
        outcome_summary: outcomeForm.outcome_summary,
        attendees_count: outcomeForm.attendees_count,
        tags: tagsArr,
        photos: photosArr,
        status: 'COMPLETED',
      }),
    });
    await loadData();
    setShowOutcomeForm(false);
    setOutcomeEvent(null);
    setSavingOutcome(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-muted)' }}>Loading admin panel...</span>
    </div>
  );

  const now = currentTime;

  const filteredMeetings = meetings.filter(m => {
    if (!eventSearch) return true;
    const q = eventSearch.toLowerCase();
    return m.title.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q));
  });

  const upcoming = filteredMeetings.filter(m => new Date(m.date) >= now);
  const pastEvents = filteredMeetings.filter(m => new Date(m.date) < now);
  const outcomesList = pastEvents.filter(m => m.status === 'COMPLETED');

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(5,8,16,0.5)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Open Intelligence
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            PiBi Foundation
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'overview', icon: '⌘', label: 'Overview' },
            { id: 'pending', icon: '🕒', label: 'Pending Review', count: pending.length },
            { id: 'resources', icon: '📦', label: 'Resources' },
            { id: 'events', icon: '📅', label: 'Events', count: meetings.length },
            { id: 'contributors', icon: '🧑‍💻', label: 'Contributors', count: ghData?.summary?.contributors || 0 },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'contributors' && !ghData && !ghLoading) loadContributors();
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? '#818cf8' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem', width: '20px', textAlign: 'center' }}>{tab.icon}</span>
                <span style={{ fontWeight: activeTab === tab.id ? 600 : 500, fontSize: '0.85rem' }}>{tab.label}</span>
              </div>
              {tab.count > 0 && (
                <span style={{
                  background: tab.id === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                  color: tab.id === 'pending' ? '#fbbf24' : 'var(--text-muted)',
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
            }}>
              {adminUser?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {adminUser?.email}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                Admin
              </div>
            </div>
          </div>
          <button
            onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: 0,
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <span style={{ fontSize: '1.1rem' }}>↪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 3rem', height: '100vh', overflowY: 'auto' }}>

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {activeTab === 'pending' ? 'Pending Review' : activeTab}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Open Intelligence Hub · Madurai AI Community
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {pending.length > 0 && (
              <button
                onClick={() => setActiveTab('pending')}
                style={{ padding: '0.4rem 1rem', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>🕒</span> {pending.length} pending
              </button>
            )}
          </div>
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Resources', value: stats.total || 0, color: '#818cf8', icon: '📦' },
                { label: 'Pending Review', value: stats.pending || 0, color: '#fbbf24', icon: '🕒' },
                { label: 'Approved', value: stats.approved || 0, color: '#34d399', icon: '✅' },
                { label: 'Featured', value: stats.featured || 0, color: '#06b6d4', icon: '⭐' },
                { label: 'Contributors', value: stats.contributors || 0, color: '#a78bfa', icon: '👥' },
                { label: 'Upcoming Events', value: upcoming.length, color: '#f472b6', icon: '📅' },
                { label: 'Past Sessions', value: pastEvents.length, color: '#94a3b8', icon: '🎯' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ background: 'rgba(20,24,32,0.8)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
                  <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('pending')} style={{ padding: '0.6rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'} onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
                Review Pending ({pending.length}) <span>→</span>
              </button>
              <button onClick={() => { setActiveTab('events'); resetEventForm(); setShowEventForm(true); }} style={{ padding: '0.6rem 1.25rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>+</span> Add Event
              </button>
            </div>
          </div>
        )}

        {/* ── PENDING ──────────────────────────────────────────────────────── */}
        {activeTab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {pending.length === 0 ? (
              <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>All caught up! No pending resources.</p>
              </div>
            ) : pending.map((r) => (
              <div key={r.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{r.title}</h3>
                      {r.category && (
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {r.category.icon} {r.category.name}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{r.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>by @{r.contributor?.username}</span>
                      {r.github_stars > 0 && <span>⭐ {r.github_stars}</span>}
                      {r.github_language && <span>💻 {r.github_language}</span>}
                      <a href={r.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>View GitHub ↗</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '140px' }}>
                    <Btn variant="success" onClick={() => handleResourceAction(r.id, 'approve')} disabled={!!actionLoading}>✅ Approve</Btn>
                    <Btn variant="primary" onClick={() => handleResourceAction(r.id, 'feature')} disabled={!!actionLoading}>⭐ Feature</Btn>
                    <Btn variant="danger" onClick={() => handleResourceAction(r.id, 'reject')} disabled={!!actionLoading}>❌ Reject</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RESOURCES ────────────────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {allResources.map((r) => (
              <div key={r.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderRadius: '12px' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link href={`/resources/${r.slug}`} style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>{r.title}</Link>
                    <StatusBadge status={r.status} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '4px 0 0' }}>
                    {r.category?.name} · @{r.contributor?.username}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {r.status !== 'FEATURED' && <Btn variant="primary" onClick={() => handleResourceAction(r.id, 'feature')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>⭐ Feature</Btn>}
                  {r.status !== 'APPROVED' && r.status !== 'FEATURED' && <Btn variant="success" onClick={() => handleResourceAction(r.id, 'approve')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>✅ Approve</Btn>}
                  {r.status !== 'REJECTED' && <Btn variant="danger" onClick={() => handleResourceAction(r.id, 'reject')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>❌ Reject</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EVENTS TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div>
            {/* Action bar */}
            {!showEventForm && !showOutcomeForm && (
              <Btn onClick={() => { resetEventForm(); setShowEventForm(true); }} style={{ marginBottom: '1.5rem' }}>
                + Create New Event
              </Btn>
            )}

            {/* CREATE / EDIT Event Form */}
            {showEventForm && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.4)', width: '100%', maxWidth: '550px', background: 'var(--bg-primary)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0 }}>
                      {editingEvent ? '✏️ Edit Event' : '📅 Create New Event'}
                    </h3>
                    <button onClick={resetEventForm} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✖</button>
                  </div>
                  <div className="custom-scrollbar" style={{ maxHeight: 'calc(85vh - 6rem)', overflowY: 'auto', paddingRight: '0.5rem', marginRight: '-0.5rem' }}>
                    <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {eventError && <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{eventError}</div>}
                      <Field label="Event Title">
                        <input required placeholder="e.g. Build a RAG Pipeline with LangChain" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="input-field" />
                      </Field>
                      <Field label="Description / Agenda">
                        <textarea required placeholder="What will be covered, who should attend..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="input-field" style={{ minHeight: '100px' }} />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Date"><input required type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="input-field" /></Field>
                        <Field label="Timing">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                            <input type="time" value={eventForm.end_time} onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })} className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
                          </div>
                        </Field>
                      </div>
                      <Field label="Venue">
                        <input required placeholder="e.g. PiBi Office, Madurai / Online – Google Meet" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} className="input-field" />
                      </Field>
                      <Field label="Registration / Join Link (optional)">
                        <input type="url" placeholder="https://..." value={eventForm.registration_link} onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })} className="input-field" />
                      </Field>
                      <Field label="Event Banner/Photo">
                        <input type="file" accept="image/*" onChange={handleEventImageUpload} className="input-field" style={{ padding: '0.5rem', background: 'var(--bg-secondary)' }} />
                        {eventForm.cover_image && (
                          <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={eventForm.cover_image} alt="Event Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}
                      </Field>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Btn variant="outline" onClick={resetEventForm}>Cancel</Btn>
                        <Btn type="submit" disabled={savingEvent}>{savingEvent ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}</Btn>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ADD OUTCOME Form */}
            {showOutcomeForm && outcomeEvent && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(52,211,153,0.4)', width: '100%', maxWidth: '550px', background: 'var(--bg-primary)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>🎯 Add Session Outcome</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>For: <strong style={{ color: 'var(--text-secondary)' }}>{outcomeEvent.title}</strong></p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>→ COMPLETED</span>
                      <button onClick={() => { setShowOutcomeForm(false); setOutcomeEvent(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✖</button>
                    </div>
                  </div>
                  <div className="custom-scrollbar" style={{ maxHeight: 'calc(85vh - 6rem)', overflowY: 'auto', paddingRight: '0.5rem', marginRight: '-0.5rem' }}>
                    <form onSubmit={handleSaveOutcome} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Field label="Session Outcome Title">
                        <input required placeholder="e.g. Built a RAG Pipeline with 28 Attendees!" value={outcomeForm.outcome_title} onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome_title: e.target.value })} className="input-field" />
                      </Field>
                      <Field label="What happened? What was built / discussed?">
                        <textarea required placeholder="Describe what was covered, demos built, key learnings, feedback from attendees..." value={outcomeForm.outcome_summary} onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome_summary: e.target.value })} className="input-field" style={{ minHeight: '120px' }} />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="Attendees Count"><input type="number" min="0" placeholder="e.g. 28" value={outcomeForm.attendees_count} onChange={(e) => setOutcomeForm({ ...outcomeForm, attendees_count: e.target.value })} className="input-field" /></Field>
                        <Field label="Topics Covered (comma-separated)"><input placeholder="e.g. RAG, LangChain, Agents, MCP" value={outcomeForm.tags} onChange={(e) => setOutcomeForm({ ...outcomeForm, tags: e.target.value })} className="input-field" /></Field>
                      </div>
                      <Field label="Upload Outcome Photos">
                        <input type="file" accept="image/*" onChange={handleOutcomeImageUpload} className="input-field" style={{ padding: '0.5rem', background: 'var(--bg-secondary)' }} />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>You can upload multiple photos one by one.</p>

                        {outcomeForm.photos && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginTop: '0.75rem' }}>
                            {outcomeForm.photos.split(',').map(p => p.trim()).filter(Boolean).map((photoUrl, idx) => (
                              <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '1' }}>
                                <img src={photoUrl} alt={`Outcome ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPhotos = outcomeForm.photos.split(',').map(p => p.trim()).filter(Boolean).filter((_, i) => i !== idx);
                                    setOutcomeForm({ ...outcomeForm, photos: newPhotos.join(', ') });
                                  }}
                                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </Field>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <Btn variant="outline" onClick={() => { setShowOutcomeForm(false); setOutcomeEvent(null); }}>Cancel</Btn>
                        <Btn variant="success" type="submit" disabled={savingOutcome}>{savingOutcome ? 'Saving...' : '✅ Mark as Completed'}</Btn>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Events list */}
            {!showEventForm && !showOutcomeForm && (
              <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setEventTab('upcoming')}
                  style={{ background: 'none', border: 'none', color: eventTab === 'upcoming' ? '#818cf8' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0', borderBottom: eventTab === 'upcoming' ? '2px solid #818cf8' : '2px solid transparent', transition: 'all 0.2s' }}>
                  Upcoming Events ({upcoming.length})
                </button>
                <button
                  onClick={() => setEventTab('past')}
                  style={{ background: 'none', border: 'none', color: eventTab === 'past' ? '#34d399' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0', borderBottom: eventTab === 'past' ? '2px solid #34d399' : '2px solid transparent', transition: 'all 0.2s' }}>
                  Past Sessions ({pastEvents.length})
                </button>
                <button
                  onClick={() => setEventTab('outcomes')}
                  style={{ background: 'none', border: 'none', color: eventTab === 'outcomes' ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0', borderBottom: eventTab === 'outcomes' ? '2px solid #f59e0b' : '2px solid transparent', transition: 'all 0.2s' }}>
                  Outcomes ({outcomesList.length})
                </button>
                <div style={{ flex: 1 }}></div>
                <div style={{ position: 'relative', width: '250px' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            )}

            {meetings.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No events yet. Create your first event!</p>
              </div>
            ) : (
              <>
                {eventTab === 'upcoming' && (
                  upcoming.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {upcoming.map((m) => <EventRow key={m.id} m={m} onEdit={openEditEvent} onDelete={handleDeleteEvent} onOutcome={openOutcomeForm} onRefresh={loadData} isPast={false} onViewOutcome={setViewingOutcome} />)}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No upcoming events currently scheduled.</p>
                  )
                )}

                {eventTab === 'past' && (
                  pastEvents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {pastEvents.map((m) => <EventRow key={m.id} m={m} onEdit={openEditEvent} onDelete={handleDeleteEvent} onOutcome={openOutcomeForm} onRefresh={loadData} isPast={true} onViewOutcome={setViewingOutcome} />)}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No past sessions found.</p>
                  )
                )}

                {eventTab === 'outcomes' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <label style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Status :</label>
                      <select
                        value={outcomeFilter}
                        onChange={(e) => setOutcomeFilter(e.target.value)}
                        className="input-field"
                        style={{ width: '220px', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <option value="select" style={{ background: '#0f172a', color: '#fff' }}>Select</option>
                        <option value="pending" style={{ background: '#0f172a', color: '#fff' }}>Pending</option>
                        <option value="complete" style={{ background: '#0f172a', color: '#fff' }}>Complete</option>
                      </select>
                    </div>

                    {(() => {
                      let filteredOutcomes = pastEvents;
                      if (outcomeFilter === 'pending') {
                        filteredOutcomes = pastEvents.filter(m => m.status !== 'COMPLETED' || !m.outcome_title);
                      } else if (outcomeFilter === 'complete') {
                        filteredOutcomes = pastEvents.filter(m => m.status === 'COMPLETED' && m.outcome_title);
                      }

                      if (filteredOutcomes.length === 0) {
                        return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No outcomes found for this filter.</p>;
                      }

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {filteredOutcomes.map(m => <EventRow key={m.id} m={m} onEdit={openEditEvent} onDelete={handleDeleteEvent} onOutcome={openOutcomeForm} onRefresh={loadData} isPast={true} onViewOutcome={setViewingOutcome} />)}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* VIEW OUTCOME MODAL */}
            {viewingOutcome && (() => {
              const modalBgImage = viewingOutcome.photos && viewingOutcome.photos.length > 0 ? viewingOutcome.photos[0] : null;

              return (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setViewingOutcome(null)}>
                  <div
                    className="glass-card"
                    style={{
                      padding: '2rem',
                      borderRadius: '24px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      width: '100%',
                      maxWidth: '650px',
                      background: 'var(--bg-primary)',
                      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)'
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
                          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${modalBgImage})`
                          : 'rgba(255,255,255,0.05)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '200px',
                        border: '1px solid rgba(255,255,255,0.15)'
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
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <h4 style={{ color: '#34d399', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 12px 0', textTransform: 'uppercase' }}>{viewingOutcome.outcome_title}</h4>
                        <div style={{
                          color: '#ffffff',
                          fontSize: '0.95rem',
                          lineHeight: '1.8',
                          whiteSpace: 'pre-wrap',
                          background: 'rgba(15, 23, 42, 0.5)',
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {viewingOutcome.outcome_summary}
                        </div>
                      </div>

                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <Btn variant="primary" onClick={() => setViewingOutcome(null)}>Close</Btn>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}


        {/* ── CONTRIBUTORS ──────────────────────────────────────────────────── */}
        {activeTab === 'contributors' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Website-ல் உள்ள எல்லா resources-ஐயும் யாரு fork பண்றாங்க என்று காட்டுகிறது
              </p>
              <Btn variant="outline" onClick={loadContributors} disabled={ghLoading} style={{ fontSize: '0.78rem' }}>
                {ghLoading ? '⏳ Loading...' : '🔄 Refresh'}
              </Btn>
            </div>

            {ghError && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                ⚠️ {ghError}
              </div>
            )}

            {/* Loading skeleton */}
            {ghLoading && !ghData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: 'rgba(20,24,32,0.8)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '1.5rem', height: '80px' }} />
                ))}
              </div>
            )}

            {ghData && (
              <>
                {/* ── Summary Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Resources Scanned', value: ghData.summary.total_resources, icon: '📦', color: '#818cf8' },
                    { label: 'Total Forks',        value: ghData.summary.total_forks,     icon: '🍴', color: '#06b6d4' },
                    { label: 'Unique Forkers',     value: ghData.summary.unique_forkers,  icon: '👥', color: '#34d399' },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} style={{ background: 'rgba(20,24,32,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.1rem' }}>{icon}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* ── Per-Resource Fork View ── */}
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  Resources & Forks
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {ghData.resources?.filter(r => r.repoInfo).map(r => (
                    <div key={r.id} style={{ background: 'rgba(20,24,32,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: r.forkers.length > 0 ? '0.75rem' : 0 }}>
                        <div>
                          <a href={r.github_url} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                            {r.title} ↗
                          </a>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                            {r.owner}/{r.repo}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>
                            ⭐ {r.repoInfo.stargazers_count}
                          </span>
                          <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>
                            🍴 {r.repoInfo.forks_count} forks
                          </span>
                        </div>
                      </div>

                      {/* Forkers avatars */}
                      {r.forkers.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Forked by:</span>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {r.forkers.map(f => (
                              <a key={f.login} href={f.profile_url} target="_blank" rel="noopener noreferrer"
                                title={f.login} style={{ textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px 2px 2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
                                  <img src={f.avatar_url} alt={f.login} width={18} height={18}
                                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${f.login}&background=6366f1&color=fff&size=18`; }}
                                  />
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 500 }}>{f.login}</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                          No forks tracked yet
                        </div>
                      )}
                    </div>
                  ))}

                  {ghData.resources?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
                      <p>No approved resources found. Approve some resources first.</p>
                    </div>
                  )}
                </div>

                {/* ── Leaderboard ── */}
                {ghData.leaderboard?.length > 0 && (
                  <>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                      Top Forkers Leaderboard
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                      {ghData.leaderboard.map((u, idx) => (
                        <a key={u.login} href={u.profile_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <div style={{ background: 'rgba(20,24,32,0.8)', border: idx === 0 ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                            <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: idx === 0 ? '#fff' : 'var(--text-muted)', border: idx > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', flexShrink: 0 }}>
                              #{idx + 1}
                            </div>
                            <img src={u.avatar_url} alt={u.login} width={36} height={36}
                              style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${u.login}&background=6366f1&color=fff`; }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.login}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Forked {u.count} resource{u.count !== 1 ? 's' : ''}</div>
                            </div>
                            <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                              🍴 {u.count}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SETTINGS ─────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px' }}>
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1rem' }}>👤 Admin Account</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '80px' }}>Email</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{adminUser?.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '80px' }}>Role</span>
                  <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>🛡️ ADMIN</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1rem' }}>🔑 Change Password</h3>
              {pwMessage.text && (
                <div style={{
                  padding: '0.85rem 1.2rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem',
                  background: pwMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: pwMessage.type === 'success' ? '#34d399' : '#f87171',
                  border: `1px solid ${pwMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  {pwMessage.type === 'success' ? '✅' : '⚠️'} {pwMessage.text}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPw ? 'text' : 'password'} placeholder="New password (min 8 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                    {showNewPw ? '🙈' : '👁️'}
                  </button>
                </div>
                <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
                <Btn onClick={async () => {
                  if (newPassword.length < 8) { setPwMessage({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
                  if (newPassword !== confirmPassword) { setPwMessage({ type: 'error', text: 'Passwords do not match' }); return; }
                  setPwLoading(true); setPwMessage({ type: '', text: '' });
                  // Note: Assuming supabase is imported globally or via hook in your actual code
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) { setPwMessage({ type: 'error', text: error.message }); }
                  else { setPwMessage({ type: 'success', text: 'Password updated successfully!' }); setNewPassword(''); setConfirmPassword(''); }
                  setPwLoading(false);
                }} disabled={!newPassword || !confirmPassword || pwLoading}>
                  {pwLoading ? 'Updating...' : '🔐 Update Password'}
                </Btn>
              </div>
            </div>

            <Btn variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }}>
              🚪 Logout from Admin
            </Btn>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Countdown Timer Component ───────────────────────────────────────────────────
function CountdownTimer({ targetDate, onExpire }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [expiredTriggered, setExpiredTriggered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calculateTimeLeft();
      setTimeLeft(tl);
      if (tl.expired && !expiredTriggered) {
        setExpiredTriggered(true);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, expiredTriggered, onExpire]);

  if (timeLeft.expired) {
    return <p style={{ color: '#fbbf24', fontSize: '0.75rem', margin: '6px 0 0', fontWeight: 600 }}>⏳ Starting soon / In progress...</p>;
  }

  const format = (num) => String(num).padStart(2, '0');

  const Box = ({ value, label }) => (
    <div style={{ background: 'rgba(5, 8, 20, 0.5)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.6rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{format(value)}</span>
      <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginTop: '4px', fontWeight: 600 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      {timeLeft.days !== undefined && (
        <>
          <Box value={timeLeft.days} label="Days" />
          <Box value={timeLeft.hours} label="Hours" />
          <Box value={timeLeft.minutes} label="Mins" />
          <Box value={timeLeft.seconds} label="Secs" />
        </>
      )}
    </div>
  );
}

// ── Shared Event Row Component ────────────────────────────────────────────────
function EventRow({ m, onEdit, onDelete, onOutcome, onRefresh, isPast, onViewOutcome }) {
  const dateStr = new Date(m.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const isCompleted = m.status === 'COMPLETED';
  const coverPhoto = m.cover_image;
  const isClickable = isCompleted && onViewOutcome;

  return (
    <div
      className="glass-card"
      onClick={() => isClickable ? onViewOutcome(m) : null}
      style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center', borderRadius: '12px', opacity: isCompleted ? 0.8 : 1, cursor: isClickable ? 'pointer' : 'default', transition: 'all 0.2s' }}
    >
      <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {coverPhoto ? (
          <img src={coverPhoto} alt="Event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>🖼️</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem', margin: 0, letterSpacing: '-0.3px' }}>{m.title}</h4>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{dateStr}</span>
          <span>·</span>
          <span>{m.venue}</span>
        </div>

        {isCompleted && m.outcome_title ? (
          <div style={{ marginTop: '4px', color: '#34d399', fontSize: '0.8rem', fontWeight: 500 }}>
            ✅ Outcome Recorded
          </div>
        ) : isPast ? (
          <div style={{ marginTop: '4px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 500 }}>
            Pending Outcome
          </div>
        ) : (
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'left top', marginTop: '0.25rem' }}>
            <CountdownTimer targetDate={m.date} onExpire={onRefresh} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <Btn variant="primary" onClick={() => onEdit(m)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Edit</Btn>
        {isPast && !isCompleted && <Btn variant="success" onClick={() => onOutcome(m)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Add Outcome</Btn>}
        {isPast && isCompleted && <Btn variant="outline" onClick={() => onOutcome(m)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Edit Outcome</Btn>}
        <Btn variant="danger" onClick={() => onDelete(m.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Delete</Btn>
      </div>
    </div>
  );
}