"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ease = (t) => t * t * (3 - 2 * t);

function waveY(x, W, tick, baseY, amp, spd, phase, ripple) {
    const t = x / W;
    const r = ripple ?? 0;
    return (
        baseY +
        Math.sin(t * Math.PI * 3.0 + tick * spd + phase) * amp +
        Math.cos(t * Math.PI * 1.8 - tick * spd * 0.5) * (amp * 0.8) +
        Math.sin(t * Math.PI * 4.2 + tick * spd * 0.9) * (amp * 0.4 * (1.0 + r))
    );
}

function drawLayer(ctx, W, H, tick, baseYFrac, amp, spd, phase, ripple, stops, shadowCol, blurMin, blurMax, glowT, step = 2) {
    const baseY = H * baseYFrac;
    const crestY = baseY - amp * 2.0;
    const grad = ctx.createLinearGradient(0, crestY, 0, H);
    stops.forEach(([p, c]) => grad.addColorStop(p, c));
    ctx.save();
    ctx.shadowColor = shadowCol;
    ctx.shadowBlur = lerp(blurMin, blurMax, glowT);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += step) {
        ctx.lineTo(x, waveY(x, W, tick, baseY, amp, spd, phase, ripple));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
}

// ═══════════════════════════════════════════════
//  WaveCanvas — reacts to isTyping & isComplete
// ═══════════════════════════════════════════════
function WaveCanvas({ isTyping, isComplete }) {
    const canvasRef = useRef(null);
    const isTypingRef = useRef(isTyping);
    const isCompleteRef = useRef(isComplete);
    const rafRef = useRef(null);
    const s = useRef({ tick: 0, blend: 0, glow: 0, energy: 0, breathPhase: 0, breathAmp: 0, _a2: null }).current;

    useEffect(() => {
        isTypingRef.current = isTyping;
        isCompleteRef.current = isComplete;
        if (isTyping && !isComplete) s.energy = clamp(s.energy + 0.10, 0, 0.60);
    }, [isTyping, isComplete]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const isMobile = window.innerWidth < 768;
            // Lower resolution on mobile for performance
            canvas.width  = window.innerWidth  * (isMobile ? 1 : dpr);
            canvas.height = window.innerHeight * (isMobile ? 1 : dpr);
            canvas.style.width  = window.innerWidth  + 'px';
            canvas.style.height = window.innerHeight + 'px';
            if (!isMobile) ctx.scale(dpr, dpr);
        }
        resize();
        window.addEventListener('resize', resize);

        function animate() {
            const typing = isTypingRef.current;
            const completed = isCompleteRef.current;
            const W = canvas.width, H = canvas.height;

            s.blend = lerp(s.blend, (typing && !completed) ? 1 : 0, typing ? 0.028 : 0.016);
            s.glow = lerp(s.glow, (typing && !completed) ? 1 : 0, typing ? 0.036 : 0.018);
            s.energy = lerp(s.energy, 0, 0.036);
            s.breathAmp = lerp(s.breathAmp, (typing && !completed) ? 1 : 0, typing ? 0.022 : 0.014);

            // ── Reduced speeds (≈40% slower) ──
            const targetBreathSpeed = completed ? 0 : lerp(0.006, 0.042, ease(s.blend));
            s.breathPhase += targetBreathSpeed;
            const targetTickSpeed = completed ? 0 : lerp(0.048, 0.095, ease(s.blend));
            s.tick += targetTickSpeed;

            const eb = ease(s.blend), eA = ease(s.breathAmp), swing = eA * 0.035;
            // On mobile, push the wave lower so content isn't covered
            const isMob = (typeof window !== 'undefined' && window.innerWidth < 768);
            const base1 = (isMob ? 0.82 : 0.72) + Math.sin(s.breathPhase) * swing;
            const base2 = (isMob ? 0.85 : 0.75) - Math.sin(s.breathPhase) * swing;
            const amp = lerp(isMob ? 14 : 20, isMob ? 22 : 32, eb) + s.energy * 5;
            const gT = s.glow;

            // Mobile: draw every 4px; desktop: every 2px
            const isMobile = W < 768;
            const step = isMobile ? 4 : 2;
            const W_logical = isMobile ? W : W / Math.min(window.devicePixelRatio || 1, 2);
            const H_logical = isMobile ? H : H / Math.min(window.devicePixelRatio || 1, 2);

            ctx.clearRect(0, 0, W, H);
            const bg = ctx.createLinearGradient(0, 0, 0, H_logical);
            bg.addColorStop(0, '#02030a'); bg.addColorStop(0.5, '#050b1c'); bg.addColorStop(1, '#070f26');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

            const grd = ctx.createRadialGradient(W_logical / 2, H_logical, 0, W_logical / 2, H_logical, W_logical * 0.66);
            grd.addColorStop(0, `rgba(88,172,255,${lerp(0.16, 0.32, eb)})`);
            grd.addColorStop(0.4, `rgba(26,100,215,${lerp(0.08, 0.16, eb)})`);
            grd.addColorStop(0.76, `rgba(8,35,124,${lerp(0.03, 0.08, eb)})`);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

            if (s.blend > 0.01) {
                const gy = H_logical * (base1 + base2) / 2;
                const gr = lerp(W_logical * 0.36, W_logical * 0.80, eb);
                const tg = ctx.createRadialGradient(W_logical / 2, gy, 0, W_logical / 2, gy, gr);
                tg.addColorStop(0, `rgba(185,232,255,${0.28 * s.blend})`);
                tg.addColorStop(0.34, `rgba(70,158,248,${0.14 * s.blend})`);
                tg.addColorStop(0.68, `rgba(22,74,192,${0.06 * s.blend})`);
                tg.addColorStop(1, 'transparent');
                ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H);
            }

            // Use logical dimensions and mobile step for wave drawing
            const a2T = lerp(0.55, 0.82, eb);
            s._a2 = s._a2 ?? a2T; s._a2 = lerp(s._a2, a2T, 0.05);
            if (s._a2 > 0.01) {
                drawLayer(ctx, W_logical, H_logical, s.tick, base2, amp * 0.82, 0.4, Math.PI, s.energy * 0.5,
                    [[0, `rgba(245,252,255,${0.72 * s._a2})`], [0.06, `rgba(210,240,255,${0.68 * s._a2})`], [0.22, `rgba(100,185,250,${0.62 * s._a2})`], [0.5, `rgba(28,88,200,${0.66 * s._a2})`], [1, `rgba(5,18,72,${0.72 * s._a2})`]],
                    `rgba(220,242,255,${lerp(0.18, 0.50, gT * s._a2)})`, 18, 60, gT, step);
            }

            const g1 = lerp(0.88, 1.0, gT);
            drawLayer(ctx, W_logical, H_logical, s.tick, base1, amp, 0.56, 0, s.energy,
                [[0, `rgba(255,255,255,${g1})`], [0.05, 'rgba(235,250,255,0.96)'], [0.14, 'rgba(170,222,255,0.92)'], [0.3, 'rgba(75,162,245,0.90)'], [0.52, 'rgba(28,98,215,0.88)'], [0.75, 'rgba(9,42,145,0.92)'], [1, 'rgba(3,12,58,0.96)']],
                `rgba(240,250,255,${lerp(0.50, 1.00, gT)})`, 42, 115, gT, step);

            rafRef.current = requestAnimationFrame(animate);
        }
        animate();
        return () => { window.removeEventListener('resize', resize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />;
}

// ═══════════════════════════════════════════════
//  MP3 Audio phases — ElevenLabs pre-recorded
// ═══════════════════════════════════════════════
const AUDIO_PHASES = [
    '/audio/hero-phase-1.mp3',
    '/audio/hero-phase-2.mp3',
    '/audio/hero-phase-3.mp3',
];


// ═══════════════════════════════════════════════
//  Typewriter — 4 rotating display lines with erase
// ═══════════════════════════════════════════════
const DISPLAY_LINES = [
    'Welcome to Open Intelligence',
    "Built by Madurai's AI Community",
    'Discover. Contribute. Build Together.',
    'Open Source AI — For Everyone',
];

function Typewriter({ onTypingChange, started }) {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (!started) return;
        let lineIdx = 0;
        let charIdx = 0;
        let timeoutId;
        let running = true;

        function typeNext() {
            if (!running) return;
            const line = DISPLAY_LINES[lineIdx % DISPLAY_LINES.length];
            charIdx++;
            setDisplayText(line.slice(0, charIdx));
            onTypingChange(true);

            if (charIdx < line.length) {
                timeoutId = setTimeout(typeNext, 72 + Math.random() * 44);
            } else {
                onTypingChange(false);
                timeoutId = setTimeout(() => {
                    if (!running) return;
                    let eraseIdx = line.length;
                    function eraseNext() {
                        if (!running) return;
                        eraseIdx--;
                        setDisplayText(line.slice(0, eraseIdx));
                        if (eraseIdx > 0) {
                            timeoutId = setTimeout(eraseNext, 26);
                        } else {
                            lineIdx++;
                            charIdx = 0;
                            timeoutId = setTimeout(typeNext, 420);
                        }
                    }
                    eraseNext();
                }, 2400);
            }
        }

        timeoutId = setTimeout(typeNext, 900);
        return () => { running = false; clearTimeout(timeoutId); };
    }, [started]);

    return (
        <div style={{ minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <span className="oi-typewriter-text" style={{
                fontSize: 'clamp(18px, 4.5vw, 34px)',
                fontWeight: 300,
                letterSpacing: '2px',
                color: 'rgba(200,228,255,0.92)',
                textShadow: '0 0 32px rgba(130,200,255,0.55), 0 0 80px rgba(60,130,255,0.22)',
            }}>
                {displayText}
                <span style={{
                    display: 'inline-block', width: '2px', height: '1.1em',
                    background: 'rgba(150,200,255,0.85)',
                    marginLeft: '3px', verticalAlign: 'middle',
                    animation: 'oiCursorBlink 1s step-end infinite',
                }} />
            </span>
        </div>
    );
}

// ═══════════════════════════════════════════════
//  Phase label map
// ═══════════════════════════════════════════════
const PHASE_LABELS = ['Platform Intro', 'Call to Action', 'Community Events'];

// ═══════════════════════════════════════════════
//  WaveHero — main export
// ═══════════════════════════════════════════════
export default function WaveHero() {
    const [isTyping, setIsTyping] = useState(false);
    const [started, setStarted] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    const [phase, setPhase] = useState(0);
    const [speaking, setSpeaking] = useState(false);
    const [audioDone, setAudioDone] = useState(false);
    const audioRef = useRef(null);
    const phaseRef = useRef(0);
    const cancelledRef = useRef(false);

    // Typewriter auto-starts
    useEffect(() => {
        const t = setTimeout(() => setStarted(true), 600);
        return () => clearTimeout(t);
    }, []);

    // Play MP3 phases sequentially using HTML5 Audio
    useEffect(() => {
        if (!audioStarted) return;
        cancelledRef.current = false;
        phaseRef.current = 0;

        function playPhase(idx) {
            if (cancelledRef.current || idx >= AUDIO_PHASES.length) {
                setSpeaking(false);
                setAudioDone(true);
                return;
            }
            setPhase(idx);
            setSpeaking(true);
            setAudioDone(false);

            const audio = new Audio(AUDIO_PHASES[idx]);
            audioRef.current = audio;
            audio.volume = 1.0;

            audio.addEventListener('ended', () => {
                if (cancelledRef.current) return;
                setTimeout(() => playPhase(idx + 1), 1600);
            });

            audio.addEventListener('error', () => {
                console.warn('Audio phase', idx, 'failed to load');
                if (!cancelledRef.current) setTimeout(() => playPhase(idx + 1), 500);
            });

            audio.play().catch(err => {
                console.warn('Audio play error:', err);
                if (!cancelledRef.current) setTimeout(() => playPhase(idx + 1), 500);
            });
        }

        playPhase(0);

        return () => {
            cancelledRef.current = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioStarted]);

    function handleAudioClick() {
        if (audioDone) {
            setAudioStarted(false);
            setAudioDone(false);
            setSpeaking(false);
            setTimeout(() => setAudioStarted(true), 100);
        } else {
            setAudioStarted(true);
        }
    }

    return (
        <>
            <style>{`
                @keyframes oiCursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes oiFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes oiBar0 { from{height:4px} to{height:18px} }
                @keyframes oiBar1 { from{height:6px} to{height:26px} }
                @keyframes oiBar2 { from{height:3px} to{height:22px} }
                @keyframes oiBar3 { from{height:8px} to{height:14px} }
                @keyframes oiPulseRing {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.9); opacity: 0; }
                }
                @keyframes oiSpeakerPulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(100,180,255,0.4); }
                    50% { box-shadow: 0 0 0 12px rgba(100,180,255,0); }
                }
                /* Mobile responsive */
                @media (max-width: 640px) {
                    .oi-hero-content { gap: 16px !important; padding: 0 1rem !important; }
                    .oi-typewriter-text { font-size: clamp(16px,5vw,22px) !important; letter-spacing: 1px !important; }
                    .oi-action-buttons { gap: 8px !important; }
                    .oi-action-btn { padding: 8px 14px !important; font-size: 11px !important; }
                    .oi-audio-btn { padding: 8px 16px !important; font-size: 10px !important; }
                }
                @media (min-width: 641px) and (max-width: 1024px) {
                    .oi-hero-content { gap: 20px !important; }
                    .oi-typewriter-text { font-size: clamp(20px,3.5vw,28px) !important; }
                }
            `}</style>

            <section style={{
            position: 'relative', width: '100%', height: '100svh',
                minHeight: '100dvh', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingBottom: '18vh',
            }}>
                <WaveCanvas isTyping={isTyping} isComplete={false} />

                <div className="oi-hero-content" style={{
                    position: 'relative', zIndex: 10,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '24px',
                    padding: '0 1.5rem', textAlign: 'center',
                    animation: 'oiFadeUp 1s ease both',
                    width: '100%', maxWidth: '600px',
                }}>
                    {/* Phase / identity label */}
                    <p className="oi-phase-label" style={{
                        color: 'rgba(130,170,230,0.32)',
                        fontWeight: 300, fontSize: '11px',
                        letterSpacing: '6px', textTransform: 'uppercase',
                        margin: 0, minHeight: '16px',
                    }}>
                        {speaking ? PHASE_LABELS[phase] : 'Open Intelligence'}
                    </p>

                    {/* Rotating typewriter lines */}
                    <Typewriter onTypingChange={setIsTyping} started={started} />

                    {/* ── Tap to hear button ── */}
                    {!speaking && (
                        <button
                            className="oi-audio-btn"
                            onClick={handleAudioClick}
                            style={{
                                position: 'relative',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 22px',
                                borderRadius: '40px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(100,170,255,0.22)',
                                color: 'rgba(170,210,255,0.75)',
                                fontSize: '11px', fontWeight: 500,
                                letterSpacing: '4px', textTransform: 'uppercase',
                                cursor: 'pointer', backdropFilter: 'blur(10px)',
                                animation: !audioStarted ? 'oiSpeakerPulse 2.4s ease-in-out infinite' : 'none',
                                transition: 'all 0.3s ease', outline: 'none',
                            }}
                        >
                            {!audioStarted && (
                                <span style={{
                                    position: 'absolute', inset: 0, borderRadius: '40px',
                                    border: '1px solid rgba(100,170,255,0.3)',
                                    animation: 'oiPulseRing 2.4s ease-out infinite',
                                    pointerEvents: 'none',
                                }} />
                            )}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                            {audioDone ? 'Replay Story' : 'Tap to hear our story'}
                        </button>
                    )}

                    {/* Sound bar + speaking status */}
                    {speaking && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            animation: 'oiFadeUp 0.4s ease both',
                        }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: '3px', borderRadius: '2px',
                                    background: 'rgba(140,200,255,0.85)',
                                    animation: `oiBar${i} ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                                }} />
                            ))}
                            <p style={{
                                fontSize: '10px',
                                color: 'rgba(90,130,200,0.5)',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                margin: '0 6px',
                            }}>
                                {PHASE_LABELS[phase]}
                            </p>
                            {[3, 2, 1, 0].map(i => (
                                <div key={`r${i}`} style={{
                                    width: '3px', borderRadius: '2px',
                                    background: 'rgba(140,200,255,0.85)',
                                    animation: `oiBar${i} ${0.6 + (3 - i) * 0.15}s ease-in-out infinite alternate`,
                                }} />
                            ))}
                        </div>
                    )}

                    {/* ── 3 Action Buttons ── */}
                    <div className="oi-action-buttons" style={{
                        display: 'flex', gap: '12px', flexWrap: 'wrap',
                        justifyContent: 'center', marginTop: '8px',
                        animation: 'oiFadeUp 1.2s ease both',
                    }}>
                        {[
                            { href: '/meetings',  label: 'Book Meetings', icon: '📅' },
                            { href: '/resources', label: 'Resources',     icon: '🗂️' },
                            { href: '/submit',    label: 'Contribute',    icon: '✦'  },
                        ].map(({ href, label, icon }) => (
                            <Link key={href} href={href}
                                className="oi-action-btn"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                    padding: '9px 18px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(100,160,255,0.16)',
                                    color: 'rgba(180,215,255,0.82)',
                                    fontSize: '12px', fontWeight: 500, letterSpacing: '0.5px',
                                    textDecoration: 'none', backdropFilter: 'blur(10px)',
                                    transition: 'background 0.2s, border-color 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(100,160,255,0.10)';
                                    e.currentTarget.style.borderColor = 'rgba(130,190,255,0.30)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(100,160,255,0.16)';
                                }}>
                                <span>{icon}</span> {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

