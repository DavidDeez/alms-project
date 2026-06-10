import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CrestLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', opacity: 0.85 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M12 6v10"/>
        <path d="M8 10h8"/>
        <circle cx="12" cy="11" r="2.5" fill="var(--panel-border)"/>
    </svg>
);

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
);

const SmartphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
        <path d="M12 18h.01"/>
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // UI Portal Mode: 'select', 'student-login', or 'teacher-login'
    const [mode, setMode] = useState('select');
    
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Live typewriter log stream
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const mockLogs = [
            "[09:49:54] [WARN] Unverified access attempt blocked.",
            "[09:49:55] Evaluating prompt safety thresholds...",
            "[09:49:56] Syncing offline cache matrices...",
            "[09:49:58] [OK] Database nodes synchronized.",
            "[09:49:59] [OK] Security certificates verified.",
            "[09:50:00] [OK] LearnSync ALMS system ready.",
            "[09:50:01] Listening on port 5000...",
            "[09:50:02] [WARN] Intrusion alert system enabled.",
            "[09:50:04] Syncing offline learning caches...",
            "[09:50:05] [OK] Mastery engines operational."
        ];
        let currentIdx = 0;
        const interval = setInterval(() => {
            if (currentIdx < mockLogs.length) {
                setLogs(prev => [...prev, mockLogs[currentIdx]]);
                currentIdx++;
            } else {
                clearInterval(interval);
            }
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    const handleEnterPortal = (role) => {
        setError('');
        setForm({ email: '', password: '', name: '' });
        setMode(role === 'student' ? 'student-login' : 'teacher-login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                email: form.email,
                password: form.password,
                name: form.name,
                role: mode === 'student-login' ? 'student' : 'teacher'
            };
            const res = await axios.post(`${API_URL}/api/auth/login`, payload);
            login(res.data.user, res.data.token);
            navigate(res.data.user.role === 'teacher' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-family)',
            backgroundColor: 'var(--bg-dark)'
        }} className="crt-screen">

            {/* Header / Brand Badge Top-Left */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                alignSelf: 'flex-start',
                zIndex: 10
            }}>
                <CrestLogo />
                <div>
                    <div className="monospace" style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: 'var(--primary)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase'
                    }}>
                        University of Ibadan
                    </div>
                    <div className="monospace" style={{
                        fontSize: '0.65rem',
                        color: 'var(--danger)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontWeight: 600
                    }}>
                        ICT Cyber Security Department
                    </div>
                </div>
            </div>

            {/* Central Platform Title & Selection / Portal Forms */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                width: '100%',
                margin: '2rem 0'
            }}>
                
                {/* Center Brain Icon */}
                {mode === 'select' && (
                    <div style={{
                        width: 72,
                        height: 72,
                        border: '1px solid var(--panel-border)',
                        background: 'var(--panel-bg)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}>
                        <BrainIcon />
                    </div>
                )}

                {/* Center Main Header */}
                {mode === 'select' && (
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 className="glitch" style={{
                            fontSize: '2.8rem',
                            fontWeight: 900,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            margin: '0 0 0.5rem',
                            color: 'var(--primary)',
                            textShadow: '0 0 8px rgba(240, 246, 252, 0.15)'
                        }}>
                            LearnSync ALMS
                        </h1>
                        <div className="monospace" style={{
                            fontSize: '0.8rem',
                            color: 'var(--danger)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            fontWeight: 700
                        }}>
                            Adaptive Learning Infrastructure
                        </div>
                    </div>
                )}

                {/* Portal selection mode */}
                {mode === 'select' && (
                    <div className="topics-grid" style={{
                        maxWidth: '800px',
                        width: '100%',
                        gap: '1.5rem',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                    }}>
                        {/* Student Card */}
                        <div className="card glass-hover" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            borderRadius: '8px',
                            background: 'var(--panel-bg)',
                            border: '1px solid var(--panel-border)'
                        }}>
                            <div style={{
                                width: 50, height: 50,
                                border: '1px solid var(--panel-border)',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <SmartphoneIcon />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--primary)' }}>
                                Student Portal
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 2rem' }}>
                                Access course nodes, track syllabus masteries, and complete recommendation quizzes.
                            </p>
                            <button
                                onClick={() => handleEnterPortal('student')}
                                className="btn-primary monospace"
                                style={{ marginTop: 'auto', width: '100%', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
                            >
                                Enter <span>&gt;</span>
                            </button>
                        </div>

                        {/* Faculty/Teacher Card */}
                        <div className="card glass-hover" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            borderRadius: '8px',
                            background: 'var(--panel-bg)',
                            border: '1px solid var(--panel-border)'
                        }}>
                            <div style={{
                                width: 50, height: 50,
                                border: '1px solid var(--panel-border)',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '6px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <ShieldIcon />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--primary)' }}>
                                Faculty Dashboard
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 2rem' }}>
                                Secure administrative interface to configure syllabus paths, map topics, and generate quizzes.
                            </p>
                            <button
                                onClick={() => handleEnterPortal('teacher')}
                                className="btn-primary monospace"
                                style={{ marginTop: 'auto', width: '100%', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}
                            >
                                Enter <span>&gt;</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Login Form view (slides in when selection is clicked) */}
                {mode !== 'select' && (
                    <div className="card animate-fade-in-up" style={{
                        maxWidth: '420px',
                        width: '100%',
                        padding: '2.25rem 2rem',
                        background: 'var(--panel-bg)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}>
                        {/* Back navigation */}
                        <button
                            onClick={() => setMode('select')}
                            className="monospace"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                padding: 0,
                                marginBottom: '1.5rem',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            &lt; Back to selection
                        </button>

                        <div className="monospace" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                            // SECURE PORTAL TERMINAL
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--primary)' }}>
                            {mode === 'student-login' ? 'Student Login' : 'Faculty Access'}
                        </h2>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                            Identify user credentials to establish session node authentication.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Full Name (Optional)
                                </label>
                                <input
                                    id="login-name"
                                    type="text"
                                    placeholder="Personalization display override"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="Enter authorization email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Password
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="Enter security password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="input-field"
                                />
                            </div>

                            {error && (
                                <div className="monospace" style={{
                                    background: 'rgba(248,81,115,0.06)',
                                    border: '1px solid var(--danger)',
                                    borderRadius: '6px',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--danger)',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.02em'
                                }}>
                                    [ERR] {error}
                                </div>
                            )}

                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="btn-primary monospace"
                                style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '0.8rem', width: '100%', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                            >
                                {loading ? 'Establishing Link...' : 'Execute Authenticate →'}
                            </button>
                        </form>

                        {/* Demo reference helper */}
                        <div className="monospace" style={{
                            marginTop: '1.5rem',
                            padding: '0.85rem 1rem',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid var(--panel-border)',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.5
                        }}>
                            <strong style={{ color: 'var(--text-main)' }}>// DEMO PORTS:</strong>
                            <br />Student: student@alms.com / student123
                            <br />Teacher: teacher@alms.com / teacher123
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Section: Hacker Terminal Logs & Developer Crest */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                width: '100%',
                zIndex: 5,
                marginTop: 'auto'
            }}>
                {/* Live Hacker Terminal Logs in Bottom Left */}
                <div className="monospace" style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    opacity: 0.35,
                    maxHeight: '120px',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    textAlign: 'left',
                    width: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    gap: '0.25rem'
                }}>
                    {logs.slice(-5).map((log, idx) => (
                        <div key={idx} className="animate-fade-in">&gt; {log}</div>
                    ))}
                </div>

                {/* Developer Credit Bottom Center/Right */}
                <div className="monospace" style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textAlign: 'right'
                }}>
                    Developed by David Olukayode
                </div>
            </div>

        </div>
    );
}
