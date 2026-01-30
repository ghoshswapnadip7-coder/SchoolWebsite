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
        },
        stream: '',
        subjects: []
    });
    
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedId, setGeneratedId] = useState('');

    const handleFileUpload = async (file, fieldPath) => {
        if (!file) return;
        const data = new FormData();
        data.append('file', file);
        
        // Visual indicator could be added here (e.g. setUploading(true))
        try {
            const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: data });
            if (res.ok) {
                const { url } = await res.json();
                
                // Update deeply nested state
                if (fieldPath.includes('.')) {
                    const [parent, child] = fieldPath.split('.');
                    setFormData(prev => ({
                        ...prev,
                        [parent]: { ...prev[parent], [child]: url }
                    }));
                } else {
                    setFormData(prev => ({ ...prev, [fieldPath]: url }));
                }
            } else {
                alert('Upload failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error file uploading.');
        }
    };

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
        <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '2rem', position: 'relative' }}>
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
                    <div className="grid-responsive">
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Full Name</label>
                            <input required placeholder="E.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>Email</label>
                            <input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid-responsive">
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

                    {(formData.className === 'Class-11' || formData.className === 'Class-12') && (
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <GraduationCap size={18} /> Stream & Subject Selection
                            </h3>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Select Stream</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['Science', 'Arts'].map(s => (
                                        <label key={s} style={{ 
                                            flex: 1, 
                                            padding: '1rem', 
                                            border: formData.stream === s ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            borderRadius: '12px', 
                                            cursor: 'pointer',
                                            background: formData.stream === s ? 'var(--primary)' : 'white',
                                            color: formData.stream === s ? 'white' : 'inherit',
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: formData.stream === s ? 700 : 500,
                                            transition: 'all 0.2s ease',
                                            boxShadow: formData.stream === s ? '0 4px 12px -2px rgba(15, 23, 42, 0.4)' : 'none'
                                        }}>
                                            <input 
                                                type="radio" 
                                                name="stream" 
                                                value={s} 
                                                checked={formData.stream === s}
                                                onChange={() => setFormData({
                                                    ...formData, 
                                                    stream: s, 
                                                    subjects: ['Bengali', 'English'] // Reset subjects when stream changes, keep compulsory
                                                })}
                                                style={{ display: 'none' }}
                                            />
                                            {formData.stream === s && <CheckCircle size={18} />}
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {formData.stream && (
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Choose Elective Subjects (Max 4)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {/* Compulsory */}
                                        <span style={{ padding: '0.4rem 0.8rem', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.8rem', color: '#64748b', cursor: 'not-allowed' }}>Bengali (Compulsory)</span>
                                        <span style={{ padding: '0.4rem 0.8rem', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.8rem', color: '#64748b', cursor: 'not-allowed' }}>English (Compulsory)</span>
                                        
                                        {/* Electives */}
                                        {(formData.stream === 'Science' 
                                            ? ['Physics', 'Chemistry', 'Biology', 'Maths', 'COMS', 'AI']
                                            : ['Political Science', 'History', 'Education', 'Computer Application', 'Sanskrit']
                                        ).map(sub => (
                                            <label key={sub} style={{ 
                                                padding: '0.4rem 0.8rem', 
                                                border: formData.subjects.includes(sub) ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                                                borderRadius: '20px', 
                                                fontSize: '0.8rem', 
                                                cursor: 'pointer',
                                                background: formData.subjects.includes(sub) ? '#eff6ff' : 'white',
                                                color: formData.subjects.includes(sub) ? 'var(--primary)' : '#475569',
                                                transition: '0.2s'
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.subjects.includes(sub)}
                                                    onChange={(e) => {
                                                        const currentElectives = formData.subjects.filter(s => !['Bengali', 'English'].includes(s));
                                                        if (e.target.checked) {
                                                            if (currentElectives.length >= 4) {
                                                                alert("You can select a maximum of 4 elective subjects.");
                                                                return;
                                                            }
                                                            setFormData({...formData, subjects: [...formData.subjects, sub]});
                                                        } else {
                                                            setFormData({...formData, subjects: formData.subjects.filter(x => x !== sub)});
                                                        }
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                                {sub}
                                            </label>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>* Select up to 4 elective subjects (excluding compulsory).</p>
                                </div>
                            )}
                        </div>
                    )}

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
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.75rem' }}>Aadhar Card {formData.documents.aadharCard && <span style={{ color: 'green' }}>✓ Uploaded</span>}</label>
                                    <input required={!formData.documents.aadharCard} type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e.target.files[0], 'documents.aadharCard')} />
                                </div>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.75rem' }}>Past Marksheet {formData.documents.pastMarksheet && <span style={{ color: 'green' }}>✓ Uploaded</span>}</label>
                                    <input required={!formData.documents.pastMarksheet} type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e.target.files[0], 'documents.pastMarksheet')} />
                                </div>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.75rem' }}>Birth Certificate (Optional) {formData.documents.birthCertificate && <span style={{ color: 'green' }}>✓ Uploaded</span>}</label>
                                    <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e.target.files[0], 'documents.birthCertificate')} />
                                </div>
                                <div style={{ display: 'grid', gap: '0.4rem' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.75rem' }}>Transfer Certificate (Optional) {formData.documents.transferCertificate && <span style={{ color: 'green' }}>✓ Uploaded</span>}</label>
                                    <input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e.target.files[0], 'documents.transferCertificate')} />
                                </div>
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
