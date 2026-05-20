import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Modal({ title, children, onClose }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }} className="animate-fade-in">
            <div className="card animate-fade-in-up" style={{
                width: '100%', maxWidth: 520,
                padding: '2rem',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none',
                        color: 'var(--text-secondary)', width: 32, height: 32,
                        borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1.1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState(null);

    // Modal states
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState(null);

    const [subjectName, setSubjectName] = useState('');
    const [topicForm, setTopicForm] = useState({ subject_id: '', title: '', content: '' });
    const [quizForm, setQuizForm] = useState({ question: '', optA: '', optB: '', optC: '', optD: '', correct_answer: '' });
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/dashboard`, { headers });
            setData(res.data);
            if (res.data.subjects.length > 0) setActiveSubject(res.data.subjects[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const flash = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/admin/subject`, { name: subjectName }, { headers });
            setSubjectName('');
            setShowSubjectModal(false);
            flash('Subject created!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed');
        } finally { setSaving(false); }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/admin/topic`, {
                subject_id: topicForm.subject_id || activeSubject,
                title: topicForm.title,
                content: topicForm.content
            }, { headers });
            setTopicForm({ subject_id: '', title: '', content: '' });
            setShowTopicModal(false);
            flash('Topic created!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed');
        } finally { setSaving(false); }
    };

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        setSaving(true);
        const options = [quizForm.optA, quizForm.optB, quizForm.optC, quizForm.optD].filter(Boolean);
        try {
            await axios.post(`${API_URL}/api/admin/topic/${selectedTopicId}/quiz`, {
                question: quizForm.question,
                options,
                correct_answer: quizForm.correct_answer
            }, { headers });
            setQuizForm({ question: '', optA: '', optB: '', optC: '', optD: '', correct_answer: '' });
            setShowQuizModal(false);
            flash('Quiz question added!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed');
        } finally { setSaving(false); }
    };

    const handleDeleteTopic = async (topicId) => {
        if (!confirm('Delete this topic and all its quizzes?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/topic/${topicId}`, { headers });
            flash('Topic deleted.');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '3px solid rgba(129,140,248,0.2)',
                        borderTopColor: '#818cf8',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    const currentSubject = data?.subjects.find(s => s.id === activeSubject);

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'Inter, sans-serif' }}>

            {/* Success Toast */}
            {successMsg && (
                <div className="animate-fade-in" style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
                    background: 'rgba(52,211,153,0.15)',
                    border: '1px solid rgba(52,211,153,0.4)',
                    borderRadius: '0.75rem', padding: '0.75rem 1.25rem',
                    color: '#34d399', fontWeight: 600, fontSize: '0.875rem'
                }}>
                    ✓ {successMsg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                        <span className="gradient-text">Admin Panel</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage subjects, topics, and quiz content</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>👋 {user?.name}</span>
                    <button onClick={() => { logout(); navigate('/login'); }} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                        Sign out
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Subjects', value: data?.subjects.length ?? 0, icon: '📚', color: '#818cf8' },
                    { label: 'Total Topics', value: data?.subjects.reduce((acc, s) => acc + s.topics.length, 0) ?? 0, icon: '📖', color: '#38bdf8' },
                    { label: 'Enrolled Students', value: data?.studentCount ?? 0, icon: '🎓', color: '#34d399' },
                ].map((stat) => (
                    <div key={stat.label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '1rem',
                            background: `${stat.color}18`,
                            border: `1px solid ${stat.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', flexShrink: 0
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>

                {/* Sidebar — Subjects */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</h3>
                        <button onClick={() => setShowSubjectModal(true)} style={{
                            background: 'rgba(129,140,248,0.15)',
                            border: '1px solid rgba(129,140,248,0.3)',
                            color: '#818cf8', borderRadius: '0.5rem',
                            padding: '0.3rem 0.6rem', fontSize: '0.8rem',
                            cursor: 'pointer', fontWeight: 600
                        }}>+ Add</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data?.subjects.map(subject => (
                            <button
                                key={subject.id}
                                onClick={() => setActiveSubject(subject.id)}
                                style={{
                                    width: '100%', textAlign: 'left',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '0.875rem',
                                    border: activeSubject === subject.id
                                        ? '1px solid rgba(129,140,248,0.5)'
                                        : '1px solid var(--border)',
                                    background: activeSubject === subject.id
                                        ? 'rgba(129,140,248,0.12)'
                                        : 'var(--surface)',
                                    color: activeSubject === subject.id ? '#818cf8' : 'var(--text-primary)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    fontFamily: 'Inter, sans-serif', fontWeight: 500,
                                    fontSize: '0.9rem'
                                }}
                            >
                                {subject.name}
                                <span style={{
                                    display: 'block', fontSize: '0.75rem',
                                    color: 'var(--text-muted)', marginTop: '0.2rem'
                                }}>
                                    {subject.topics.length} topic{subject.topics.length !== 1 ? 's' : ''}
                                </span>
                            </button>
                        ))}
                        {data?.subjects.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No subjects yet.</p>
                        )}
                    </div>
                </div>

                {/* Main — Topics Panel */}
                <div>
                    {currentSubject ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                    {currentSubject.name}
                                    <span style={{ marginLeft: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>— Topics</span>
                                </h2>
                                <button
                                    onClick={() => { setTopicForm({ ...topicForm, subject_id: currentSubject.id }); setShowTopicModal(true); }}
                                    className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
                                >
                                    + Add Topic
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {currentSubject.topics.map((topic, i) => (
                                    <div key={topic.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <span style={{
                                                        width: 28, height: 28,
                                                        background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                                                        borderRadius: '0.5rem',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0
                                                    }}>{i + 1}</span>
                                                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                                                        {topic.title}
                                                    </h4>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '2.5rem' }}>
                                                    <span className="badge badge-primary">
                                                        {topic.quiz_count} quiz question{topic.quiz_count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                                                <button
                                                    onClick={() => { setSelectedTopicId(topic.id); setShowQuizModal(true); }}
                                                    style={{
                                                        background: 'rgba(56,189,248,0.12)',
                                                        border: '1px solid rgba(56,189,248,0.3)',
                                                        color: '#38bdf8', borderRadius: '0.5rem',
                                                        padding: '0.4rem 0.8rem', fontSize: '0.8rem',
                                                        cursor: 'pointer', fontWeight: 600
                                                    }}
                                                >
                                                    + Quiz Q
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTopic(topic.id)}
                                                    style={{
                                                        background: 'rgba(248,113,113,0.1)',
                                                        border: '1px solid rgba(248,113,113,0.25)',
                                                        color: '#f87171', borderRadius: '0.5rem',
                                                        padding: '0.4rem 0.7rem', fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {currentSubject.topics.length === 0 && (
                                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                        <p style={{ color: 'var(--text-muted)' }}>No topics yet. Add one to get started.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                            <p style={{ color: 'var(--text-muted)' }}>Select a subject or create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ────────────────────────────────────── */}

            {showSubjectModal && (
                <Modal title="Add New Subject" onClose={() => setShowSubjectModal(false)}>
                    <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Subject Name</label>
                            <input id="subject-name-input" value={subjectName} onChange={e => setSubjectName(e.target.value)} required placeholder="e.g. Mathematics" className="input-field" />
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%' }}>
                            {saving ? 'Creating...' : 'Create Subject'}
                        </button>
                    </form>
                </Modal>
            )}

            {showTopicModal && (
                <Modal title="Add New Topic" onClose={() => setShowTopicModal(false)}>
                    <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Topic Title</label>
                            <input id="topic-title-input" value={topicForm.title} onChange={e => setTopicForm({ ...topicForm, title: e.target.value })} required placeholder="e.g. Algebra Fundamentals" className="input-field" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Lesson Content</label>
                            <textarea
                                id="topic-content-input"
                                value={topicForm.content}
                                onChange={e => setTopicForm({ ...topicForm, content: e.target.value })}
                                placeholder="Write the lesson material here..."
                                className="input-field"
                                rows={5}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%' }}>
                            {saving ? 'Creating...' : 'Create Topic'}
                        </button>
                    </form>
                </Modal>
            )}

            {showQuizModal && (
                <Modal title="Add Quiz Question" onClose={() => setShowQuizModal(false)}>
                    <form onSubmit={handleAddQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Question</label>
                            <input id="quiz-question-input" value={quizForm.question} onChange={e => setQuizForm({ ...quizForm, question: e.target.value })} required placeholder="Type your question here" className="input-field" />
                        </div>
                        {['optA', 'optB', 'optC', 'optD'].map((key, i) => (
                            <div key={key}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Option {String.fromCharCode(65 + i)}</label>
                                <input id={`quiz-${key}`} value={quizForm[key]} onChange={e => setQuizForm({ ...quizForm, [key]: e.target.value })} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="input-field" required />
                            </div>
                        ))}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Correct Answer (must match one option exactly)</label>
                            <input id="quiz-correct-answer" value={quizForm.correct_answer} onChange={e => setQuizForm({ ...quizForm, correct_answer: e.target.value })} required placeholder="Paste the exact correct option here" className="input-field" />
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                            {saving ? 'Saving...' : 'Add Question'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
