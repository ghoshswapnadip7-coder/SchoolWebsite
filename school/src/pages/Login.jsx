import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                <h2 style={{ color: '#dc2626', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    {title}
                </h2>
                {children}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'end' }}>
                    <button onClick={onClose} className="btn" style={{ background: '#f1f5f9', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                </div>
            </div>
        </div>
    );
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Blocked State
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const infoMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'PENDING_APPROVAL') {
                    navigate('/status', { state: { request: data.request } });
                    return;
                }
                if (data.error === 'ACCOUNT_BLOCKED') {
                    setBlockReason(data.reason || 'No reason provided.');
                    setShowBlockModal(true);
                    return;
                }
                throw new Error(data.error || 'Login failed');
            }

            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '80vh' 
        }}>
            <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Account Restricted">
                <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6 }}>
                    Your access to the school portal has been temporarily restricted by the administration.
                </p>
                <div style={{ background: '#fff1f2', borderLeft: '4px solid #f43f5e', padding: '1rem', marginTop: '1rem', borderRadius: '4px' }}>
                    <strong style={{ display: 'block', color: '#9f1239', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Reason provided:</strong>
                    <span style={{ color: '#881337' }}>{blockReason}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '1.5rem' }}>
                    Please contact the school administrative office for further assistance.
                </p>
            </Modal>

            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>Welcome Back</h1>
                
                {infoMessage && <div style={{ 
                    backgroundColor: '#e0f2fe', 
                    color: '#0369a1', 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    borderLeft: '4px solid #0ea5e9'
                }}>
                    <strong>Note:</strong> {infoMessage}
                </div>}

                {error && <div style={{ 
                    backgroundColor: '#fee2e2', 
                    color: '#dc2626', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '0.8rem' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Contact Admin</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
