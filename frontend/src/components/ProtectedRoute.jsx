import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireTeacher = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '3px solid rgba(129,140,248,0.2)',
                        borderTopColor: '#818cf8',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (requireTeacher && user.role !== 'teacher') return <Navigate to="/" replace />;

    return children;
}
