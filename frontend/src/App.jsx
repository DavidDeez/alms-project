import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Curriculum from './pages/Curriculum';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = React.useState(false);

    // Close drawer on route change
    React.useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    if (['/login', '/register'].includes(location.pathname)) return null;
    if (!user) return null;

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <>
        <style>{`
            .nb-inner {
                max-width: 1100px; margin: 0 auto;
                padding: 0 1.25rem;
                display: flex; align-items: center;
                justify-content: space-between;
                height: 60px;
            }
            .nb-links { display: flex; align-items: center; gap: 0.25rem; }
            .nb-profile { display: flex; align-items: center; gap: 0.75rem; }
            .nb-hamburger {
                display: none;
                background: none; border: none;
                cursor: pointer; padding: 0.4rem;
                color: var(--text-primary);
                border-radius: 0.5rem;
            }
            .nb-drawer {
                position: fixed; top: 0; right: 0;
                width: 260px; height: 100vh;
                background: rgba(10,14,28,0.97);
                backdrop-filter: blur(24px);
                border-left: 1px solid rgba(255,255,255,0.08);
                z-index: 999;
                display: flex; flex-direction: column;
                padding: 1.5rem;
                gap: 0.75rem;
                transform: translateX(100%);
                transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            }
            .nb-drawer.open { transform: translateX(0); }
            .nb-overlay {
                display: none;
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 998;
            }
            .nb-overlay.open { display: block; }
            .nb-drawer-link {
                display: flex; align-items: center; gap: 0.75rem;
                padding: 0.875rem 1rem;
                border-radius: 0.75rem;
                color: var(--text-primary);
                text-decoration: none;
                font-weight: 500; font-size: 0.95rem;
                border: 1px solid transparent;
                transition: all 0.2s;
            }
            .nb-drawer-link:hover, .nb-drawer-link.active {
                background: rgba(129,140,248,0.1);
                border-color: rgba(129,140,248,0.25);
                color: #818cf8;
            }
            @media (max-width: 640px) {
                .nb-links { display: none !important; }
                .nb-profile .nb-signout { display: none !important; }
                .nb-hamburger { display: flex !important; align-items: center; justify-content: center; }
                .nb-profile-name { display: none !important; }
            }
        `}</style>

        <nav style={{
            background: 'rgba(8, 12, 24, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky', top: 0, zIndex: 100,
        }}>
            <div className="nb-inner">
                {/* Logo */}
                <Link to={user.role === 'teacher' ? '/admin' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: 32, height: 32,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(56,189,248,0.15))',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '0.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <GraduationCap size={16} color="white" />
                    </div>
                    <span className="glass-luminous-3d" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem' }}>LearnSync</span>
                </Link>

                {/* Desktop nav links */}
                <div className="nb-links">
                    {user.role === 'student' && <Link to="/" className="nav-link">Dashboard</Link>}
                    {user.role === 'teacher' && <Link to="/admin" className="nav-link">Teacher Panel</Link>}
                    <Link to="/curriculum" className="nav-link">NERDC Curriculum</Link>
                </div>

                {/* Desktop profile + signout | Mobile: avatar + hamburger */}
                <div className="nb-profile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: 34, height: 34,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(56,189,248,0.3))',
                            border: '1px solid rgba(129,140,248,0.3)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700, color: '#818cf8',
                            fontFamily: 'Outfit, sans-serif', flexShrink: 0
                        }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="nb-profile-name">
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{user.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-ghost nb-signout" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem', whiteSpace: 'nowrap' }}>
                        Sign out
                    </button>
                    {/* Hamburger — mobile only */}
                    <button className="nb-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                        {menuOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        )}
                    </button>
                </div>
            </div>
        </nav>

        {/* Mobile drawer overlay */}
        <div className={`nb-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

        {/* Mobile drawer */}
        <div className={`nb-drawer${menuOpen ? ' open' : ''}`}>
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(56,189,248,0.3))',
                    border: '1px solid rgba(129,140,248,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 700, color: '#818cf8'
                }}>
                    {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
            </div>

            {/* Drawer links */}
            {user.role === 'student' && (
                <Link to="/" className={`nb-drawer-link${location.pathname === '/' ? ' active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Dashboard
                </Link>
            )}
            {user.role === 'teacher' && (
                <Link to="/admin" className={`nb-drawer-link${location.pathname === '/admin' ? ' active' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Teacher Panel
                </Link>
            )}
            <Link to="/curriculum" className={`nb-drawer-link${location.pathname === '/curriculum' ? ' active' : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                NERDC Curriculum
            </Link>

            {/* Sign out at bottom */}
            <div style={{ flex: 1 }} />
            <button onClick={handleLogout} style={{
                width: '100%', padding: '0.875rem',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: '0.75rem',
                color: '#f87171', fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
            </button>
        </div>
        </>
    );
}

function AppRoutes() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.log('Session invalid or expired. Auto-logging out...');
                    logout();
                    navigate('/login', { state: { message: 'Your session has expired. Please sign in again.' } });
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout, navigate]);

    return (
        <>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                <Routes>
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/lesson/:topicId" element={
                        <ProtectedRoute>
                            <Lesson />
                        </ProtectedRoute>
                    } />
                    <Route path="/quiz/:topicId" element={
                        <ProtectedRoute>
                            <Quiz />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute requireTeacher={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/curriculum" element={
                        <ProtectedRoute>
                            <Curriculum />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
