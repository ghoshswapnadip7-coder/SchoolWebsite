import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, FileText, ArrowLeft, LogOut } from 'lucide-react';

const StatusDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { request } = location.state || {};

    if (!request) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text-muted)' }}>Session expired or invalid access.</h2>
                <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Login</Link>
            </div>
        );
    }

    const getStatusColor = () => {
        switch(request.status) {
            case 'ACCEPTED': return '#166534';
            case 'REJECTED': return '#991b1b';
            default: return '#92400e';
        }
    };

    const getStatusBg = () => {
        switch(request.status) {
            case 'ACCEPTED': return '#dcfce7';
            case 'REJECTED': return '#fee2e2';
            default: return '#fffbeb';
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '50px', height: '50px', borderRadius: '12px', 
                            background: getStatusBg(), color: getStatusColor(),
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {request.status === 'ACCEPTED' ? <CheckCircle /> : request.status === 'REJECTED' ? <XCircle /> : <Clock />}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Status Dashboard</h1>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Application: {request.studentId}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/login')} className="btn" style={{ background: '#f1f5f9', color: '#64748b' }}><LogOut size={16} /> Logout</button>
                </div>

                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, color: getStatusColor(), margin: '10px 0' }}>
                        {request.status} 
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>
                        {request.status === 'PENDING' ? 
                            "Your application is being reviewed by the administration. This normally takes 1-2 business days. You will receive an email once it is approved." : 
                            request.status === 'ACCEPTED' ? 
                            "Congratulations! Your admission has been approved. You can now login to your official student account." :
                            "Unfortunately, your application was not accepted at this time. Please contact the school office for more details."}
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Admission Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'white', border: '1px solid #eee', borderRadius: '10px' }}>
                            <small style={{ color: '#94a3b8', display: 'block' }}>Student Name</small>
                            <strong>{request.name}</strong>
                        </div>
                        <div style={{ padding: '1rem', background: 'white', border: '1px solid #eee', borderRadius: '10px' }}>
                            <small style={{ color: '#94a3b8', display: 'block' }}>Target Class</small>
                            <strong>{request.class} (Roll: {request.rollNumber})</strong>
                        </div>
                    </div>

                    {request.documents && (
                        <div style={{ marginTop: '1rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="var(--primary)" /> Verified Documents
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <a href={request.documents.aadharCard} target="_blank" rel="noreferrer" style={{ padding: '0.8rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, border: '1px solid #e2e8f0', textAlign: 'center' }}>View Aadhar</a>
                                <a href={request.documents.pastMarksheet} target="_blank" rel="noreferrer" style={{ padding: '0.8rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, border: '1px solid #e2e8f0', textAlign: 'center' }}>View Marksheet</a>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Need help with your application?</p>
                    <Link to="/contact" className="btn" style={{ color: 'var(--primary)', fontWeight: 600 }}>Contact Support Office</Link>
                </div>
            </div>
        </div>
    );
};

export default StatusDashboard;
