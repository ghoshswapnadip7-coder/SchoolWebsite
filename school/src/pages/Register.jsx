import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
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
    const [admissionStatus, setAdmissionStatus] = useState({ isOpen: true, loading: true });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/admission-status`);
                if (res.ok) {
                    const data = await res.json();
                    setAdmissionStatus({ ...data, loading: false });
                    
                    // If current className is not in allowedClasses, set it to the first available one
                    if (data.allowedClasses && data.allowedClasses.length > 0 && !data.allowedClasses.includes(formData.className)) {
                        setFormData(prev => ({ ...prev, className: data.allowedClasses[0] }));
                    }
                } else {
                    setAdmissionStatus({ isOpen: false, loading: false });
                }
            } catch (err) {
                setAdmissionStatus({ isOpen: false, loading: false });
            }
        };
        fetchStatus();
    }, []);

    const handleFileUpload = async (file, fieldPath) => {
        if (!file) return;
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: data });
            if (res.ok) {
                const { url } = await res.json();
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

    const [eligibility, setEligibility] = useState({ checked: false, loading: false, data: null });

    const checkEligibility = async (sid) => {
        if (!sid || sid.length < 5) return;
        setEligibility({ ...eligibility, loading: true });
        try {
            const res = await fetch(`${API_URL}/auth/check-eligibility/${sid}`);
            const data = await res.json();
            if (res.ok) {
                setEligibility({ checked: true, loading: false, data });
                
                // Pre-fill Logic
                const updates = { name: data.studentName };
                
                // If promoting from Class-11, Lock Subjects for Class-12
                if (data.currentClass === 'Class-11') {
                     updates.stream = data.stream;
                     updates.subjects = data.subjects;
                     updates.className = 'Class-12'; // Auto-select Class 12
                }
                
                setFormData(prev => ({ ...prev, ...updates }));
            } else {
                setEligibility({ checked: true, loading: false, data: { ...data, error: true } });
            }
        } catch (err) {
            setEligibility({ checked: false, loading: false, data: null });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final eligibility check for promotion
        if (appType === 'PROMOTION' && eligibility.data?.error) {
            alert("Application Blocked: " + eligibility.data.message);
            return;
        }

        setLoading(true);
        setStatus(null);

        const payload = {
            ...formData,
            applicationType: appType,
            documents: appType === 'FRESH' ? formData.documents : undefined,
            previousStudentId: appType === 'PROMOTION' ? formData.previousStudentId : undefined
        };

        try {
            const res = await fetch(`${API_URL}/auth/apply-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
                setGeneratedId(data.studentId);
            } else {
                setStatus({ type: 'error', message: data.error || data.message });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '650px', width: '100%', padding: '2.5rem', position: 'relative' }}>
                {!admissionStatus.isOpen && !admissionStatus.loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ 
                            width: '80px', height: '80px', borderRadius: '50%', 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            margin: '0 auto 2rem auto'
                        }}>
                            <Lock size={40} />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Admissions Closed</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            We are not accepting new applications at this time. <br />
                            Please check back later or contact the school office.
                        </p>
                        {admissionStatus.expiryDate && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 700 }}>
                                Last Admission Window Closed: {new Date(admissionStatus.expiryDate).toLocaleDateString()}
                            </p>
                        )}
                        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '2rem', padding: '1rem 2rem' }}>
                           Return Home
                        </Link>
                    </div>
                ) : (
                    <>
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

                <div style={{ display: 'flex', borderRadius: '12px', background: 'var(--surface-hover)', padding: '6px', marginBottom: '2.5rem' }}>
                    <button 
                        onClick={() => { setAppType('FRESH'); setStatus(null); }}
                        style={{ 
                            flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                            background: appType === 'FRESH' ? 'var(--surface)' : 'transparent',
                            boxShadow: appType === 'FRESH' ? 'var(--shadow-sm)' : 'none',
                            fontWeight: 700, color: appType === 'FRESH' ? 'var(--secondary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
                        }}
                    >
                        <Upload size={18} /> New Admission
                    </button>
                    <button 
                        onClick={() => { setAppType('PROMOTION'); setStatus(null); }}
                        style={{ 
                            flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                            background: appType === 'PROMOTION' ? 'var(--surface)' : 'transparent',
                            boxShadow: appType === 'PROMOTION' ? 'var(--shadow-sm)' : 'none',
                            fontWeight: 700, color: appType === 'PROMOTION' ? 'var(--secondary)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
                        }}
                    >
                        <RefreshCw size={18} /> Promotion / Re-admit
                    </button>
                </div>

                {status && (
                    <div style={{ 
                        padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem',
                        backgroundColor: status.type === 'success' ? 'rgba(22, 101, 52, 0.1)' : 'rgba(153, 27, 27, 0.1)',
                        color: status.type === 'success' ? '#22c55e' : '#ef4444',
                        border: '1px solid currentColor', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
                            {status.type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
                            {status.message}
                        </div>
                        {generatedId && (
                            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>YOUR PERMANENT STUDENT ID</p>
                                <strong style={{ fontSize: '1.5rem', letterSpacing: '2px', color: 'var(--primary)' }}>{generatedId}</strong>
                                <p style={{ margin: '10px 0 0', fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
                                    Your application is now <strong>PENDING</strong> for administrator approval. Once approved, you can login using this ID and your chosen password.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                    {appType === 'PROMOTION' && (
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label>Current Student ID</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    required 
                                    placeholder="E.g. RPHS20250001" 
                                    value={formData.previousStudentId} 
                                    onChange={e => {
                                        setFormData({...formData, previousStudentId: e.target.value.toUpperCase()});
                                        if (eligibility.checked) setEligibility({ checked: false, loading: false, data: null });
                                    }} 
                                    onBlur={e => checkEligibility(e.target.value)}
                                />
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {eligibility.loading && <RefreshCw size={16} className="animate-spin" />}
                                    {!eligibility.loading && eligibility.checked && !eligibility.data?.error && <CheckCircle size={16} color="#22c55e" />}
                                    {eligibility.data?.error && <Info size={16} color="#ef4444" />}
                                </div>
                            </div>
                            {eligibility.checked && eligibility.data?.error && (
                                <div style={{ 
                                    marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', 
                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444', fontSize: '0.85rem'
                                }}>
                                    <div style={{ fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Info size={16} /> Eligibility Warning
                                    </div>
                                    <p style={{ margin: 0, lineHeight: 1.4 }}>
                                        {eligibility.data.message} <br />
                                        <strong>{eligibility.data.details || 'Please contact the school office.'}</strong>
                                    </p>
                                </div>
                            )}
                            {eligibility.checked && !eligibility.data?.error && (
                                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
                                    ✓ Verified: {eligibility.data.studentName} ({eligibility.data.currentClass})
                                </div>
                            )}
                        </div>
                    )}

                    {appType === 'FRESH' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                            <div style={{ display: 'grid', gap: '0.4rem' }}>
                                <label>Full Name</label>
                                <input required placeholder="E.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div style={{ display: 'grid', gap: '0.4rem' }}>
                                <label>Email</label>
                                <input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label>Promoting to Class</label>
                            <select required value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>
                                {admissionStatus.allowedClasses && admissionStatus.allowedClasses.length > 0 ? (
                                    admissionStatus.allowedClasses.map(cls => (
                                        <option key={cls} value={cls}>{cls.replace('-', ' ')}</option>
                                    ))
                                ) : (
                                    [5, 6, 7, 8, 9, 10, 11, 12].map(num => <option key={num} value={`Class-${num}`}>Class {num}</option>)
                                )}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gap: '0.4rem' }}>
                            <label>Previous Roll No</label>
                            <input required type="number" placeholder="Roll No" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                        </div>
                    </div>

                    {(formData.className === 'Class-11' || formData.className === 'Class-12') && (
                        <div style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <GraduationCap size={18} /> Stream & Subject Selection
                            </h3>
                            
                            {eligibility.data?.currentClass === 'Class-11' && (
                                <div style={{ padding: '10px', background: 'var(--surface-hover)', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <Info size={14} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
                                    Note: Stream and subjects are carried forward from Class 11 and cannot be changed for Class 12.
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Stream</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['Science', 'Arts'].map(s => (
                                        <label key={s} style={{ 
                                            flex: 1, padding: '1rem', 
                                            border: formData.stream === s ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                                            borderRadius: '12px', cursor: eligibility.data?.currentClass === 'Class-11' ? 'not-allowed' : 'pointer',
                                            background: formData.stream === s ? 'var(--secondary)' : 'var(--surface)',
                                            color: formData.stream === s ? 'var(--primary)' : 'inherit',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                            fontWeight: formData.stream === s ? 700 : 500,
                                            transition: 'all 0.2s ease',
                                            opacity: (eligibility.data?.currentClass === 'Class-11' && formData.stream !== s) ? 0.5 : 1
                                        }}>
                                            <input 
                                                disabled={eligibility.data?.currentClass === 'Class-11'}
                                                type="radio" 
                                                name="stream" 
                                                value={s} 
                                                checked={formData.stream === s} 
                                                onChange={() => setFormData({...formData, stream: s, subjects: ['Bengali', 'English']})} 
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Choose Elective Subjects (Max 4)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ padding: '0.4rem 0.8rem', background: 'var(--surface-hover)', borderRadius: '20px', fontSize: '0.8rem', opacity: 0.6 }}>Bengali (Compulsory)</span>
                                        <span style={{ padding: '0.4rem 0.8rem', background: 'var(--surface-hover)', borderRadius: '20px', fontSize: '0.8rem', opacity: 0.6 }}>English (Compulsory)</span>
                                        {(formData.stream === 'Science' ? ['Physics', 'Chemistry', 'Biology', 'Maths', 'COMS', 'AI'] : ['Political Science', 'History', 'Education', 'Computer Application', 'Sanskrit']).map(sub => (
                                            <label key={sub} style={{ 
                                                padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '20px', fontSize: '0.8rem', 
                                                cursor: eligibility.data?.currentClass === 'Class-11' ? 'not-allowed' : 'pointer',
                                                background: formData.subjects.includes(sub) ? 'var(--secondary)' : 'var(--surface)',
                                                color: formData.subjects.includes(sub) ? 'var(--primary)' : 'inherit',
                                                opacity: (eligibility.data?.currentClass === 'Class-11' && !formData.subjects.includes(sub)) ? 0.5 : 1
                                            }}>
                                                <input 
                                                    disabled={eligibility.data?.currentClass === 'Class-11'}
                                                    type="checkbox" 
                                                    checked={formData.subjects.includes(sub)} 
                                                    onChange={(e) => {
                                                        const electives = formData.subjects.filter(s => !['Bengali', 'English'].includes(s));
                                                        if (e.target.checked) {
                                                            if (electives.length >= 4) return alert("Max 4 subjects");
                                                            setFormData({...formData, subjects: [...formData.subjects, sub]});
                                                        } else {
                                                            setFormData({...formData, subjects: formData.subjects.filter(x => x !== sub)});
                                                        }
                                                    }} style={{ display: 'none' }} 
                                                />
                                                {sub}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {appType === 'FRESH' && (
                        <>
                            <div style={{ display: 'grid', gap: '0.4rem' }}>
                                <label>Choose Secret Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ paddingLeft: '2.5rem' }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} /> Upload Documents
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {['aadharCard', 'pastMarksheet', 'birthCertificate', 'transferCertificate'].map(doc => (
                                        <div key={doc} style={{ display: 'grid', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{doc.replace(/([A-Z])/g, ' $1')} {formData.documents[doc] && <span style={{ color: '#22c55e' }}>✓ Uploaded</span>}</label>
                                            <input required={doc === 'aadharCard' || doc === 'pastMarksheet'} type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e.target.files[0], `documents.${doc}`)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', marginTop: '1rem', fontWeight: 800 }}>
                        {loading ? 'Submitting...' : 'Apply for Admission'}
                    </button>

                        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem' }}>
                            Check your application status? <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 700 }}>Log In</Link>
                        </p>
                    </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;
