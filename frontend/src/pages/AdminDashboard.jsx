import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, Library, BookOpen, GraduationCap, Sliders, Sparkles, Trash2, FileText, Activity, Trash } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Modal({ title, children, onClose }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
        }} className="animate-fade-in">
            <div className="card animate-fade-in-up" style={{
                width: '100%', maxWidth: 520,
                padding: '1.5rem',
                position: 'relative',
                margin: 'auto'
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

    // Tab states
    const [activeTab, setActiveTab] = useState('content'); // 'content' or 'settings'

    // Modal states
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [generatingId, setGeneratingId] = useState(null);

    const [subjectName, setSubjectName] = useState('');
    const [topicForm, setTopicForm] = useState({ subject_id: '', title: '', content: '', youtube_url: '' });
    const [quizForm, setQuizForm] = useState({ question: '', optA: '', optB: '', optC: '', optD: '', correct_answer: '' });
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // AI Settings states
    const [aiStatus, setAiStatus] = useState({ configured: false, model: '', available_models: [] });
    const [selectedModel, setSelectedModel] = useState('');
    const [defaultQuestionCount, setDefaultQuestionCount] = useState(5);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState(null);

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

    const fetchAIStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/ai-status`, { headers });
            setAiStatus(res.data);
            setSelectedModel(res.data.model || 'google/gemini-2.5-flash');
            setDefaultQuestionCount(res.data.questionCount || 5);
            // Show masked key from server if it exists
            if (res.data.apiKey) setApiKeyInput(res.data.apiKey);
        } catch (err) {
            console.error('Failed to fetch AI status:', err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchAIStatus();
    }, []);

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
                content: topicForm.content,
                youtube_url: topicForm.youtube_url || null
            }, { headers });
            setTopicForm({ subject_id: '', title: '', content: '', youtube_url: '' });
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

    const handleGenerateAIQuiz = async (topicId) => {
        setGeneratingId(topicId);
        try {
            const currentModel = localStorage.getItem('alms_ai_model') || selectedModel || 'google/gemini-2.5-flash';
            const currentCount = parseInt(localStorage.getItem('alms_ai_question_count')) || defaultQuestionCount || 5;

            const res = await axios.post(`${API_URL}/api/admin/topic/${topicId}/generate-quiz`, {
                model: currentModel,
                questionCount: currentCount
            }, { headers });
            flash(res.data.message || 'AI Quiz generated!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to generate AI Quiz. Make sure OPENROUTER_API_KEY is configured.');
        } finally {
            setGeneratingId(null);
        }
    };

    const handleSaveAISettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const payload = {
                model: selectedModel,
                questionCount: defaultQuestionCount,
            };
            // Only include API key if user typed a real value (not the masked placeholder)
            if (apiKeyInput && !apiKeyInput.includes('...')) {
                payload.apiKey = apiKeyInput;
            }
            await axios.post(`${API_URL}/api/admin/ai-settings`, payload, { headers });
            flash('AI Settings saved successfully!');
            // Refresh status to show updated masked key & configured state
            fetchAIStatus();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save AI settings.');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleTestAIConnection = async () => {
        setTestingConnection(true);
        setTestResult(null);
        try {
            const res = await axios.post(`${API_URL}/api/admin/test-ai`, { model: selectedModel }, { headers });
            if (res.data.ok) {
                setTestResult({ success: true, message: `Connected successfully! Response: "${res.data.message}"` });
            } else {
                setTestResult({ success: false, message: `Failed to connect: ${res.data.error || ''}` });
            }
        } catch (err) {
            setTestResult({ success: false, message: err.response?.data?.error || err.message || 'Failed to connect.' });
        } finally {
            setTestingConnection(false);
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
                    <p style={{ color: 'var(--text-secondary)' }}>Loading teacher panel...</p>
                </div>
            </div>
        );
    }

    const currentSubject = data?.subjects.find(s => s.id === activeSubject);

    return (
        <div className="page-container" style={{ maxWidth: 1100, fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .tp-tab-bar {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    padding-bottom: 2px;
                    flex-wrap: nowrap;
                }
                .tp-tab-bar::-webkit-scrollbar { display: none; }
                .tp-tab-bar button { flex-shrink: 0; white-space: nowrap; }

                .tp-subject-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .tp-topic-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                    gap: 0.75rem;
                }

                .tp-ai-card {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .tp-ai-status {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border);
                    border-radius: 1rem;
                    padding: 1.25rem 1.5rem;
                    margin-bottom: 2rem;
                }

                .tp-save-row {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    border-top: 1px solid var(--border);
                    padding-top: 1.5rem;
                    margin-top: 1rem;
                }

                .tp-topic-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-shrink: 0;
                    margin-left: 1rem;
                    flex-wrap: nowrap;
                }

                .tp-modal-body {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                @media (max-width: 640px) {
                    .tp-ai-card { margin: 0; }

                    .tp-ai-status { flex-direction: column; align-items: flex-start; }

                    .tp-save-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .tp-save-row button {
                        width: 100% !important;
                        justify-content: center;
                    }

                    .tp-topic-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .tp-topic-header button {
                        width: 100%;
                        justify-content: center;
                    }

                    .tp-topic-buttons {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr;
                        margin-left: 0 !important;
                        width: 100% !important;
                        gap: 0.4rem !important;
                    }
                    .tp-topic-buttons button:last-child:nth-child(odd) {
                        grid-column: 1 / -1;
                    }

                    .tp-subject-header button { font-size: 0.78rem; }
                }

                @media (max-width: 400px) {
                    .tp-tab-bar button { padding: 0.5rem 0.8rem !important; font-size: 0.78rem; }
                }
            `}</style>

            {/* Success Toast */}
            {successMsg && (
                <div className="animate-fade-in" style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
                    background: 'rgba(52,211,153,0.08)',
                    border: '1px solid rgba(52,211,153,0.25)',
                    borderRadius: '0.75rem', padding: '0.75rem 1.25rem',
                    color: '#34d399', fontWeight: 600, fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(52,211,153,0.1)'
                }}>
                    <Check size={16} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                    <span className="gradient-text">Teacher Panel</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage subjects, topics, and quiz content</p>
            </div>

            {/* Stats Row */}
            <div className="stats-grid">
                {[
                    { label: 'Total Subjects', value: data?.subjects.length ?? 0, icon: <Library size={24} color="#818cf8" />, color: '#818cf8' },
                    { label: 'Total Topics', value: data?.subjects.reduce((acc, s) => acc + s.topics.length, 0) ?? 0, icon: <BookOpen size={24} color="#38bdf8" />, color: '#38bdf8' },
                    { label: 'Enrolled Students', value: data?.studentCount ?? 0, icon: <GraduationCap size={24} color="#34d399" />, color: '#34d399' },
                ].map((stat) => (
                    <div key={stat.label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '1rem',
                            background: `${stat.color}18`,
                            border: `1px solid ${stat.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
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

            {/* Tab Switcher */}
            <div className="tp-tab-bar">
                <button
                    onClick={() => setActiveTab('content')}
                    style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: activeTab === 'content' ? '1px solid rgba(129,140,248,0.4)' : '1px solid var(--border)',
                        background: activeTab === 'content' ? 'rgba(129,140,248,0.1)' : 'var(--surface)',
                        color: activeTab === 'content' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <Library size={16} /><span>Content Manager</span>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: activeTab === 'settings' ? '1px solid rgba(129,140,248,0.4)' : '1px solid var(--border)',
                        background: activeTab === 'settings' ? 'rgba(129,140,248,0.1)' : 'var(--surface)',
                        color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <Sliders size={16} /><span>AI Settings</span>
                </button>
            </div>

            {/* Main Content */}
            {activeTab === 'content' && (
                <div className="admin-grid">

                {/* Sidebar — Subjects */}
                <div>
                    <div className="tp-subject-header">
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</h3>
                        <button onClick={() => setShowSubjectModal(true)} style={{
                            background: 'rgba(129,140,248,0.15)',
                            border: '1px solid rgba(129,140,248,0.3)',
                            color: '#818cf8', borderRadius: '0.5rem',
                            padding: '0.3rem 0.6rem', fontSize: '0.8rem',
                            cursor: 'pointer', fontWeight: 600
                        }}>+ Add</button>
                    </div>

                    <div className="subject-sidebar-list">
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
                            <div className="tp-topic-header">
                                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                    {currentSubject.name}
                                    <span style={{ marginLeft: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>— Topics</span>
                                </h2>
                                <button
                                    onClick={() => { setTopicForm({ ...topicForm, subject_id: currentSubject.id }); setShowTopicModal(true); }}
                                    className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
                                >
                                    + Add Topic
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {currentSubject.topics.map((topic, i) => (
                                    <div key={topic.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                                        <div className="topic-card-inner">
                                            <div style={{ flex: 1, width: '100%' }}>
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
                                                <div className="topic-card-badge-container">
                                                    <span className="badge badge-primary">
                                                        {topic.quiz_count} quiz question{topic.quiz_count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="tp-topic-buttons">
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
                                                    onClick={() => handleGenerateAIQuiz(topic.id)}
                                                    disabled={generatingId === topic.id}
                                                    style={{
                                                        background: 'rgba(129,140,248,0.12)',
                                                        border: '1px solid rgba(129,140,248,0.3)',
                                                        color: '#818cf8', borderRadius: '0.5rem',
                                                        padding: '0.4rem 0.8rem', fontSize: '0.8rem',
                                                        cursor: 'pointer', fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                                                    }}
                                                >
                                                    {generatingId === topic.id ? (
                                                        <>
                                                            <Activity size={13} className="animate-pulse" />
                                                            <span>Generating...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles size={13} />
                                                            <span>AI Quiz</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTopic(topic.id)}
                                                    style={{
                                                        background: 'rgba(248,113,113,0.1)',
                                                        border: '1px solid rgba(248,113,113,0.25)',
                                                        color: '#f87171', borderRadius: '0.5rem',
                                                        padding: '0.4rem 0.7rem', fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {currentSubject.topics.length === 0 && (
                                    <div className="card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No topics yet. Add one to get started.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Library size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Select a subject or create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* AI Settings View */}
            {activeTab === 'settings' && (
                <div className="card card-padding animate-fade-in-up tp-ai-card">
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Sliders size={24} color="#818cf8" />
                        <span className="gradient-text">AI Configuration Settings</span>
                    </h2>

                    {/* Live Status indicator */}
                    <div className="tp-ai-status">
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem', fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 600 }}>OpenRouter API Connection</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {aiStatus.configured 
                                    ? 'Your server is configured with a valid OpenRouter API Key. You are ready to generate dynamic quizzes!' 
                                    : 'Server-side OPENROUTER_API_KEY environment variable is missing. Set it in your backend .env file to enable AI generation.'
                                }
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: aiStatus.configured ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                            border: aiStatus.configured ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(248, 113, 113, 0.25)',
                            borderRadius: '2rem',
                            padding: '0.4rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: aiStatus.configured ? '#34d399' : '#f87171'
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: aiStatus.configured ? '#34d399' : '#f87171',
                                boxShadow: aiStatus.configured ? '0 0 8px #34d399' : '0 0 8px #f87171'
                            }} />
                            {aiStatus.configured ? 'Connected' : 'Offline'}
                        </div>
                    </div>

                    {/* Configuration Form */}
                    <form onSubmit={handleSaveAISettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* API Key Input */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                OpenRouter API Key
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="ai-api-key-input"
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={e => setApiKeyInput(e.target.value)}
                                    placeholder={aiStatus.configured ? 'Key saved — enter a new one to replace it' : 'sk-or-v1-...'}
                                    className="input-field"
                                    style={{ width: '100%', paddingRight: '3rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                                />
                                {aiStatus.configured && (
                                    <span style={{
                                        position: 'absolute', right: '0.875rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '0.7rem', fontWeight: 700,
                                        color: '#34d399',
                                        background: 'rgba(52,211,153,0.1)',
                                        border: '1px solid rgba(52,211,153,0.2)',
                                        borderRadius: '0.375rem', padding: '0.15rem 0.4rem',
                                        pointerEvents: 'none'
                                    }}>SAVED</span>
                                )}
                            </div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>openrouter.ai/keys</a>. Leave blank to keep the existing key.
                            </span>
                        </div>

                        {/* Model Select */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Default AI Model
                            </label>
                            <select
                                value={selectedModel}
                                onChange={e => setSelectedModel(e.target.value)}
                                className="input-field"
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {aiStatus.available_models && aiStatus.available_models.length > 0 ? (
                                    aiStatus.available_models.map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                                        <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                                        <option value="meta-llama/llama-3.1-8b-instruct:free">LLaMA 3.1 8B (Free)</option>
                                    </>
                                )}
                            </select>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                Select which model OpenRouter will call to synthesize learning material into questions.
                            </span>
                        </div>

                        {/* Question Count Select */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Questions Per Topic ({defaultQuestionCount} questions)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={defaultQuestionCount}
                                    onChange={e => setDefaultQuestionCount(parseInt(e.target.value))}
                                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                                />
                                <span style={{
                                    minWidth: '2.5rem',
                                    textAlign: 'center',
                                    background: 'rgba(129, 140, 248, 0.1)',
                                    border: '1px solid rgba(129, 140, 248, 0.25)',
                                    color: 'var(--primary)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    {defaultQuestionCount}
                                </span>
                            </div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                Control how many multiple-choice questions are synthesized for each generated quiz.
                            </span>
                        </div>

                        {/* Test Connection Button */}
                        {aiStatus.configured && (
                            <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleTestAIConnection}
                                    disabled={testingConnection}
                                    style={{
                                        background: 'rgba(56, 189, 248, 0.12)',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        color: 'var(--accent)',
                                        borderRadius: '0.75rem',
                                        padding: '0.6rem 1.25rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {testingConnection ? (
                                        <>
                                            <Activity size={16} className="animate-pulse" />
                                            <span>Testing Connection...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={16} />
                                            <span>Test AI Connection</span>
                                        </>
                                    )}
                                </button>
                                {testResult && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.85rem',
                                        border: testResult.success ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(248, 113, 113, 0.25)',
                                        background: testResult.success ? 'rgba(52, 211, 153, 0.05)' : 'rgba(248, 113, 113, 0.05)',
                                        color: testResult.success ? '#34d399' : '#f87171'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {testResult.success ? <Check size={16} /> : <X size={16} />}
                                            <span>{testResult.message}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Action */}
                        <div className="tp-save-row">
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="btn-primary"
                                style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {savingSettings ? (
                                    <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /><span>Saving...</span></>
                                ) : (
                                    <><Check size={16} /><span>Save Configuration</span></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                <Modal title="Add New Topic" onClose={() => { setTopicForm({ subject_id: '', title: '', content: '', youtube_url: '' }); setShowTopicModal(false); }}>
                <div className="tp-modal-body">
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

                        {/* YouTube Video Link */}
                        <div style={{
                            background: 'rgba(255, 0, 0, 0.04)',
                            border: '1px solid rgba(255, 80, 80, 0.2)',
                            borderRadius: '0.875rem',
                            padding: '1rem'
                        }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontSize: '0.85rem', fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: '0.6rem'
                            }}>
                                <span style={{
                                    width: 22, height: 22, borderRadius: '5px',
                                    background: '#ff0000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', flexShrink: 0
                                }}>▶</span>
                                YouTube Video Link
                                <span style={{
                                    marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 500,
                                    color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid var(--border)', borderRadius: '1rem',
                                    padding: '0.1rem 0.5rem'
                                }}>Optional</span>
                            </label>
                            <input
                                id="topic-youtube-input"
                                type="url"
                                value={topicForm.youtube_url}
                                onChange={e => setTopicForm({ ...topicForm, youtube_url: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="input-field"
                                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                            />
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                Paste any YouTube link — watch, share, or embed. Students will see an embedded player.
                            </span>
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
