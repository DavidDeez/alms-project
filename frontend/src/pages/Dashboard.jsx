import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StatCard({ icon, label, value, color }) {
    return (
        <div className="card glass-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: 50, height: 50, borderRadius: '0.875rem',
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', flexShrink: 0
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>
                    {value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem', fontWeight: 500 }}>
                    {label}
                </div>
            </div>
        </div>
    );
}

function TopicCard({ topic, onStart, index }) {
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
                    <span style={{ fontSize: '1.3rem' }}>⚠️</span>
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

            {/* CTA Button */}
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
                    boxShadow: `0 4px 15px ${accentColor}30`
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isReview ? '📖 Review Material' : '▶ Continue Lesson'}
            </button>
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
                    
                    <div style={{ position: 'absolute', top: -30, left: 'calc(50% - 30px)', width: 60, height: 60, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }}>
                        ⚠️
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
                            <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8', fontSize: '0.9rem', fontWeight: 700 }}>⚙️ Missing Environment Variable</h4>
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
                            <h4 style={{ margin: '0 0 0.5rem', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 700 }}>⏳ Render Free Tier Startup Delay</h4>
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
                            style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}
                        >
                            🔄 Retry Connection
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={handleSignOut} 
                                className="btn-ghost" 
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                            >
                                🚪 Sign Out / Reset Session
                            </button>
                            <button 
                                onClick={() => window.open(`${API_URL}/api/debug`, '_blank')} 
                                className="btn-ghost" 
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                            >
                                🔍 Test API URL directly
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* Hero */}
            <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                    fontWeight: 800, margin: '0 0 0.5rem',
                    letterSpacing: '-0.03em', lineHeight: 1.1
                }}>
                    Welcome back, <span className="gradient-text">{data.userName}</span> 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
                    Your adaptive learning journey continues. Keep pushing forward!
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard icon="✅" label="Topics Completed"  value={data.stats?.completedTopics ?? 0} color="#34d399" />
                <StatCard icon="📊" label="Average Score"     value={`${data.stats?.avgScore ?? 0}%`} color="#818cf8" />
                <StatCard icon="🎯" label="Quiz Attempts"     value={data.stats?.totalAttempts ?? 0} color="#38bdf8" />
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
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
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
                            <TopicCard key={topic.id} topic={topic} index={i} onStart={id => navigate(`/lesson/${id}`)} />
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {subject.name}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
