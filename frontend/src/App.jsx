import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

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
            background: 'rgba(8, 12, 24, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 1.5rem',
        }}>
            <div style={{
                maxWidth: 1100, margin: '0 auto',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                height: 64
            }}>
                {/* Logo */}
                <Link to={user.role === 'teacher' ? '/admin' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: 36, height: 36,
                        background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                        borderRadius: '0.625rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                    }}>🎓</div>
                    <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>GradeGuide</span>
                </Link>

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {user.role === 'student' && (
                        <Link to="/" className="nav-link">Dashboard</Link>
                    )}
                    {user.role === 'teacher' && (
                        <Link to="/admin" className="nav-link">Admin Panel</Link>
                    )}
                </div>

                {/* User info + logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                            width: 34, height: 34,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(56,189,248,0.3))',
                            border: '1px solid rgba(129,140,248,0.3)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700, color: '#818cf8',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {user.role}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
}

function AppRoutes() {
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
