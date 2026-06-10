import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, BarChart3, Target, AlertTriangle, Settings, Clock, RotateCw, LogOut, Search, Award, BookOpen, Play } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StatCard({ icon, label, value, color }) {
    return (
        <div className="db-stat-card card glass-hover">
            <div className="db-stat-icon" style={{
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                {icon}
            </div>
            <div>
                <div className="db-stat-value" style={{ color, lineHeight: 1 }}>{value}</div>
                <div className="db-stat-label">{label}</div>
            </div>
        </div>
    );
}

function TopicCard({ topic, onStart, onQuiz, index }) {
    const isReview = topic.needsReview;
    const accentColor = isReview ? '#f87171' : '#818cf8';
    const bgColor = isReview ? 'rgba(248,113,113,0.06)' : 'rgba(129,140,248,0.06)';

    return (
        <div
            className="animate-fade-in-up"
            style={{
                background: bgColor,
                border: `1px solid ${accentColor}25`,
                borderRadius: '1.25rem',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'default',
                animationDelay: `${index * 0.08}s`,
                animationFillMode: 'both'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accentColor}20`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="badge" style={{
                    background: `${accentColor}15`, color: accentColor,
                    border: `1px solid ${accentColor}30`, fontSize: '0.7rem'
                }}>
                    {topic.subject}
                </span>
                {isReview && (
                    <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
                )}
            </div>

            {/* Title */}
            <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.15rem', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 0.5rem',
                lineHeight: 1.3
            }}>
                {topic.title}
            </h3>

            {/* Status */}
            {isReview ? (
                <p style={{ fontSize: '0.83rem', color: '#f87171', margin: '0 0 1.25rem', fontWeight: 500 }}>
                    Last score: <strong>{Math.round(topic.lastScore)}%</strong> — needs 65% to pass
                </p>
            ) : (
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
                    Continue where you left off
                </p>
            )}

            <div style={{ flex: 1 }} />

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button
                    onClick={() => onStart(topic.id)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: `linear-gradient(135deg, ${isReview ? '#dc2626, #f87171' : '#6366f1, #818cf8'})`,
                        border: 'none', borderRadius: '0.75rem',
                        color: 'white', fontWeight: 700,
                        fontSize: '0.9rem', cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 15px ${accentColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isReview ? <BookOpen size={16} /> : <Play size={16} />}
                    <span>{isReview ? 'Review Material' : 'Continue Lesson'}</span>
                </button>
                <button
                    onClick={() => onQuiz(topic.id)}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.3)',
                        borderRadius: '0.75rem',
                        color: '#34d399', fontWeight: 600,
                        fontSize: '0.82rem', cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; }}
                >
                    <span>Take Quiz</span>
                    <span>→</span>
                </button>
            </div>
        </div>
    );
}


export default function Dashboard() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await axios.get(`${API_URL}/api/courses/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setFetchError(err);
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'teacher') {
            navigate('/admin');
            return;
        }
        fetchDashboardData();
    }, [token, user]);

    const handleRetry = () => {
        setIsRetrying(true);
        fetchDashboardData();
    };

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="page-container">
                {/* Skeleton */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ height: 20, width: '60%' }} />
                </div>
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: '1rem' }} />)}
                </div>
                <div className="topics-grid">
                    {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: '1.25rem' }} />)}
                </div>
                {isRetrying && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
                        Connecting to backend... Please wait...
                    </p>
                )}
            </div>
        );
    }

    if (!data) {
        const isLiveFrontEnd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const isLocalBackend = API_URL.includes('localhost') || API_URL.includes('127.0.0.1');

        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', fontFamily: 'Inter, sans-serif' }}>
                <div className="card animate-fade-in-up" style={{ maxWidth: 600, width: '100%', padding: '2.5rem', border: '1px solid rgba(248, 113, 113, 0.25)', background: 'rgba(20, 10, 10, 0.45)', backdropFilter: 'blur(12px)', position: 'relative' }}>
                    
                    <div style={{ position: 'absolute', top: -30, left: 'calc(50% - 30px)', width: 60, height: 60, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }}>
                        <AlertTriangle size={28} color="#f87171" />
                    </div>

                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginTop: '1rem', marginBottom: '0.75rem', color: '#f87171' }}>
                        Connection Error
                    </h2>
                    
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                        We couldn't connect to the LearnSync ALMS backend server. 
                    </p>

                    {/* Diagnostics Panel */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Attempted Endpoint:</span>
                            <code style={{ color: '#818cf8', fontWeight: 'bold' }}>{API_URL}</code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Your Hostname:</span>
                            <code style={{ color: '#38bdf8' }}>{window.location.hostname}</code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Error Code:</span>
                            <span style={{ color: '#f87171' }}>{fetchError?.code || fetchError?.message || 'Network Error'}</span>
                        </div>
                    </div>

                    {/* Scenario Guidelines */}
                    {isLiveFrontEnd && isLocalBackend ? (
                        /* Case 1: Live site querying localhost */
                        <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.75rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Settings size={16} /> Missing Environment Variable</h4>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                Your live site is attempting to connect to a local server (<code>http://localhost:5000</code>). In your Render Dashboard under the <strong>Front-end Static Site settings</strong>:
                            </p>
                            <ol style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                                <li>Navigate to **Environment** tab.</li>
                                <li>Add variable: <code style={{ color: 'white' }}>VITE_API_URL</code>.</li>
                                <li>Set the value to your **deployed backend API URL** (e.g. <code>https://alms-backend.onrender.com</code>).</li>
                                <li>Click **Save Changes** and trigger a **Clear cache and deploy** build.</li>
                            </ol>
                        </div>
                    ) : (
                        /* Case 2: Render Free Tier backend sleep */
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.75rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={16} /> Render Free Tier Startup Delay</h4>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                On Render's free tier, the backend web service spins down automatically after 15 minutes of inactivity. When you visit after a break:
                            </p>
                            <ul style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                                <li>The server can take **50 seconds or more** to wake up.</li>
                                <li>During this time, requests will temporarily fail or time out.</li>
                                <li>Please wait about 30 seconds and click **Retry Connection** below.</li>
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                            onClick={handleRetry} 
                            className="btn-primary" 
                            style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <RotateCw size={16} />
                            <span>Retry Connection</span>
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={handleSignOut} 
                                className="btn-ghost" 
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            >
                                <LogOut size={14} />
                                <span>Sign Out / Reset</span>
                            </button>
                            <button 
                                onClick={() => window.open(`${API_URL}/api/debug`, '_blank')} 
                                className="btn-ghost" 
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            >
                                <Search size={14} />
                                <span>Test API URL</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .db-stat-card {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .db-stat-icon {
                    width: 50px; height: 50px;
                    border-radius: 0.875rem;
                    font-size: 1.4rem;
                    flex-shrink: 0;
                }
                .db-stat-value {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.75rem;
                    font-weight: 800;
                }
                .db-stat-label {
                    color: var(--text-muted);
                    font-size: 0.78rem;
                    margin-top: 0.2rem;
                    font-weight: 500;
                }

                .db-mastery-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.625rem;
                }
                .db-mastery-badges {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                @media (max-width: 640px) {
                    .db-stat-card {
                        padding: 1rem;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 0.5rem;
                    }
                    .db-stat-icon {
                        width: 38px; height: 38px;
                        border-radius: 0.625rem;
                        font-size: 1rem;
                    }
                    .db-stat-value { font-size: 1.4rem; }
                    .db-stat-label { font-size: 0.68rem; }

                    .db-mastery-row { flex-wrap: wrap; gap: 0.4rem; }
                    .db-mastery-badges { gap: 0.4rem; }

                    .topics-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 0.5rem !important;
                    }
                }

                @media (max-width: 380px) {
                    .db-stat-value { font-size: 1.2rem; }
                    .db-stat-label { font-size: 0.62rem; }
                }
            `}</style>

            {/* Hero */}
            <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                    fontWeight: 800, margin: '0 0 0.5rem',
                    letterSpacing: '-0.03em', lineHeight: 1.1
                }}>
                    Welcome back, <span className="gradient-text">{data.userName}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
                    Your adaptive learning journey continues. Keep pushing forward!
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard icon={<CheckCircle2 size={24} color="#34d399" />} label="Topics Completed"  value={data.stats?.completedTopics ?? 0} color="#34d399" />
                <StatCard icon={<BarChart3 size={24} color="#818cf8" />} label="Average Score"     value={`${data.stats?.avgScore ?? 0}%`} color="#818cf8" />
                <StatCard icon={<Target size={24} color="#38bdf8" />} label="Quiz Attempts"     value={data.stats?.totalAttempts ?? 0} color="#38bdf8" />
            </div>

            {/* Active Topics */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700,
                    color: 'var(--text-primary)', margin: '0 0 1.25rem', letterSpacing: '-0.01em'
                }}>
                    Active Topics
                </h2>

                {data.activeTopics.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                            All caught up!
                        </h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                            You have no pending topics. Great work!
                        </p>
                    </div>
                ) : (
                    <div className="topics-grid">
                        {data.activeTopics.map((topic, i) => (
                            <TopicCard key={topic.id} topic={topic} index={i} onStart={id => navigate(`/lesson/${id}`)} onQuiz={id => navigate(`/quiz/${id}`)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Subject Progress */}
            <div>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700,
                    color: 'var(--text-primary)', margin: '0 0 1.25rem', letterSpacing: '-0.01em'
                }}>
                    Subject Mastery
                </h2>
                <div className="card" style={{ padding: '2rem' }}>
                    {data.subjects.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>No subjects available yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {data.subjects.map((subject, i) => (
                                <div key={subject.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                                    <div className="db-mastery-row">
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {subject.name}
                                        </span>
                                        <div className="db-mastery-badges">
                                            <span style={{
                                                fontFamily: 'Outfit, sans-serif',
                                                fontWeight: 700, fontSize: '1rem',
                                                color: subject.completionRate >= 65 ? '#34d399' : '#818cf8'
                                            }}>
                                                {subject.completionRate}%
                                            </span>
                                            <span className="badge" style={{
                                                background: subject.completionRate === 100 ? 'rgba(52,211,153,0.15)' : 'rgba(129,140,248,0.12)',
                                                color: subject.completionRate === 100 ? '#34d399' : '#818cf8',
                                                border: `1px solid ${subject.completionRate === 100 ? 'rgba(52,211,153,0.3)' : 'rgba(129,140,248,0.25)'}`,
                                                fontSize: '0.7rem'
                                            }}>
                                                {subject.completionRate === 100 ? 'Mastered' : subject.completionRate > 0 ? 'In Progress' : 'Not Started'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${subject.completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
