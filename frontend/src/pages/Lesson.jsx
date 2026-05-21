import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getVideoUrl = (title) => {
    if (!title) return null;
    const t = title.toLowerCase();
    if (t.includes('algebra')) return 'https://www.youtube.com/embed/NybHckSEQBI';
    if (t.includes('linear')) return 'https://www.youtube.com/embed/L71r6N81y1s';
    if (t.includes('photo')) return 'https://www.youtube.com/embed/CMiPYHNNg28';
    if (t.includes('cellular') || t.includes('respiration')) return 'https://www.youtube.com/embed/SrP5930gV_8';
    return null;
};

export default function Lesson() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [readProgress, setReadProgress] = useState(0);

    useEffect(() => {
        axios.get(`${API_URL}/api/courses/topic/${topicId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => { setTopic(res.data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }, [topicId, token]);

    // Simulate read progress when lesson loads
    useEffect(() => {
        if (!topic) return;
        const interval = setInterval(() => {
            setReadProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100; }
                return prev + 2;
            });
        }, 80);
        return () => clearInterval(interval);
    }, [topic]);

    if (loading) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div className="skeleton" style={{ height: 20, width: '20%', marginBottom: '2rem', borderRadius: '0.5rem' }} />
                <div className="skeleton" style={{ height: 48, width: '70%', marginBottom: '1rem', borderRadius: '0.5rem' }} />
                <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
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
        <div className="page-container" style={{ maxWidth: 820, fontFamily: 'Inter, sans-serif' }}>

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
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative orb */}
                <div style={{
                    position: 'absolute', top: -40, right: -40,
                    width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none'
                }} />

                <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                    📖 Lesson
                </span>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                    fontWeight: 800, margin: '0 0 1.25rem',
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)'
                }}>
                    {topic.title}
                </h1>

                {/* Read progress */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Reading progress</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{readProgress}%</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${readProgress}%`, transition: 'width 0.1s linear' }} />
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="card card-padding animate-fade-in-up" style={{
                marginBottom: '1.5rem',
                animationDelay: '0.1s', animationFillMode: 'both'
            }}>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.1rem', fontWeight: 700,
                    color: 'var(--text-secondary)',
                    margin: '0 0 1.25rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    📝 Lesson Material
                </h2>
                <div style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.9,
                    fontSize: '1rem',
                    whiteSpace: 'pre-wrap'
                }}>
                    {topic.content || 'No content available for this lesson yet.'}
                </div>
            </div>

            {/* Video Lesson */}
            <div className="card animate-fade-in-up" style={{
                padding: '1.75rem',
                marginBottom: '2rem',
                animationDelay: '0.2s', animationFillMode: 'both'
            }}>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.1rem', fontWeight: 700,
                    color: 'var(--text-secondary)',
                    margin: '0 0 1rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                    🎬 Video Lesson
                </h2>
                {getVideoUrl(topic.title) ? (
                    <div style={{
                        position: 'relative',
                        paddingBottom: '56.25%', // 16:9 Aspect Ratio
                        height: 0,
                        overflow: 'hidden',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
                    }}>
                        <iframe
                            src={getVideoUrl(topic.title)}
                            title={topic.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%', height: '100%'
                            }}
                        />
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '1rem',
                        padding: '2.5rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            🔍
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                                Custom Video Lesson
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0, maxWidth: 400 }}>
                                There is no direct video linked to this custom lesson. Click below to search YouTube for educational resources on this topic.
                            </p>
                        </div>
                        <button
                            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.title + ' educational lesson')}`, '_blank')}
                            className="btn-ghost"
                            style={{
                                padding: '0.6rem 1.25rem',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: '1px solid rgba(99,102,241,0.4)',
                                color: '#818cf8',
                                background: 'transparent',
                                cursor: 'pointer',
                                borderRadius: '0.5rem'
                            }}
                        >
                            Search YouTube ↗
                        </button>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="card flex-responsive animate-fade-in-up" style={{
                padding: '1.5rem 2rem',
                background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.15)',
                animationDelay: '0.3s', animationFillMode: 'both'
            }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        Ready to test your knowledge?
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Score 65% or above to advance to the next topic
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/quiz/${topic.id}`)}
                    className="btn-success"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}
                >
                    Take Quiz →
                </button>
            </div>
        </div>
    );
}
