import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Rocket, GraduationCap, AlertTriangle } from 'lucide-react';

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
                <div className="brand-orb" style={{
                    position: 'absolute', top: '20%', right: '0%',
                    width: 280, height: 280,
                    background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(40px)'
                }} />
                <div className="brand-orb" style={{
                    position: 'absolute', bottom: '10%', left: '0%',
                    width: 220, height: 220,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 340 }} className="animate-fade-in-up">
                    {/* Logo */}
                    <div className="logo-container-3d">
                        <GraduationCap size={36} color="white" />
                    </div>

                    <h1 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2.4rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        margin: '0 0 0.5rem',
                        lineHeight: 1.1
                    }}>
                        <span className="glass-luminous-3d">LearnSync ALMS</span>
                    </h1>

                    <p style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 300,
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        color: '#cbd5e1',
                        marginBottom: '2rem'
                    }}>
                        ᴍᴀꜱᴛᴇʀ ᴛᴏᴘɪᴄꜱ ᴀᴛ ʏᴏᴜʀ ᴏᴡɴ ᴘᴀᴄᴇ ᴡɪᴛʜ ɪɴᴛᴇʟʟɪɢᴇɴᴛ ɢᴜɪᴅᴀɴᴄᴇ.
                    </p>

                    <div className="hide-on-mobile" style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        borderRadius: '1rem',
                        padding: '1.25rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                            Choose <strong style={{ color: '#818cf8' }}>Student</strong> to start learning.<br />
                            Choose <strong style={{ color: '#38bdf8' }}>Teacher</strong> to manage content and create quizzes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right — Register Form */}
            <div className="form-panel">
                <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in-up">
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.6rem', fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '0 0 1.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Create your account
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                                Full Name
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Your name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                                Email Address
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
                            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
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
                            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                I am a...
                            </label>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                {['student', 'teacher'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        id={`role-${r}`}
                                        onClick={() => setForm({ ...form, role: r })}
                                        style={{
                                            flex: 1,
                                            padding: '0.6rem',
                                            borderRadius: '0.75rem',
                                            border: form.role === r
                                                ? '2px solid var(--primary)'
                                                : '2px solid var(--border)',
                                            background: form.role === r
                                                ? 'rgba(129,140,248,0.12)'
                                                : 'rgba(255,255,255,0.04)',
                                            color: form.role === r ? 'var(--primary)' : 'var(--text-secondary)',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {r === 'student' ? 'Student' : 'Teacher'}
                                    </button>
                                ))}
                            </div>
                        </div>

                         {error && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.3)',
                                borderRadius: '0.75rem',
                                padding: '0.7rem 0.85rem',
                                color: '#f87171',
                                fontSize: '0.825rem'
                            }}>
                                <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ marginTop: '0.4rem', padding: '0.7rem', fontSize: '0.9rem', width: '100%' }}
                        >
                            {loading ? 'Creating account...' : 'Create account →'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
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
