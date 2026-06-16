import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Quiz() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        axios.get(`${API_URL}/api/courses/topic/${topicId}/quiz`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => { setQuestions(res.data.questions); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }, [topicId, token]);

    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;
    const progressPct = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

    const handleOptionChange = (questionId, option) => {
        setAnswers({ ...answers, [questionId]: option });
    };

    const submitQuiz = () => {
        setSubmitting(true);
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) correctCount++;
        });
        const finalScore = Math.round((correctCount / questions.length) * 100);
        setScore(finalScore);

        axios.post(`${API_URL}/api/courses/quiz/submit`, {
            topicId: parseInt(topicId),
            score: finalScore
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => { setResult(res.data.recommendation); setSubmitting(false); })
        .catch(err => { console.error(err); setSubmitting(false); });
    };

    const handleRetake = () => {
        setAnswers({});
        setScore(null);
        setResult(null);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="page-container" style={{ maxWidth: 760 }}>
                <div className="skeleton" style={{ height: 20, width: '20%', marginBottom: '2rem', borderRadius: '0.5rem' }} />
                <div className="skeleton" style={{ height: 48, width: '55%', marginBottom: '1rem', borderRadius: '0.5rem' }} />
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: '1rem', marginBottom: '1rem' }} />)}
            </div>
        );
    }

    /* ─── RESULT SCREEN ─────────────────────────────────────── */
    if (result) {
        const passed = result.action === 'advance' || result.action === 'finish';
        const color = passed ? '#34d399' : '#f87171';
        const bg = passed ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)';
        const border = passed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)';

        return (
            <div className="page-container" style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
                <div className="card card-padding animate-fade-in-up" style={{
                    textAlign: 'center',
                    background: bg,
                    borderColor: border
                }}>
                    {/* Score ring */}
                    <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
                        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke={color} strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '1.75rem', fontWeight: 800,
                                color, lineHeight: 1
                            }}>
                                {score}%
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>score</span>
                        </div>
                    </div>

                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                        {passed ? '🏆' : '📖'}
                    </div>

                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.75rem', fontWeight: 800,
                        color, margin: '0 0 0.75rem', letterSpacing: '-0.02em'
                    }}>
                        {result.action === 'finish' ? 'Subject Complete!' : passed ? 'Mastery Achieved!' : 'Keep Studying!'}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 2rem' }}>
                        {result.message}
                    </p>

                    {result.action === 'revise' && result.suggestedMaterials?.length > 0 && (
                        <div style={{
                            textAlign: 'left',
                            background: 'rgba(248,113,113,0.06)',
                            border: '1px solid rgba(248,113,113,0.15)',
                            borderRadius: '0.875rem',
                            padding: '1.25rem',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#f87171', margin: '0 0 0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Recommended Resources
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {result.suggestedMaterials.map((mat, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '0.625rem', padding: '0.625rem 0.875rem'
                                    }}>
                                        <span style={{ fontSize: '1.1rem' }}>{mat.type === 'video' ? '📺' : '📝'}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{mat.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {!passed && (
                            <>
                                <button
                                    onClick={() => navigate(`/lesson/${topicId}`)}
                                    className="btn-ghost"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    ← Review Lesson
                                </button>
                                <button
                                    onClick={handleRetake}
                                    className="btn-primary"
                                    style={{ fontSize: '0.9rem', background: '#f59e0b', borderColor: '#f59e0b', color: '#111827' }}
                                >
                                    Retake Quiz Now ↻
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => navigate('/')}
                            className={passed ? "btn-primary" : "btn-ghost"}
                            style={{ fontSize: '0.9rem' }}
                        >
                            {passed ? 'Continue Learning →' : 'Back to Dashboard'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── QUIZ SCREEN ───────────────────────────────────────── */
    return (
        <div className="page-container" style={{ maxWidth: 760, fontFamily: 'Inter, sans-serif' }}>

            {/* Back link */}
            <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                <Link to={`/lesson/${topicId}`} style={{
                    color: 'var(--text-muted)', textDecoration: 'none',
                    fontSize: '0.85rem', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    ← Back to Lesson
                </Link>
            </div>

            {/* Header */}
            <div className="card animate-fade-in-up" style={{
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(56,189,248,0.06) 100%)',
                borderColor: 'rgba(129,140,248,0.2)'
            }}>
                <div className="flex-responsive" style={{ marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '1.75rem', fontWeight: 800,
                            margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)'
                        }}>
                            Knowledge Check
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                            {answeredCount} of {totalCount} answered · Pass mark: 65%
                        </p>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem', marginTop: '0.25rem', alignSelf: 'center' }}>
                        {totalCount} Questions
                    </span>
                </div>
                {/* Progress bar */}
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                {questions.map((q, index) => (
                    <div
                        key={q.id}
                        className="card question-card animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
                    >
                        {/* Question */}
                        <p style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 700, fontSize: '1.05rem',
                            color: 'var(--text-primary)',
                            margin: '0 0 1.25rem',
                            display: 'flex', gap: '0.625rem', alignItems: 'flex-start'
                        }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                minWidth: 28, height: 28, borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                                fontSize: '0.75rem', fontFamily: 'Inter, sans-serif',
                                fontWeight: 700, color: 'white', flexShrink: 0
                            }}>
                                {index + 1}
                            </span>
                            {q.question}
                        </p>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {q.options.map((opt, i) => {
                                const selected = answers[q.id] === opt;
                                return (
                                    <label
                                        key={i}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                                            padding: '0.875rem 1.125rem',
                                            borderRadius: '0.75rem',
                                            border: selected
                                                ? '2px solid rgba(129,140,248,0.7)'
                                                : '2px solid var(--border)',
                                            background: selected
                                                ? 'rgba(129,140,248,0.1)'
                                                : 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={e => {
                                            if (!selected) {
                                                e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!selected) {
                                                e.currentTarget.style.borderColor = 'var(--border)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            }
                                        }}
                                    >
                                        {/* Custom radio */}
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            border: selected ? '2px solid #818cf8' : '2px solid rgba(255,255,255,0.2)',
                                            background: selected ? '#818cf8' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, transition: 'all 0.2s ease'
                                        }}>
                                            {selected && (
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={opt}
                                            checked={selected}
                                            onChange={() => handleOptionChange(q.id, opt)}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{
                                            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            fontSize: '0.95rem', fontWeight: selected ? 500 : 400,
                                            transition: 'color 0.2s'
                                        }}>
                                            {opt}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit */}
            <div className="card card-padding animate-fade-in-up flex-responsive" style={{
                animationDelay: `${questions.length * 0.06}s`, animationFillMode: 'both',
                background: answeredCount === totalCount
                    ? 'rgba(52,211,153,0.05)' : 'var(--surface)',
                borderColor: answeredCount === totalCount
                    ? 'rgba(52,211,153,0.2)' : 'var(--border)',
                transition: 'all 0.4s ease'
            }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {answeredCount < totalCount
                            ? `${totalCount - answeredCount} question${totalCount - answeredCount !== 1 ? 's' : ''} remaining`
                            : '✓ All questions answered!'
                        }
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {answeredCount < totalCount
                            ? 'Please answer all questions to submit'
                            : 'Ready to see your result!'
                        }
                    </p>
                </div>
                <button
                    onClick={submitQuiz}
                    disabled={submitting || answeredCount < totalCount}
                    className="btn-primary"
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem', whiteSpace: 'nowrap' }}
                >
                    {submitting ? 'Evaluating...' : 'Submit Quiz →'}
                </button>
            </div>
        </div>
    );
}
