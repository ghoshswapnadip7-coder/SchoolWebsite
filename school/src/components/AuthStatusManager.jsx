import { useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthStatusManager = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) return; // No need to poll if not logged in

        const checkStatus = async () => {
             // Don't poll if we are already on login page
            if (location.pathname === '/login') return;

            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 403) {
                    const data = await res.json();
                    if (data.error === 'ACCOUNT_BLOCKED') {
                        logout();
                        navigate('/login', { 
                            state: { 
                                blocked: true,
                                reason: data.reason || 'Account restricted by administration.'
                            } 
                        });
                    }
                } else if (res.status === 401) {
                    // Token expired or invalid
                    logout();
                    navigate('/login');
                }
            } catch (error) {
                // Ignore network errors to prevent annoying logouts on flaky connection
                console.error("Auth check failed", error);
            }
        };

        const intervalId = setInterval(checkStatus, 5000); // Check every 5 seconds
        
        // Initial check
        checkStatus();

        return () => clearInterval(intervalId);
    }, [user, navigate, logout, location.pathname]);

    return null; // This component renders nothing
};

export default AuthStatusManager;
