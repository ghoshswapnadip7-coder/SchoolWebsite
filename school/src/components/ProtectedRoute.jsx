import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ message: "To access the Dashboard, you must be a registered student. Please consult your Admin or Headmaster (HM) if you don't have an account." }} />;
    }

    return children;
};

export default ProtectedRoute;
