import React, { useState } from 'react';
import { UserPlus, Mail, Hash, GraduationCap, CheckCircle, ArrowRight, Info, FileText, Upload, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
    const [appType, setAppType] = useState('FRESH'); // FRESH or PROMOTION
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNumber: '',
        className: 'Class-10',
        password: '',
        previousStudentId: '',
        documents: {
            aadharCard: '',
            pastMarksheet: '',
            birthCertificate: '',
            transferCertificate: ''
        }
    });
    
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedId, setGeneratedId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const payload = {
            ...formData,
            applicationType: appType,
            documents: appType === 'FRESH' ? formData.documents : undefined,
            previousStudentId: appType === 'PROMOTION' ? formData.previousStudentId : undefined
        };

        try {
            const res = await fetch('http://localhost:5000/api/auth/apply-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
                setGeneratedId(data.studentId);
                // Don't reset everything so they can see the ID and status
            } else {
                setStatus({ type: 'error', message: data.error });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '3rem', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        width: '64px', height: '64px', borderRadius: '16px', 
                        backgroundColor: 'var(--primary)', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 1.5rem auto', boxShadow: 'var(--shadow-lg)'
                    }}>
                        <UserPlus size={32} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>School Admission</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Complete the form below to begin your journey</p>
                </div>

                {/* Application Type Toggle */}
                <div style={{ display: 'flex', borderRadius: '12px', background: '#f1f5f9', padding: '6px', marginBottom: '2.5rem' }}>
                    <button 
                        onClick={() => { setAppType('FRESH'); setStatus(null); }}
                        style={{ 
                            flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                            background: appType === 'FRESH' ? 'white' : 'transparent',
                            boxShadow: appType === 'FRESH' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 700, color: appType === 'FRESH' ? 'var(--primary)' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
                        }}
                    >
                        <Upload size={18} /> New Admission
                    </button>
                    <button 
                        onClick={() => { setAppType('PROMOTION'); setStatus(null); }}
                        style={{ 
                            flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                            background: appType === 'PROMOTION' ? 'white' : 'transparent',
                            boxShadow: appType === 'PROMOTION' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 700, color: appType === 'PROMOTION' ? 'var(--primary)' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
                        }}
                    >
                        <RefreshCw size={18} /> Promotion / Re-admit
                    </button>
                </div>

                {status && (
                    <div style={{ 
                        padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem',
                        backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fee2e2',
                        color: status.type === 'success' ? '#166534' : '#991b1b',
                        border: '1px solid currentColor', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
                            {status.type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
                            {status.message}
                        </div>
                        {generatedId && (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #dcfce7' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>YOUR PERMANENT STUDENT ID</p>
                                <strong style={{ fontSize: '1.5rem', letterSpacing: '2px', color: 'var(--primary)' }}>{generatedId}</strong>
                                <p style={{ margin: '10px 0 0', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                    Your application is now <strong>PENDING</strong> for administrator approval. Once approved, you can login using this ID and your chosen password.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Full Name</label>
                            <input required placeholder="E.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Email</label>
                            <input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Target Class</label>
                            <select required value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>
                                {[5, 6, 7, 8, 9, 10, 11, 12].map(num => <option key={num} value={`Class-${num}`}>Class {num}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Target Roll No</label>
                            <input required type="number" placeholder="Roll No" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.4rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Choose Secret Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                required 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Min 6 characters" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                style={{ paddingLeft: '2.5rem' }} 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {appType === 'PROMOTION' ? (
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Previous Student ID</label>
                            <input required placeholder="E.g. RPHS20250001" value={formData.previousStudentId} onChange={e => setFormData({...formData, previousStudentId: e.target.value})} />
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                <FileText size={18} /> Upload Documents (Images/PDF Links)
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.75rem' }}>Aadhar Card URL</label>
                                    <input required placeholder="https://image-link.com/aadhar.jpg" value={formData.documents.aadharCard} onChange={e => setFormData({...formData, documents: {...formData.documents, aadharCard: e.target.value}})} />
                                </div>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.75rem' }}>Past Marksheet URL</label>
                                    <input required placeholder="https://image-link.com/marksheet.jpg" value={formData.documents.pastMarksheet} onChange={e => setFormData({...formData, documents: {...formData.documents, pastMarksheet: e.target.value}})} />
                                </div>
                            </div>
                        </div>
                    )}

                    <button disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', marginTop: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
                        {loading ? 'Submitting...' : 'Apply for Admission'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem', color: '#64748b' }}>
                        Check your application status? <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 700 }}>Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
