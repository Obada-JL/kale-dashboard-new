import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" 
              style={{ minHeight: '100vh', backgroundColor: 'var(--bs-kale-cream, #F5EDE3)' }}>
                <div className="text-center">
                    <div className="spinner-border mb-3" role="status"
                      style={{ width: '3rem', height: '3rem', color: '#6B4226' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ color: '#8B5E3C', fontFamily: "'Cairo', sans-serif" }}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
