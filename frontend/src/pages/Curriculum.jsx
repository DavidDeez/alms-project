import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, BookOpen, Lock, GraduationCap, Search, Target, Lightbulb, Video, ChevronDown, Plus, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import CURRICULUM_DATA from './curriculumData';


export default function Curriculum() {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    
    // UI state
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [selectedGrade, setSelectedGrade] = useState('JSS 1');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [expandedTopic, setExpandedTopic] = useState(null); // Expand week index for details

    // Database mapped topics
    const [dbTopics, setDbTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Media Assistant Drawer Modal
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaModalTitle, setMediaModalTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState(null);

    useEffect(() => {
        // Fetch dashboard data to map student progress or check active database topics
        const dashboardUrl = user.role === 'teacher' 
            ? `${API_URL}/api/admin/dashboard` 
            : `${API_URL}/api/courses/dashboard`;

        axios.get(dashboardUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (user.role === 'teacher') {
                // Compile all topics from subjects list for teachers
                const topicsList = [];
                res.data.subjects.forEach(subject => {
                    subject.topics.forEach(topic => {
                        topicsList.push({
                            id: topic.id,
                            title: topic.title,
                            subjectName: subject.name,
                            status: 'active'
                        });
                    });
                });
                setDbTopics(topicsList);
            } else {
                // Students get progress status mapping
                setDbTopics(res.data.allTopics || []);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch syllabus sync details:', err);
            setLoading(false);
        });
    }, [token, user.role]);

    // Helpers to match curriculum to seeded database topics
    const getMatchingDbTopic = (item) => {
        if (!item.dbTopicMatch) return null;
        return dbTopics.find(t => t.title.toLowerCase().includes(item.dbTopicMatch));
    };

    // Smart Media Assistant Search Trigger
    const openMediaAssistant = (topicTitle) => {
        setMediaModalTitle(topicTitle);
        const lower = topicTitle.toLowerCase();
        
        // Curated YouTube Video mappings matching Lesson.jsx, or dynamic fallback search url
        let videoId = null;
        if (lower.includes('algebra')) videoId = 'NybHckSEQBI';
        else if (lower.includes('linear')) videoId = 'L71r6N81y1s';
        else if (lower.includes('photo')) videoId = 'CMiPYHNNg28';
        else if (lower.includes('cellular') || lower.includes('respiration')) videoId = 'SrP5930gV_8';

        if (videoId) {
            setYoutubeUrl(`https://www.youtube.com/embed/${videoId}`);
        } else {
            // Standard YouTube search embedded query helper or fallback link
            setYoutubeUrl(null);
        }
        setShowMediaModal(true);
    };

    const handleYoutubeSearch = () => {
        const query = encodeURIComponent(`NERDC Secondary School ${selectedGrade} ${selectedSubject} ${mediaModalTitle}`);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    };

    // Dynamic pre-fill helper for Teachers
    const getTeacherCreateUrl = (item) => {
        const matchingSubjectId = selectedSubject === 'Mathematics' ? 1 : 2; // Math = 1, Basic Sci = 2 standard seed
        return `/admin?action=create-topic&subjectId=${matchingSubjectId}&title=${encodeURIComponent(item.topic)}`;
    };

    const currentWeeks = CURRICULUM_DATA[selectedSubject]?.[selectedGrade]?.[selectedTerm] || [];

    // Calculate sequential locking (must pass week N to attempt week N+1)
    let cascadeLock = false;
    const computedWeeks = currentWeeks.map((item, index) => {
        const dbTopic = getMatchingDbTopic(item);
        
        let isEffectivelyLocked = cascadeLock;
        
        if (!cascadeLock) {
            if (dbTopic) {
                if (dbTopic.progress_status === 'locked') {
                    isEffectivelyLocked = true;
                }
                if (dbTopic.progress_status !== 'completed') {
                    cascadeLock = true;
                }
            } else {
                cascadeLock = true;
            }
        }
        
        return { ...item, dbTopic, isEffectivelyLocked };
    });

    return (
        <div className="page-container" style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1000 }}>
            
            {/* Page Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    Syllabus Standard
                </span>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                    fontWeight: 800, margin: '0 0 0.5rem',
                    letterSpacing: '-0.03em', lineHeight: 1.1
                }}>
                    NERDC <span className="gradient-text">Scheme of Work</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, maxWidth: 680 }}>
                    Official Nigerian Educational Research and Development Council national curriculum. Students can monitor their mastery roadmap, while teachers can align lesson planning.
                </p>
            </div>

            {/* Subject Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                {['Mathematics', 'Basic Science'].map(sub => (
                    <button
                        key={sub}
                        onClick={() => { setSelectedSubject(sub); setExpandedTopic(null); }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: selectedSubject === sub ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                            color: selectedSubject === sub ? '#818cf8' : 'var(--text-secondary)',
                            border: '1px solid',
                            borderColor: selectedSubject === sub ? '#818cf8' : 'transparent',
                            borderRadius: '0.75rem',
                            fontSize: '0.95rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {sub === 'Basic Science' && selectedGrade.startsWith('SS') ? 'Basic Science (Biology)' : sub}
                    </button>
                ))}
            </div>

            {/* Grade Level Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map(grade => (
                    <button
                        key={grade}
                        onClick={() => { setSelectedGrade(grade); setExpandedTopic(null); }}
                        style={{
                            padding: '0.5rem 1.1rem',
                            background: selectedGrade === grade ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: selectedGrade === grade ? 'white' : 'var(--text-secondary)',
                            border: '1px solid',
                            borderColor: selectedGrade === grade ? 'var(--primary)' : 'var(--border)',
                            borderRadius: '9999px',
                            fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { if(selectedGrade !== grade) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                        onMouseLeave={e => { if(selectedGrade !== grade) e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                        {grade}
                    </button>
                ))}
            </div>

            {/* Term Selectors */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {['Term 1', 'Term 2', 'Term 3'].map(term => (
                    <button
                        key={term}
                        onClick={() => { setSelectedTerm(term); setExpandedTopic(null); }}
                        style={{
                            flex: 1,
                            padding: '0.625rem',
                            background: selectedTerm === term ? 'rgba(255,255,255,0.08)' : 'transparent',
                            color: selectedTerm === term ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: '1px solid',
                            borderColor: selectedTerm === term ? 'var(--border-hover)' : 'var(--border)',
                            borderRadius: '0.625rem',
                            fontSize: '0.88rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {term}
                    </button>
                ))}
            </div>

            {/* Weekly Syllabus Grid */}
            <div className="card animate-fade-in-up" style={{ padding: '1.5rem', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: 60, borderRadius: '0.75rem' }} />
                        ))}
                    </div>
                ) : computedWeeks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <p style={{ margin: 0 }}>No syllabus schedule compiled for this selection yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {computedWeeks.map((item, index) => {
                            const { dbTopic, isEffectivelyLocked } = item;
                            const isExpanded = expandedTopic === index;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.875rem',
                                        background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Main Row */}
                                    <div
                                        onClick={() => setExpandedTopic(isExpanded ? null : index)}
                                        style={{
                                            padding: '1.25rem',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 280 }}>
                                            {/* Week Badge */}
                                            <div style={{
                                                padding: '0.4rem 0.8rem',
                                                background: 'rgba(255,255,255,0.06)',
                                                borderRadius: '0.5rem',
                                                fontFamily: 'Outfit, sans-serif',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--border)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.week}
                                            </div>

                                            {/* Topic Name */}
                                            <div>
                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: '0.98rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                    lineHeight: 1.3
                                                }}>
                                                    {item.topic}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Status / Actions Badging */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                            {user.role === 'student' && isEffectivelyLocked ? (
                                                <>
                                                    <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Lock size={12} />
                                                        <span>Locked</span>
                                                    </span>
                                                    <button
                                                        disabled
                                                        className="btn-ghost"
                                                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}
                                                    >
                                                        Study
                                                    </button>
                                                </>
                                            ) : dbTopic ? (
                                                <>
                                                    {/* Seeded and Mapped topic status markers */}
                                                    {user.role === 'student' ? (
                                                        <>
                                                            {dbTopic.progress_status === 'completed' && (
                                                                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                    <Check size={12} />
                                                                    <span>Mastered</span>
                                                                </span>
                                                            )}
                                                            {dbTopic.progress_status === 'unlocked' && (
                                                                <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                    <BookOpen size={12} />
                                                                    <span>In Progress</span>
                                                                </span>
                                                            )}
                                                            {dbTopic.progress_status === 'locked' && (
                                                                <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                    <Lock size={12} />
                                                                    <span>Locked</span>
                                                                </span>
                                                            )}

                                                            {dbTopic.progress_status !== 'locked' && !isEffectivelyLocked ? (
                                                                <button
                                                                    onClick={() => navigate(`/lesson/${dbTopic.id}`)}
                                                                    className="btn-primary"
                                                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', boxShadow: 'none' }}
                                                                >
                                                                    {dbTopic.progress_status === 'completed' ? 'Review' : 'Start'}
                                                                </button>
                                                            ) : null}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <GraduationCap size={12} />
                                                                <span>ALMS Coursework</span>
                                                            </span>
                                                            <button
                                                                onClick={() => navigate(`/admin`)}
                                                                className="btn-ghost"
                                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}
                                                            >
                                                                Edit
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {/* Unseeded syllabus topic resource option */}
                                                            <button
                                                                onClick={() => openMediaAssistant(item.topic)}
                                                                className="badge"
                                                                style={{ 
                                                                    background: 'rgba(255,255,255,0.03)', 
                                                                    color: 'var(--text-muted)', 
                                                                    border: '1px solid var(--border)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={e => {
                                                                    e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
                                                                    e.currentTarget.style.color = '#38bdf8';
                                                                }}
                                                                onMouseLeave={e => {
                                                                    e.currentTarget.style.borderColor = 'var(--border)';
                                                                    e.currentTarget.style.color = 'var(--text-muted)';
                                                                }}
                                                            >
                                                                Syllabus Resource
                                                            </button>

                                                            {user.role === 'teacher' ? (
                                                                <Link
                                                                    to={getTeacherCreateUrl(item)}
                                                                    className="btn-primary"
                                                                    style={{
                                                                        fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                        boxShadow: 'none', textDecoration: 'none',
                                                                        display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                                    }}
                                                                >
                                                                    <Plus size={12} />
                                                                    <span>Create</span>
                                                                </Link>
                                                            ) : (
                                                                <button
                                                                    onClick={() => openMediaAssistant(item.topic)}
                                                                    className="btn-ghost"
                                                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                                >
                                                                    <Search size={12} />
                                                                    <span>Explore</span>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Expand Icon */}
                                                    <div style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                                        <ChevronDown size={14} />
                                                    </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail Drawer */}
                                    {isExpanded && (
                                        <div style={{
                                            padding: '0 1.25rem 1.25rem',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                            background: 'rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ paddingTop: '1rem' }}>
                                                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <Target size={14} color="#818cf8" />
                                                    <span>Weekly Learning Objectives</span>
                                                </h4>
                                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                    {item.objectives.map((obj, oIdx) => (
                                                        <li key={oIdx} style={{ marginBottom: '0.25rem' }}>{obj}</li>
                                                    ))}
                                                </ul>

                                                {/* Mini Dynamic Action inside drawer */}
                                                {!dbTopic && (
                                                    <div style={{
                                                        marginTop: '1.25rem',
                                                        padding: '0.875rem 1rem',
                                                        background: 'rgba(56,189,248,0.04)',
                                                        border: '1px solid rgba(56,189,248,0.1)',
                                                        borderRadius: '0.625rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                            <Lightbulb size={14} />
                                                            <span>Study assistance media helper is ready for this topic.</span>
                                                        </span>
                                                        <button
                                                            onClick={() => openMediaAssistant(item.topic)}
                                                            className="btn-ghost"
                                                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                                                        >
                                                            Study Video Guide
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Smart Media Assistant Drawer Modal */}
            {showMediaModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="card animate-fade-in-up" style={{
                        width: '100%', maxWidth: 680,
                        padding: '1.75rem',
                        position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)'
                    }}>
                        {/* Close button */}
                        <button
                            onClick={() => setShowMediaModal(false)}
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                background: 'rgba(255,255,255,0.06)', border: 'none',
                                color: 'var(--text-secondary)', width: 32, height: 32,
                                borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <X size={16} />
                        </button>

                        <span className="badge" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Video size={12} />
                            <span>Media Assistant</span>
                        </span>
                        
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--text-primary)', pr: '2rem' }}>
                            {mediaModalTitle}
                        </h2>

                        {youtubeUrl ? (
                            /* Embed frame if video is curated */
                            <div style={{
                                position: 'relative', width: '100%', paddingBottom: '56.25%',
                                borderRadius: '0.875rem', overflow: 'hidden',
                                border: '1px solid var(--border)', background: 'black', marginBottom: '1.25rem'
                            }}>
                                <iframe
                                    src={youtubeUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                />
                            </div>
                        ) : (
                            /* Fallback cards for non-seeded custom topics */
                             <div style={{
                                padding: '2rem 1.5rem',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.875rem',
                                textAlign: 'center',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Lightbulb size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>No Local Seed Video</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                                    There is no pre-curated video in the ALMS database for this specific week's syllabus topic yet. However, we have assembled a customized YouTube video study search just for you!
                                </p>
                                <button
                                    onClick={handleYoutubeSearch}
                                    className="btn-primary"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Search size={16} />
                                    <span>Search Video Guides on YouTube</span>
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            {youtubeUrl && (
                                <button
                                    onClick={handleYoutubeSearch}
                                    className="btn-ghost"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    More YouTube Results
                                </button>
                            )}
                            <button
                                onClick={() => setShowMediaModal(false)}
                                className="btn-primary"
                                style={{ fontSize: '0.85rem' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
