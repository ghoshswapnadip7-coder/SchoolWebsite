import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    User, GraduationCap, Calendar, Clock, MapPin, LogOut, Award, BookOpen,
    ClipboardList, Bell, Plus, CheckCircle, XCircle, AlertCircle, Send,
    CreditCard, Download, Printer, ShieldAlert, Smartphone, Banknote, ChevronRight
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Data States
    const [profile, setProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [routine, setRoutine] = useState([]);
    const [exams, setExams] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [payments, setPayments] = useState([]);
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({ subject: '', description: '', type: 'LEAVE' });
    const [submitting, setSubmitting] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    const SCHOOL_UPI = "9641360922@fam";

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const h = { 'Authorization': `Bearer ${token}` };

            const resProfile = await fetch('http://localhost:5000/api/student/profile', { headers: h });
            if (resProfile.status === 403) {
                const blockedData = await resProfile.json();
                setError(blockedData.message || blockedData.error);
                setBlocked(true);
                return;
            }
            const profileData = await resProfile.json();
            setProfile(profileData);

            const [resResults, resRoutine, resExams, resRequests, resPayments] = await Promise.all([
                fetch('http://localhost:5000/api/student/results', { headers: h }).then(r => r.json()),
                fetch(`http://localhost:5000/api/student/routine/${profileData.class || 'Class-10'}`).then(r => r.json()),
                fetch('http://localhost:5000/api/student/exams').then(r => r.json()),
                fetch('http://localhost:5000/api/student/requests', { headers: h }).then(r => r.json()),
                fetch('http://localhost:5000/api/student/payments', { headers: h }).then(r => r.json())
            ]);

            setResults(resResults || []);
            setRoutine(resRoutine || []);
            setExams(resExams || []);
            setMyRequests(resRequests || []);
            setPayments(resPayments || []);

        } catch (err) {
            setError("Service temporarily unavailable.");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulatePayment = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/student/pay-fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ 
                    amount: profile.feesAmount, 
                    semester: 'Monthly Fees - 2025',
                    paymentMethod: paymentMethod 
                })
            });
            if (res.ok) fetchData();
        } catch (err) { alert("Payment failed"); }
        finally { setSubmitting(false); }
    };

    const handlePrintBill = (payment) => {
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Bill - ${payment.transactionId}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .bill-container { border: 2px solid #e2e8f0; padding: 40px; border-radius: 8px; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
                        .status { background: #dcfce7; color: #166534; padding: 5px 15px; border-radius: 20px; font-weight: 700; font-size: 12px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
                        .item label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
                        .item span { font-size: 16px; font-weight: 600; }
                        .amount-box { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px; border: 1px solid #e2e8f0; }
                        .amount-box h2 { margin: 0; font-size: 32px; color: #0f172a; }
                        .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="bill-container">
                        <div class="header">
                            <div>
                                <h1>Ranaghat P.C.H(H.S).SCHOOL</h1>
                                <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Official Payment Receipt</p>
                            </div>
                            <div class="status">PAID SUCCESSFUL</div>
                        </div>
                        <div class="grid">
                            <div class="item"><label>Student Name</label><span>${profile?.name}</span></div>
                            <div class="item"><label>Student ID</label><span>${profile?.studentId}</span></div>
                            <div class="item"><label>Transaction ID</label><span>${payment.transactionId}</span></div>
                            <div class="item"><label>Payment Date</label><span>${new Date(payment.paymentDate).toLocaleString()}</span></div>
                            <div class="item"><label>Payment Method</label><span>${payment.paymentMethod || 'UPI'}</span></div>
                            <div class="item"><label>Semester/Term</label><span>${payment.semester}</span></div>
                        </div>
                        <div class="amount-box">
                            <label style="font-size: 12px; color: #64748b; text-transform: uppercase;">Total Amount Paid</label>
                            <h2>₹${payment.amount}.00</h2>
                        </div>
                        <div class="footer">
                            <p>This is a computer-generated receipt and does not require a physical signature.</p>
                            <p>Ranaghat, West Bengal 741201 | info@rphs.edu.in</p>
                        </div>
                    </div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleRequestProfilePic = async () => {
        const url = prompt("Paste the DIRECT IMAGE URL for your new profile picture (Unsplash/Imgur etc):");
        if (!url) return;
        
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/student/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ 
                    subject: 'Profile Picture Update Request',
                    description: `Requesting to update profile photo.`,
                    type: 'PROFILE_UPDATE',
                    requestedProfilePic: url
                })
            });
            if (res.ok) {
                alert("Request submitted! Your profile will update once an admin approves it.");
                fetchData();
            }
        } catch (err) { alert("Failed to submit request"); }
        finally { setSubmitting(false); }
    };

    const handlePrintResult = () => {
        const resultRows = results.map(r => `
            <tr><td>${r.subject}</td><td>${r.marks}</td><td>${r.grade}</td><td>${r.semester}</td></tr>
        `).join('');

        const printWindow = window.open('', '', 'height=800,width=1000');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Report Card - ${profile?.name}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { margin: 0; color: #0f172a; font-size: 28px; text-transform: uppercase; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
                        th, td { border: 1px solid #e2e8f0; padding: 15px; text-align: left; }
                        th { background: #f8fafc; font-size: 12px; text-transform: uppercase; }
                        .footer { margin-top: 100px; display: flex; justify-content: space-between; }
                        .sig { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 10px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="header"><h1>Ranaghat P.C.H(H.S).SCHOOL</h1><p>Academic Year 2024-25</p></div>
                    <div class="info-grid">
                        <div><strong>Name:</strong> ${profile?.name}</div>
                        <div><strong>ID:</strong> ${profile?.studentId}</div>
                        <div><strong>Class:</strong> ${profile?.class}</div>
                        <div><strong>Roll No:</strong> ${profile?.rollNumber}</div>
                    </div>
                    <table><thead><tr><th>Subject</th><th>Marks</th><th>Grade</th><th>Exam</th></tr></thead><tbody>${resultRows}</tbody></table>
                    <div class="footer"><div class="sig">Class Teacher</div><div class="sig">Principal</div></div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/student/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(requestForm)
            });
            if (res.ok) { fetchData(); setShowRequestForm(false); setRequestForm({ subject: '', description: '', type: 'LEAVE' }); }
        } catch (err) { alert("Failed to send request."); }
        finally { setSubmitting(false); }
    };

    if (blocked) {
        return (
            <div className="container" style={{ padding: '10rem 1rem', textAlign: 'center' }}>
                <ShieldAlert size={80} color="#ef4444" style={{ marginBottom: '2rem' }} />
                <h1 style={{ fontSize: '2.5rem' }}>Access Restricted</h1>
                <p style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>Please contact administration regarding your fee status.</p>
                <button onClick={logout} className="btn btn-primary">Logout</button>
            </div>
        );
    }

    if (loading) return <div className="spinner" style={{ marginTop: '10rem' }}></div>;

    const isFeesNear = profile?.feesDueDate && !profile.isFeesPaid && (new Date(profile.feesDueDate) - new Date() < 7 * 24 * 60 * 60 * 1000);

    return (
        <div className="container" style={{ padding: '3rem 1rem' }}>
            {isFeesNear && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '1.2rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertCircle size={24} />
                    <span><strong>Fee Reminder:</strong> ₹{profile.feesAmount} due by {new Date(profile.feesDueDate).toLocaleDateString()}</span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)', borderLeft: '6px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div 
                        onClick={handleRequestProfilePic}
                        title="Click to request profile picture change"
                        style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #e2e8f0', transition: '0.2s', position: 'relative' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <img src={profile?.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={12} />
                        </div>
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{profile?.name}</h1>
                        <p style={{ margin: 0, color: '#64748b' }}>{profile?.studentId} | {profile?.class} | Roll: {profile?.rollNumber}</p>
                    </div>
                </div>
                <button onClick={logout} className="btn" style={{ background: '#fee2e2', color: '#dc2626' }}><LogOut size={18} /> Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {/* Academic Records */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Award color="var(--secondary)" /> Academic Records</h2>
                            <button onClick={handlePrintResult} className="btn" style={{ background: '#f1f5f9', fontSize: '0.8rem' }}><Printer size={16} /> Print Card</button>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {results.map(res => (
                                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div><div style={{ fontWeight: 700 }}>{res.subject}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{res.semester}</div></div>
                                    <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800 }}>{res.marks}</div><div style={{ fontSize: '0.7rem', color: 'green', fontWeight: 700 }}>{res.grade}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fees & Billing */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard color="#0ea5e9" /> Fees & Payments</h2>
                        {!profile?.isFeesPaid ? (
                            <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <span>Pending Amount</span>
                                    <strong style={{ fontSize: '1.5rem', color: '#0369a1' }}>₹{profile?.feesAmount}</strong>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <button onClick={() => setPaymentMethod('UPI')} style={{ background: paymentMethod === 'UPI' ? '#0ea5e9' : 'white', color: paymentMethod === 'UPI' ? 'white' : '#64748b', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }}>
                                        <Smartphone size={18} /> UPI
                                    </button>
                                    <button onClick={() => setPaymentMethod('CASH')} style={{ background: paymentMethod === 'CASH' ? '#0ea5e9' : 'white', color: paymentMethod === 'CASH' ? 'white' : '#64748b', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }}>
                                        <Banknote size={18} /> Cash
                                    </button>
                                </div>

                                {paymentMethod === 'UPI' && (
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '10px', border: '1px dashed #0ea5e9' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>School UPI ID</p>
                                        <strong style={{ fontSize: '1.1rem', color: '#0ea5e9' }}>{SCHOOL_UPI}</strong>
                                    </div>
                                )}

                                <button onClick={handleSimulatePayment} disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                    {submitting ? 'Processing...' : `Confirm ${paymentMethod} Payment`}
                                </button>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', background: '#f0fdf4', color: '#166534', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={20} /> All dues clear.</div>
                        )}

                        <h3 style={{ fontSize: '1rem', marginTop: '2.5rem', marginBottom: '1.2rem' }}>Payment History</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {payments.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>₹{p.amount} <small style={{ color: '#64748b', fontWeight: 400, marginLeft: '5px' }}>via ${p.paymentMethod || 'UPI'}</small></div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(p.paymentDate).toLocaleDateString()}</div>
                                    </div>
                                    <button onClick={() => handlePrintBill(p)} className="btn" style={{ padding: '5px 10px', fontSize: '0.7rem', background: '#f1f5f9', color: 'var(--primary)', border: 'none' }}>
                                        <Download size={14} style={{ marginRight: '4px' }} /> Bill
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Support Desk */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Bell color="var(--primary)" /> Support Desk</h2>
                            <button onClick={() => setShowRequestForm(!showRequestForm)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>{showRequestForm ? 'Close' : 'New Request'}</button>
                        </div>
                        {showRequestForm ? (
                            <form onSubmit={handleRequestSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <select value={requestForm.type} onChange={e => setRequestForm({...requestForm, type: e.target.value})}><option value="LEAVE">Leave Application</option><option value="RESULT_ISSUE">Result Query</option><option value="FEES">Fees Related</option></select>
                                <input required placeholder="Subject" value={requestForm.subject} onChange={e => setRequestForm({...requestForm, subject: e.target.value})} />
                                <textarea required rows="3" placeholder="Message" value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})}></textarea>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>Send Request</button>
                            </form>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {myRequests.map(req => (
                                    <div key={req.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{req.type}</span>
                                            <span style={{ fontWeight: 800, color: req.status==='APPROVED'?'green':req.status==='DECLINED'?'red':'orange' }}>{req.status}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, marginTop: '5px' }}>{req.subject}</div>
                                        {req.adminComment && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'white', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', fontSize: '0.8rem', fontStyle: 'italic', color: '#475569' }}>
                                                <strong>Note:</strong> {req.adminComment}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock color="var(--primary)" /> Class Routine</h2>
                        {routine.map(day => (
                            <div key={day.id} style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>{day.day}</div>
                                {day.periods.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '5px 0' }}>
                                        <span><strong>{p.subject}</strong> <br/> <small>{p.teacher}</small></span>
                                        <span style={{ color: '#94a3b8' }}>{p.startTime}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
