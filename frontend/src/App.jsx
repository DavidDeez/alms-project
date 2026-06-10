import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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

    // Don't show navbar on auth pages
    if (['/login', '/register'].includes(location.pathname)) return null;
    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'rgba(22, 27, 34, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--panel-border)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 1.5rem',
        }}>
            <div className="navbar-inner" style={{
                maxWidth: 1100, margin: '0 auto',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                height: 64
            }}>
                {/* Logo */}
                <Link to={user.role === 'teacher' ? '/admin' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: 34, height: 34,
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>🎓</div>
                    <span className="gradient-text glitch" style={{
                        fontWeight: 800,
                        fontSize: '1.15rem',
                        letterSpacing: '0.04em'
                    }}>ʟᴇᴀʀɴꜱʏɴᴄ</span>
                </Link>

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {user.role === 'student' && (
                        <Link to="/" className="nav-link monospace" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>// dashboard</Link>
                    )}
                    {user.role === 'teacher' && (
                        <Link to="/admin" className="nav-link monospace" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>// admin_panel</Link>
                    )}
                    <Link to="/curriculum" className="nav-link monospace" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>// nerdc_curriculum</Link>
                </div>

                {/* User info + logout */}
                <div className="navbar-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div className="monospace" style={{
                            width: 32, height: 32,
                            background: 'var(--bg-dark)',
                            border: '1px solid var(--panel-border)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)'
                        }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="navbar-profile-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {user.name}
                            </div>
                            <div className="navbar-profile-role monospace" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                [{user.role}]
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-ghost monospace" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        sign_out
                    </button>
                </div>
            </div>
        </nav>
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
