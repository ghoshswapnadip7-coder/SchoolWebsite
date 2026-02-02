import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import useMobile from '../hooks/useMobile';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    User, GraduationCap, Calendar, Clock, MapPin, LogOut, Award, BookOpen,
    ClipboardList, Bell, Plus, CheckCircle, XCircle, AlertCircle, Send,
    CreditCard, Download, Printer, ShieldAlert, Smartphone, Banknote, ChevronRight, FileText, MessageSquare
} from 'lucide-react';

const Dashboard = ({ schoolConfig }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // Data States
    const [profile, setProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [performance, setPerformance] = useState([]); // For graph
    const [examSheets, setExamSheets] = useState([]); // Downloadable physical sheets
    const [routine, setRoutine] = useState([]);
    const [payments, setPayments] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [exams, setExams] = useState([]);
    const [notices, setNotices] = useState([]);
    
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

            const resProfile = await fetch(`${API_URL}/student/profile`, { headers: h });
            if (resProfile.status === 403) {
                const blockedData = await resProfile.json();
                setError(blockedData.message || blockedData.error);
                setBlocked(true);
                return;
            }
            const profileData = await resProfile.json();
            setProfile(profileData);

            const [resResults, resPerformance, resExamSheets, resRoutine, resExams, resRequests, resPayments, resNotices] = await Promise.all([
                fetch(`${API_URL}/student/results`, { headers: h }).then(r => r.json()),
                fetch(`${API_URL}/student/performance`, { headers: h }).then(r => r.json()),
                fetch(`${API_URL}/student/exam-sheets`, { headers: h }).then(r => r.json()),
                fetch(`${API_URL}/student/routine/${profileData.class || 'Class-10'}`).then(r => r.json()),
                fetch(`${API_URL}/student/exams`).then(r => r.json()),
                fetch(`${API_URL}/student/requests`, { headers: h }).then(r => r.json()),
                fetch(`${API_URL}/student/payments`, { headers: h }).then(r => r.json()),
                fetch(`${API_URL}/student/notices`, { headers: h }).then(r => r.json())
            ]);

            setResults(resResults || []);
            setPerformance(resPerformance || []);
            setExamSheets(resExamSheets || []);
            setRoutine(resRoutine || []);
            setExams(resExams || []);
            setMyRequests(resRequests || []);
            setPayments(resPayments || []);
            setNotices(Array.isArray(resNotices) ? resNotices : []);

        } catch (err) {
            setError("Service temporarily unavailable.");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulatePayment = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/student/pay-fees`, {
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
                                <h1>${schoolConfig.name}</h1>
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
                            <p>${schoolConfig.address} | ${schoolConfig.email}</p>
                        </div>
                    </div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubmitting(true);
        const data = new FormData();
        data.append('file', file);

        try {
            // 1. Upload Image
            const uploadRes = await fetch(`${API_URL}/upload`, { 
                method: 'POST', 
                body: data 
            });
            
            if (!uploadRes.ok) throw new Error('Image upload failed');
            const { url } = await uploadRes.json();

            // 2. Submit Request
            const res = await fetch(`${API_URL}/student/requests`, {
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
            } else {
                alert("Failed to create request.");
            }
        } catch (err) { 
            console.error(err);
            alert("Failed to submit request."); 
        } finally { 
            setSubmitting(false); 
        }
    };

    const handlePrintResult = () => {
        // Logic for Class 11/12: Best of 5 Logic
        // 1. Compulsory: Bengali (BEN), English (ENG)
        // 2. Electives: Top 3 are counted.
        // 3. Fail Conditions:
        //    - Junior (5-10): Fail in ANY subject (<30)
        //    - Senior (11-12): Fail in Compulsory OR Fail in >= 2 Electives
        
        const isSenior = ['Class-11', 'Class-12'].includes(profile?.class);
        let totalMarks = 0;
        let maxMarks = 0;
        let optionalSubjects = [];
        let isFail = false;
        
        const getM = (r) => Number(r.marks) || 0;
        // Pass mark is 30
        const isFailSubject = (r) => getM(r) < 30;

        if (isSenior) {
            // Improved regex to catch BEN, ENG
            const compulsory = results.filter(r => /^(ben|eng|bengali|english)/i.test(r.subject)); 
            const electives = results.filter(r => !/^(ben|eng|bengali|english)/i.test(r.subject));
            
            // 1. Check Compulsory Failures
            if (compulsory.some(isFailSubject)) {
                isFail = true;
            }

            // 2. Check Elective Failures (Fail if >= 2 electives failed)
            const failedElectives = electives.filter(isFailSubject);
            if (failedElectives.length >= 2) {
                isFail = true;
            }

            // Calculate Marks (Best 5)
            const sortedElectives = [...electives].sort((a, b) => getM(b) - getM(a));
            const validElectives = sortedElectives.slice(0, 3);
            
            if (sortedElectives.length > 3) {
                optionalSubjects = sortedElectives.slice(3).map(e => e.subject);
            }
            
            totalMarks = compulsory.reduce((sum, r) => sum + getM(r), 0) + 
                         validElectives.reduce((sum, r) => sum + getM(r), 0);
            maxMarks = 500;
        } else {
            // Junior: Fail if ANY subject < 30
            if (results.some(isFailSubject)) {
                isFail = true;
            }
            totalMarks = results.reduce((sum, r) => sum + getM(r), 0);
            maxMarks = results.length * 100;
        }

        // If Failed, do NOT show percentage
        const percentage = (maxMarks > 0 && !isFail) ? (totalMarks / maxMarks) * 100 : 0;
        
        let overallGrade = 'F';
        if (!isFail) {
            if (percentage >= 90) overallGrade = 'AA';
            else if (percentage >= 80) overallGrade = 'A+';
            else if (percentage >= 60) overallGrade = 'A';
            else if (percentage >= 50) overallGrade = 'B';
            else if (percentage >= 40) overallGrade = 'C';
            else if (percentage >= 30) overallGrade = 'D';
        } else {
            overallGrade = 'FAIL';
        }

        const resultRows = results.map(r => {
            const isOpt = isSenior && optionalSubjects.includes(r.subject);
            const isFailedLine = getM(r) < 30;
            return `
            <tr>
                <td style="text-align: left; padding-left: 20px;">
                    ${r.subject} 
                    ${isOpt ? '<span style="color: #94a3b8; font-size: 0.8rem; font-style: italic; margin-left: 5px;">(Optional)</span>' : ''}
                </td>
                <td style="text-align: right; padding-right: 20px; color: ${isFailedLine ? '#dc2626' : 'inherit'}; font-weight: ${isFailedLine ? 'bold' : 'normal'};">
                    ${r.marks}
                </td>
                <td style="text-align: center; color: ${r.grade === 'F' ? '#dc2626' : '#22c55e'}; font-weight: 700;">${r.grade}</td>
                <td style="text-align: center;">${r.semester}</td>
            </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank', 'height=800,width=1000');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Report Card - ${profile?.name}</title>
                    <style>
                        @page { size: A4; margin: 0; }
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
                        .header h1 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                        .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; }
                        th { background: #f1f5f9; font-size: 12px; text-transform: uppercase; font-weight: 700; color: #475569; }
                        .summary { background: #0f172a; color: white; padding: 25px; border-radius: 12px; margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; }
                        .summary div div:first-child { font-size: 11px; text-transform: uppercase; opacity: 0.8; margin-bottom: 8px; letter-spacing: 1px; }
                        .summary div div:last-child { font-size: 28px; font-weight: 700; }
                        .footer { margin-top: 80px; display: flex; justify-content: space-between; page-break-inside: avoid; }
                        .sig { text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 10px; font-weight: 600; font-size: 14px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; padding: 20px; }
                            .summary { background: #0f172a !important; color: white !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${schoolConfig.name}</h1>
                        <p>Estd: ${schoolConfig.foundedYear} | Annual Report Card | 2024-25</p>
                    </div>
                    <div class="info-grid">
                        <div><strong>Name:</strong> ${profile?.name}</div>
                        <div><strong>ID:</strong> ${profile?.studentId}</div>
                        <div><strong>Class:</strong> ${profile?.class}</div>
                        <div><strong>Roll No:</strong> ${profile?.rollNumber}</div>
                    </div>
                    <table><thead><tr><th>Subject</th><th>Marks</th><th>Grade</th><th>Exam</th></tr></thead><tbody>${resultRows}</tbody></table>
                    
                    <div class="summary">
                        <div><div>Total Marks</div><div>${isFail ? '---' : totalMarks + ' / ' + maxMarks}</div></div>
                        <div><div>Percentage</div><div>${isFail ? '---' : percentage.toFixed(2) + '%'}</div></div>
                        <div><div>Result Status</div><div style="color: ${isFail ? '#f87171' : '#4ade80'}">${overallGrade}</div></div>
                    </div>

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
            const res = await fetch(`${API_URL}/student/requests`, {
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

    const isMobile = useMobile();

    if (loading) return <div className="spinner" style={{ marginTop: '10rem' }}></div>;

    const isFeesNear = profile?.feesDueDate && !profile.isFeesPaid && (new Date(profile.feesDueDate) - new Date() < 7 * 24 * 60 * 60 * 1000);

    const PerformanceGraph = ({ data }) => {
        const width = 400;
        const height = 150;
        const paddingY = 20;
        const paddingX = 0;
        const maxValue = 100;

        if (!data || data.length === 0) {
            return (
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-hover)', borderRadius: '12px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', margin: '1rem 0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <BookOpen size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Performance graph will appear after results are published.</p>
                    </div>
                </div>
            );
        }
        
        const chartData = data;
        const points = chartData.map((d, i) => {
            const x = paddingX + (i * (width - 2 * paddingX) / (chartData.length - 1 || 1));
            const y = height - paddingY - (d.average * (height - 2 * paddingY) / maxValue);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div style={{ padding: '1.2rem 0' }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    {/* Grids */}
                    {[0, 25, 50, 75, 100].map(val => {
                        const y = height - paddingY - (val * (height - 2 * paddingY) / maxValue);
                        return <line key={val} x1={0} y1={y} x2={width} y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />;
                    })}
                    
                    {/* Path */}
                    <path d={`M ${points}`} fill="none" stroke="var(--secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Dots & Labels */}
                    {chartData.map((d, i) => {
                        const x = paddingX + (i * (width - 2 * paddingX) / (chartData.length - 1 || 1));
                        const y = height - paddingY - (d.average * (height - 2 * paddingY) / maxValue);
                        const isStart = i === 0;
                        const isEnd = i === chartData.length - 1;

                        return (
                            <g key={i}>
                                <circle cx={x} cy={y} r="5" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2.5" />
                                <text 
                                    x={x} 
                                    y={y - 12} 
                                    textAnchor={isStart ? 'start' : isEnd ? 'end' : 'middle'} 
                                    fontSize="11" 
                                    fill="var(--secondary)" 
                                    fontWeight="900"
                                    style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                                >
                                    {d.average}%
                                </text>
                                <text 
                                    x={x} 
                                    y={height + 15} 
                                    textAnchor={isStart ? 'start' : isEnd ? 'end' : 'middle'} 
                                    fontSize="9" 
                                    fill="var(--text-muted)"
                                    fontWeight="700"
                                >
                                    {d.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="container" style={{ padding: isMobile ? '1rem' : '3rem 1rem', paddingBottom: isMobile ? '80px' : '3rem' }}>
            {isFeesNear && (
                <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', color: '#f59e0b', padding: '1.2rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
                    <AlertCircle size={24} />
                    <span><strong>Fee Reminder:</strong> ₹{profile.feesAmount} due by {new Date(profile.feesDueDate).toLocaleDateString()}</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', backgroundColor: 'var(--surface)', padding: isMobile ? '1.5rem' : '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)', borderLeft: '6px solid var(--secondary)', gap: isMobile ? '1.5rem' : '0' }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '1.5rem', textAlign: isMobile ? 'center' : 'left' }}>
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        title="Click to request profile picture change"
                        style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--background)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--border-color)', transition: '0.2s', position: 'relative' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <img src={profile?.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={12} />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleProfilePicChange} 
                        />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.75rem', color: 'var(--text-main)' }}>{profile?.name}</h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{profile?.studentId} | {profile?.class} | Roll: {profile?.rollNumber}</p>
                    </div>
                </div>
                <button onClick={logout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: isMobile ? '100%' : 'auto' }}><LogOut size={18} /> Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Official Notices Section */}
                    <div className="card" style={{ borderLeft: '6px solid var(--primary)', background: 'linear-gradient(to right, var(--surface), var(--background))' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                            <MessageSquare color="var(--primary)" /> Recent School Notices
                        </h2>
                        {notices.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                {notices.map(notice => (
                                    <div key={notice._id || notice.id} style={{ padding: '1.2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{notice.title}</h3>
                                                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', background: notice.targetType === 'ALL' ? 'rgba(34, 197, 94, 0.1)' : notice.targetType === 'CLASS' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: notice.targetType === 'ALL' ? '#22c55e' : notice.targetType === 'CLASS' ? '#0ea5e9' : '#ef4444', fontWeight: 800 }}>
                                                        {notice.targetType === 'ALL' ? 'PUBLIC' : notice.targetType === 'CLASS' ? 'CLASS' : 'PERSONAL'}
                                                    </span>
                                                </div>
                                                <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(notice.createdAt).toLocaleDateString()}</small>
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{notice.content}</p>
                                        {notice.attachments && notice.attachments.filter(u => u && u !== 'undefined').length > 0 && (
                                            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {notice.attachments.filter(u => u && u !== 'undefined').map((url, idx) => (
                                                    <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'var(--background)', padding: '6px 12px', borderRadius: '20px', color: 'var(--secondary)', textDecoration: 'none', border: '1px solid var(--border-color)', fontWeight: 700 }}>
                                                        <FileText size={14} /> {`View Doc ${idx + 1}`}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--background)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                <MessageSquare size={32} style={{ opacity: 0.1, marginBottom: '10px' }} />
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>No active notices at this time.</p>
                            </div>
                        )}
                    </div>

                    {/* Performance Graph Card */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><BookOpen color="var(--primary)" /> Academic Growth</h2>
                        <PerformanceGraph data={performance} />
                    </div>

                    {/* Academic Records */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Award color="var(--secondary)" /> Performance Excellence</h2>
                            <button onClick={handlePrintResult} className="btn" style={{ background: 'var(--surface-hover)', color: 'var(--text-main)', fontSize: '0.8rem' }}><Printer size={16} /> Print Card</button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Semester Breakdown</h3>
                            <div style={{ display: 'grid', gap: '0.8rem' }}>
                                {results.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--background)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                        <Award size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No academic results published yet.</p>
                                    </div>
                                ) : results.map(res => (
                                    <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{res.subject}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{res.className} • {res.semester}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{res.marks}</div><div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>{res.grade}</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Physical Exam Sheets Section */}
                        {examSheets.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} className="text-secondary" /> Physical Exam Sheets
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {examSheets.map(sheet => (
                                        <a 
                                            key={sheet.id} 
                                            href={sheet.sheetUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px', 
                                                padding: '1rem', 
                                                background: 'var(--surface-hover)', 
                                                borderRadius: '12px', 
                                                border: '1px solid var(--border-color)',
                                                textDecoration: 'none',
                                                color: 'var(--text-main)',
                                                transition: '0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={e => e.currentTarget.style.transform = 'none'}
                                        >
                                            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px' }}>
                                                <Download size={16} />
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{sheet.title}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sheet.semester}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fees & Billing */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard color="#0ea5e9" /> Fees & Payments</h2>
                        {!profile?.isFeesPaid ? (
                            <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <span style={{ color: 'var(--text-main)' }}>Pending Amount</span>
                                    <strong style={{ fontSize: '1.5rem', color: '#0ea5e9' }}>₹{profile?.feesAmount}</strong>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <button onClick={() => setPaymentMethod('UPI')} style={{ background: paymentMethod === 'UPI' ? '#0ea5e9' : 'var(--surface)', color: paymentMethod === 'UPI' ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }}>
                                        <Smartphone size={18} /> UPI
                                    </button>
                                    <button onClick={() => setPaymentMethod('CASH')} style={{ background: paymentMethod === 'CASH' ? '#0ea5e9' : 'var(--surface)', color: paymentMethod === 'CASH' ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }}>
                                        <Banknote size={18} /> Cash
                                    </button>
                                </div>

                                {paymentMethod === 'UPI' && (
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px dashed #0ea5e9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>School UPI ID</p>
                                            <strong style={{ fontSize: '1.1rem', color: '#0ea5e9' }}>{SCHOOL_UPI}</strong>
                                        </div>
                                        <img 
                                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9641360922@fam&pn=Swapnadip%20Ghosh&mc=0000&mode=02&purpose=00" 
                                            alt="UPI QR" 
                                            style={{ width: '120px', height: '120px', padding: '5px', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
                                        />
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>Scan to Pay</p>
                                    </div>
                                )}

                                <button onClick={handleSimulatePayment} disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                    {submitting ? 'Processing...' : `Confirm ${paymentMethod} Payment`}
                                </button>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={20} /> All dues clear.</div>
                        )}

                        <h3 style={{ fontSize: '1rem', marginTop: '2.5rem', marginBottom: '1.2rem' }}>Payment History</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {payments.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--background)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>₹{p.amount} <small style={{ color: '#64748b', fontWeight: 400, marginLeft: '5px' }}>via ${p.paymentMethod || 'UPI'}</small></div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(p.paymentDate).toLocaleDateString()}</div>
                                    </div>
                                    <button onClick={() => handlePrintBill(p)} className="btn" style={{ padding: '5px 10px', fontSize: '0.7rem', background: 'var(--surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
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
                                     <div key={req.id} style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', position: 'relative', border: '1px solid var(--border-color)' }}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                             <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{req.type}</span>
                                             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                 <span style={{ fontWeight: 800, color: req.status==='APPROVED'?'#22c55e':req.status==='DECLINED'?'#ef4444':'#f59e0b' }}>{req.status}</span>
                                                 <button 
                                                     onClick={async () => {
                                                         if(!window.confirm('Hide this request from your dashboard?')) return;
                                                         await fetch(`${API_URL}/student/requests/${req.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                                                         fetchData();
                                                     }}
                                                     style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                                     title="Remove from view"
                                                 >
                                                     <XCircle size={14} />
                                                 </button>
                                             </div>
                                         </div>
                                         <div style={{ fontWeight: 600, marginTop: '5px', color: 'var(--text-main)' }}>{req.subject}</div>
                                         {req.adminComment && (
                                             <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: '8px', borderLeft: '3px solid var(--secondary)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                                 <strong style={{ color: 'var(--text-main)' }}>Note:</strong> {req.adminComment}
                                             </div>
                                         )}
                                     </div>
                                 ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Clock color="var(--primary)" /> Class Routine</h2>
                        {routine.map(day => (
                            <div key={day.id} style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem', paddingBottom: '4px' }}>{day.day}</div>
                                {day.periods.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-main)' }}><strong style={{ color: 'var(--primary)' }}>{p.subject}</strong> <br/> <small style={{ color: 'var(--text-muted)' }}>{p.teacher}</small></span>
                                        <span style={{ color: 'var(--text-muted)' }}>{p.startTime}</span>
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
