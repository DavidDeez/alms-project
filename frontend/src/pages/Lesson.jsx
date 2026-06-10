import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─────────────────────────────────────────────────────────────
   Rich content renderer — parses AI-generated structured text
   into beautiful textbook-style React elements
───────────────────────────────────────────────────────────── */
function renderInline(text) {
    // Handle **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function RichContent({ content }) {
    if (!content) return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No lesson material available yet.</p>;

    const lines = content.split('\n');
    const elements = [];
    let i = 0;
    let bulletBuffer = [];
    let numberedBuffer = [];

    const flushBullets = (key) => {
        if (bulletBuffer.length > 0) {
            elements.push(
                <ul key={`ul-${key}`} style={{ margin: '0.75rem 0 1rem 0', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {bulletBuffer.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1rem' }}>
                            {renderInline(item)}
                        </li>
                    ))}
                </ul>
            );
            bulletBuffer = [];
        }
    };

    const flushNumbered = (key) => {
        if (numberedBuffer.length > 0) {
            elements.push(
                <ol key={`ol-${key}`} style={{ margin: '0.75rem 0 1rem 0', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {numberedBuffer.map((item, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1rem' }}>
                            {renderInline(item)}
                        </li>
                    ))}
                </ol>
            );
            numberedBuffer = [];
        }
    };

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // ── EXAMPLE block ──
        if (trimmed === 'EXAMPLE:') {
            flushBullets(i); flushNumbered(i);
            const exLines = [];
            i++;
            while (i < lines.length && lines[i].trim() !== 'END_EXAMPLE') {
                exLines.push(lines[i]);
                i++;
            }
            elements.push(
                <div key={`ex-${i}`} style={{
                    background: 'rgba(56,189,248,0.06)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    borderLeft: '4px solid #38bdf8',
                    borderRadius: '0.875rem',
                    padding: '1.25rem 1.5rem',
                    margin: '1.25rem 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                        <span style={{
                            background: 'rgba(56,189,248,0.15)', color: '#38bdf8',
                            fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            padding: '0.2rem 0.6rem', borderRadius: '0.375rem',
                            border: '1px solid rgba(56,189,248,0.25)'
                        }}>✏️ Worked Example</span>
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.975rem' }}>
                        {exLines.map((l, idx) => <React.Fragment key={idx}>{renderInline(l)}{idx < exLines.length - 1 ? '\n' : ''}</React.Fragment>)}
                    </div>
                </div>
            );
            i++;
            continue;
        }

        // ── FORMULA block ──
        if (trimmed === 'FORMULA:') {
            flushBullets(i); flushNumbered(i);
            const fLines = [];
            i++;
            while (i < lines.length && lines[i].trim() !== 'END_FORMULA') {
                fLines.push(lines[i]);
                i++;
            }
            elements.push(
                <div key={`f-${i}`} style={{
                    background: 'rgba(129,140,248,0.08)',
                    border: '1px solid rgba(129,140,248,0.25)',
                    borderRadius: '0.875rem',
                    padding: '1.25rem 1.75rem',
                    margin: '1.25rem 0',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                        📐 Formula
                    </div>
                    <div style={{
                        fontFamily: '"Courier New", Courier, monospace',
                        fontSize: '1.2rem', fontWeight: 700,
                        color: '#c4b5fd',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {fLines.join('\n')}
                    </div>
                </div>
            );
            i++;
            continue;
        }

        // ── NOTE: ──
        if (trimmed.startsWith('NOTE:')) {
            flushBullets(i); flushNumbered(i);
            const noteText = trimmed.slice(5).trim();
            elements.push(
                <div key={`note-${i}`} style={{
                    background: 'rgba(251,191,36,0.07)',
                    border: '1px solid rgba(251,191,36,0.25)',
                    borderLeft: '4px solid #fbbf24',
                    borderRadius: '0.875rem',
                    padding: '1rem 1.25rem',
                    margin: '1rem 0',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.1rem' }}>💡</span>
                    <span style={{ color: '#fde68a', lineHeight: 1.7, fontSize: '0.95rem' }}>{renderInline(noteText)}</span>
                </div>
            );
            i++;
            continue;
        }

        // ── ## Heading ──
        if (trimmed.startsWith('## ')) {
            flushBullets(i); flushNumbered(i);
            elements.push(
                <div key={`h2-${i}`} style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.35rem', fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: 0,
                        paddingBottom: '0.5rem',
                        borderBottom: '2px solid rgba(129,140,248,0.2)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <span style={{ color: '#818cf8' }}>§</span>
                        {trimmed.slice(3)}
                    </h2>
                </div>
            );
            i++;
            continue;
        }

        // ── ### Sub-heading ──
        if (trimmed.startsWith('### ')) {
            flushBullets(i); flushNumbered(i);
            elements.push(
                <h3 key={`h3-${i}`} style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.1rem', fontWeight: 700,
                    color: '#a5b4fc',
                    margin: '1.5rem 0 0.5rem',
                }}>
                    {trimmed.slice(4)}
                </h3>
            );
            i++;
            continue;
        }

        // ── Bullet list ──
        if (trimmed.startsWith('- ')) {
            flushNumbered(i);
            bulletBuffer.push(trimmed.slice(2));
            i++;
            continue;
        }

        // ── Numbered list ──
        if (/^\d+\.\s/.test(trimmed)) {
            flushBullets(i);
            numberedBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
            i++;
            continue;
        }

        // ── Empty line ──
        if (trimmed === '') {
            flushBullets(i); flushNumbered(i);
            i++;
            continue;
        }

        // ── Regular paragraph ──
        flushBullets(i); flushNumbered(i);
        elements.push(
            <p key={`p-${i}`} style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.9,
                fontSize: '1.02rem',
                margin: '0.625rem 0',
                fontFamily: 'Georgia, serif',
            }}>
                {renderInline(trimmed)}
            </p>
        );
        i++;
    }

    flushBullets(lines.length);
    flushNumbered(lines.length);

    return <div>{elements}</div>;
}

/* ─────────────────────────────────────────────────────────────
   Main Lesson component
───────────────────────────────────────────────────────────── */
export default function Lesson() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scrollPct, setScrollPct] = useState(0);
    const contentRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_URL}/api/courses/topic/${topicId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => { setTopic(res.data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }, [topicId, token]);

    // Real scroll-based reading progress
    useEffect(() => {
        const handleScroll = () => {
            const el = contentRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const total = el.offsetHeight;
            const visible = window.innerHeight - rect.top;
            const pct = Math.min(100, Math.max(0, Math.round((visible / total) * 100)));
            setScrollPct(pct);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [topic]);

    if (loading) {
        return (
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 1.25rem' }}>
                <div className="skeleton" style={{ height: 20, width: '20%', marginBottom: '2rem', borderRadius: '0.5rem' }} />
                <div className="skeleton" style={{ height: 48, width: '70%', marginBottom: '1rem', borderRadius: '0.5rem' }} />
                {[1,2,3,4].map(n => <div key={n} className="skeleton" style={{ height: 80, borderRadius: '1rem', marginBottom: '1rem' }} />)}
            </div>
        );
    }

    if (!topic) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>😕</div>
                <p style={{ color: 'var(--danger)' }}>Lesson not found.</p>
                <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: 840, fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                /* ── Sticky progress bar at very top ── */
                .lesson-progress-bar {
                    position: fixed; top: 60px; left: 0; right: 0;
                    height: 3px; z-index: 99;
                    background: rgba(255,255,255,0.06);
                }
                .lesson-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1, #38bdf8);
                    transition: width 0.3s ease;
                }
                /* ── Video embed ── */
                .lesson-video-wrap {
                    position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;
                    border-radius: 1rem; border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
                }
                .lesson-video-wrap iframe {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                }
                /* ── Footer CTA ── */
                .lesson-cta {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1.5rem 2rem; gap: 1rem;
                }
                .lesson-cta-btn {
                    font-size: 1rem; padding: 0.875rem 2rem;
                    white-space: nowrap; flex-shrink: 0;
                }
                /* ── Divider ── */
                .lesson-divider {
                    border: none; border-top: 1px solid rgba(255,255,255,0.07);
                    margin: 2rem 0;
                }
                @media (max-width: 600px) {
                    .lesson-cta { flex-direction: column; align-items: stretch; padding: 1.25rem; text-align: center; }
                    .lesson-cta-btn { width: 100%; font-size: 1rem; padding: 0.875rem; justify-content: center; }
                }
            `}</style>

            {/* Sticky top progress bar */}
            <div className="lesson-progress-bar">
                <div className="lesson-progress-fill" style={{ width: `${scrollPct}%` }} />
            </div>

            {/* Breadcrumb */}
            <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                <Link to="/" style={{
                    color: 'var(--text-muted)', textDecoration: 'none',
                    fontSize: '0.85rem', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    ← Dashboard
                </Link>
            </div>

            {/* Header Card */}
            <div className="card card-padding animate-fade-in-up" style={{
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(56,189,248,0.06) 100%)',
                borderColor: 'rgba(129,140,248,0.2)',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: -40, right: -40,
                    width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">📖 Lesson</span>
                    {topic.subject && (
                        <span className="badge" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', fontSize: '0.72rem' }}>
                            {topic.subject}
                        </span>
                    )}
                </div>

                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
                    fontWeight: 800, margin: '0 0 1.5rem',
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)', lineHeight: 1.2
                }}>
                    {topic.title}
                </h1>

                {/* Progress row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Reading progress</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>{scrollPct}%</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${scrollPct}%`, transition: 'width 0.3s ease' }} />
                </div>
            </div>

            {/* ── MAIN LESSON CONTENT ── */}
            <div ref={contentRef} className="card animate-fade-in-up" style={{
                padding: '2rem 2.25rem',
                marginBottom: '1.5rem',
                animationDelay: '0.1s', animationFillMode: 'both'
            }}>
                {/* Section label */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    marginBottom: '1.75rem', paddingBottom: '1.25rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)'
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '0.625rem',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(56,189,248,0.2))',
                        border: '1px solid rgba(129,140,248,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0
                    }}>📝</div>
                    <div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                            Lesson Material
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Read carefully — examples and formulas included
                        </div>
                    </div>
                </div>

                {/* Rich textbook renderer */}
                <RichContent content={topic.content} />
            </div>

            {/* ── VIDEO SECTION ── */}
            {topic.youtube_url ? (
                <div className="card animate-fade-in-up" style={{
                    padding: '1.75rem', marginBottom: '1.5rem',
                    animationDelay: '0.2s', animationFillMode: 'both'
                }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700,
                        color: 'var(--text-secondary)', margin: '0 0 1rem',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <span style={{
                            width: 24, height: 24, background: '#ff0000', borderRadius: '5px',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', flexShrink: 0
                        }}>▶</span>
                        Video Lesson
                    </h2>
                    <div className="lesson-video-wrap">
                        <iframe
                            src={topic.youtube_url}
                            title={topic.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>
            ) : (
                <div className="card animate-fade-in-up" style={{
                    padding: '1.5rem', marginBottom: '1.5rem',
                    animationDelay: '0.2s', animationFillMode: 'both',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '0.75rem', textAlign: 'center', padding: '1.5rem 0'
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
                        }}>🎬</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                            No video attached for this topic
                        </p>
                        <button
                            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.title + ' lesson Nigeria')}`, '_blank')}
                            style={{
                                padding: '0.5rem 1.1rem', fontSize: '0.82rem',
                                background: 'transparent', border: '1px solid rgba(129,140,248,0.35)',
                                color: '#818cf8', borderRadius: '0.5rem', cursor: 'pointer'
                            }}
                        >
                            Search YouTube ↗
                        </button>
                    </div>
                </div>
            )}

            {/* ── FOOTER CTA ── */}
            <div className="card lesson-cta animate-fade-in-up" style={{
                background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)',
                animationDelay: '0.3s', animationFillMode: 'both'
            }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                        Ready to test your knowledge?
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Score 65% or above to unlock the next topic
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/quiz/${topic.id}`)}
                    className="btn-success lesson-cta-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <span>Take Quiz</span>
                    <span style={{ fontSize: '1.2rem' }}>→</span>
                </button>
            </div>
        </div>
    );
}
