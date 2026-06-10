import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Brain, BarChart3, Trophy, GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, form);
            login(res.data.user, res.data.token);
            navigate(res.data.user.role === 'teacher' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-layout">
            {/* Left — Brand Panel */}
            <div className="brand-panel">
                {/* Decorative orbs */}
                <div style={{
                    position: 'absolute', top: '10%', left: '10%',
                    width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(40px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', right: '5%',
                    width: 250, height: 250,
                    background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 360 }} className="animate-fade-in-up">
                    {/* Logo */}
                    <div className="logo-container-3d">
                        <GraduationCap size={36} color="white" />
                    </div>

                    <h1 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        margin: '0 0 0.5rem',
                        lineHeight: 1.1
                    }}>
                        <span className="glass-luminous-3d">LearnSync</span>
                        <br />
                        <span style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>ALMS</span>
                    </h1>

                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        marginBottom: '2rem'
                    }}>
                        Your personalized adaptive learning platform. Master topics at your own pace with intelligent guidance.
                    </p>

                    {/* Feature chips */}
                    {[
                        { icon: Brain, text: 'Adaptive Learning Engine', color: '#818cf8' },
                        { icon: BarChart3, text: 'Real-time Progress Tracking', color: '#38bdf8' },
                        { icon: Trophy, text: 'Mastery-Based Advancement', color: '#fbbf24' }
                    ].map((feat) => {
                        const IconComponent = feat.icon;
                        return (
                            <div key={feat.text} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                padding: '0.6rem 1rem',
                                marginBottom: '0.75rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                textAlign: 'left'
                            }}>
                                <IconComponent size={18} color={feat.color} style={{ flexShrink: 0 }} />
                                <span>{feat.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right — Login Form */}
            <div className="form-panel">
                <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in-up">
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '0 0 0.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Welcome back
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                        Sign in to continue your learning journey
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Your Name (Optional — overrides display name)
                            </label>
                            <input
                                id="login-name"
                                type="text"
                                placeholder="Enter your name to personalize your dashboard"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Email address
                            </label>
                            <input
                                id="login-email"
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
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                className="input-field"
                            />
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
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ marginTop: '0.5rem', padding: '0.9rem', fontSize: '1rem', width: '100%' }}
                        >
                            {loading ? 'Signing in...' : 'Sign in →'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{
                                color: 'var(--primary)',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                Create one free
                            </Link>
                        </p>
                    </div>

                    {/* Demo hint */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(129,140,248,0.06)',
                        border: '1px solid rgba(129,140,248,0.15)',
                        borderRadius: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                    }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Demo accounts:</strong>
                        <br />Student: student@alms.com / student123
                        <br />Teacher: teacher@alms.com / teacher123
                    </div>
                </div>
            </div>
        </div>
    );
}
