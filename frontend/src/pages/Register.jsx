import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, form);
            navigate('/login', { state: { message: 'Account created! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-layout">
            {/* Left — Brand Panel */}
            <div className="brand-panel">
                <div style={{
                    position: 'absolute', top: '20%', right: '0%',
                    width: 280, height: 280,
                    background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(40px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', left: '0%',
                    width: 220, height: 220,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 340 }} className="animate-fade-in-up">
                    <div style={{
                        width: 72, height: 72,
                        background: 'var(--panel-bg)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem',
                        fontSize: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        🚀
                    </div>

                    <h1 style={{
                        fontSize: '2.1rem',
                        fontWeight: 800,
                        margin: '0 0 0.5rem',
                        lineHeight: 1.1
                    }}>
                        <span className="gradient-text glitch" style={{ letterSpacing: '0.05em' }}>ᴊᴏɪɴ ʟᴇᴀʀɴꜱʏɴᴄ</span>
                        <br />
                        <span style={{ color: 'var(--primary)', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '0.05em' }}>ᴀʟᴍꜱ</span>
                    </h1>

                    <div className="monospace" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                        // ᴄʀᴇᴀᴛᴇ ᴀᴄᴄᴏᴜɴᴛ ᴄʀᴇᴅᴇɴᴛɪᴀʟꜱ
                    </div>

                    <p style={{
                        color: 'var(--text-main)', fontSize: '0.92rem',
                        lineHeight: 1.7, marginBottom: '2rem'
                    }}>
                        Establish your access nodes. Acquire personalized syllabus tracking indices and system recommendation metrics.
                    </p>

                    <div style={{
                        background: 'var(--panel-bg)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        padding: '1.25rem'
                    }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                            Choose <strong style={{ color: 'var(--primary)' }}>Student</strong> to begin coursework.<br />
                            Choose <strong style={{ color: 'var(--primary)' }}>Teacher</strong> to configure subjects and author quizzes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right — Register Form */}
            <div className="form-panel">
                <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in-up">
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2rem', fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '0 0 0.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Create your account
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                        Free to join — no credit card needed
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Full name
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Your full name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Email address
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Password
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={6}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                I am a...
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {['student', 'teacher'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        id={`role-${r}`}
                                        onClick={() => setForm({ ...form, role: r })}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: form.role === r
                                                ? '2px solid var(--primary)'
                                                : '2px solid var(--border)',
                                            background: form.role === r
                                                ? 'rgba(129,140,248,0.12)'
                                                : 'rgba(255,255,255,0.04)',
                                            color: form.role === r ? 'var(--primary)' : 'var(--text-secondary)',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {r === 'student' ? '🎓 Student' : '🧑‍🏫 Teacher'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.3)',
                                borderRadius: '0.75rem',
                                padding: '0.75rem 1rem',
                                color: '#f87171',
                                fontSize: '0.875rem'
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '1rem', width: '100%' }}
                        >
                            {loading ? 'Creating account...' : 'Create account →'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
