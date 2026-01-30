import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Image as ImageIcon, CalendarPlus, Trash2, Plus, LogOut,
    CheckCircle, XCircle, Edit3, X, Users, Table as TableIcon, Search,
    UserPlus, Clock, BookOpen, User, ClipboardList, Bell, Check,
    AlertCircle, Award, CreditCard, Lock, Unlock, Download, Printer, ChevronRight, Hash,
    RefreshCw, AlertTriangle
} from 'lucide-react';

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
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>{title}</h2>
                {children}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');
    
    // Core State
    const [galleryItems, setGalleryItems] = useState([]);
    const [events, setEvents] = useState([]);
    const [students, setStudents] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [regRequests, setRegRequests] = useState([]);
    const [studentRequests, setStudentRequests] = useState([]);
    const [payments, setPayments] = useState([]);

    // Selection/UI State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentResults, setStudentResults] = useState([]);
    const [selectedClass, setSelectedClass] = useState('Class-10');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', imageUrl: '', description: '', category: '' });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', imageUrl: '' });
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', studentId: '', className: 'Class-10', rollNumber: '', profilePic: '' });
    const [studentSearch, setStudentSearch] = useState('');
    const [routineForm, setRoutineForm] = useState({ periods: [{ subject: '', teacher: '', startTime: '', endTime: '', room: '' }] });
    const [resultForm, setResultForm] = useState({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025' });
    const [editingResult, setEditingResult] = useState(null);
    const [feesForm, setFeesForm] = useState({ amount: 0, dueDate: '', isPaid: false });

    // Block Modal State
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [studentToBlock, setStudentToBlock] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    useEffect(() => {
        if (selectedStudent && activeTab === 'results') {
            fetchStudentResults(selectedStudent.id);
        }
    }, [selectedStudent, activeTab]);

    useEffect(() => {
        if (activeTab === 'routines') {
            const r = routines.find(rt => rt.class === selectedClass && rt.day === selectedDay);
            if (r) setRoutineForm({ periods: r.periods });
            else setRoutineForm({ periods: [{ subject: '', teacher: '', startTime: '', endTime: '', room: '' }] });
        }
    }, [selectedClass, selectedDay, activeTab, routines]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const h = { 'Authorization': `Bearer ${token}` };
            
            const [g, e, s, r, reg, sr, p] = await Promise.all([
                fetch('http://localhost:5000/api/gallery').then(res => res.json()),
                fetch('http://localhost:5000/api/events').then(res => res.json()),
                fetch('http://localhost:5000/api/admin/students', { headers: h }).then(res => res.json()),
                fetch('http://localhost:5000/api/admin/routines', { headers: h }).then(res => res.json()),
                fetch('http://localhost:5000/api/admin/registration-requests', { headers: h }).then(res => res.json()),
                fetch('http://localhost:5000/api/admin/student-requests', { headers: h }).then(res => res.json()),
                fetch('http://localhost:5000/api/admin/payments', { headers: h }).then(res => res.json())
            ]);

            setGalleryItems(Array.isArray(g) ? g : []);
            setEvents(Array.isArray(e) ? e : []);
            setStudents(Array.isArray(s) ? s : []);
            setRoutines(Array.isArray(r) ? r : []);
            setRegRequests(Array.isArray(reg) ? reg : []);
            setStudentRequests(Array.isArray(sr) ? sr : []);
            setPayments(Array.isArray(p) ? p : []);
        } catch (err) { console.error(err); }
    };

    const fetchStudentResults = async (sid) => {
        const res = await fetch(`http://localhost:5000/api/admin/results/${sid}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setStudentResults(await res.json());
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/admin/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(newStudent)
        });
        if (res.ok) { fetchData(); setNewStudent({ name: '', email: '', password: '', studentId: '', className: 'Class-10', rollNumber: '', profilePic: '' }); }
    };

    const handleToggleBlock = (student) => {
        if (student.isBlocked) {
            // Unblock directly
            performBlockToggle(student.id, "");
        } else {
            // Open modal to block
            setStudentToBlock(student);
            setBlockReason("Violation of school policy");
            setBlockModalOpen(true);
        }
    };

    const performBlockToggle = async (id, reason) => {
        await fetch(`http://localhost:5000/api/admin/students/${id}/toggle-block`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ reason })
        });
        fetchData();
        setBlockModalOpen(false);
        setStudentToBlock(null);
    };

    const handleUpdateFees = async (sid) => {
        await fetch(`http://localhost:5000/api/admin/students/${sid}/fees`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ 
                feesAmount: feesForm.amount, 
                feesDueDate: feesForm.dueDate, 
                isFeesPaid: feesForm.isPaid 
            })
        });
        setSelectedStudent(null);
        fetchData();
    };

    const handleAcceptReg = async (id) => {
        const res = await fetch(`http://localhost:5000/api/admin/registration-requests/${id}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchData();
    };

    const handleRejectReg = async (id) => {
        const res = await fetch(`http://localhost:5000/api/admin/registration-requests/${id}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchData();
    };

    const handleUpdateProfilePic = async (sid, url) => {
        const res = await fetch(`http://localhost:5000/api/admin/students/${sid}/profile-pic`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ profilePic: url })
        });
        if (res.ok) {
            fetchData();
            alert('Profile picture updated successfully!');
        }
    };

    const handleUpdateQuery = async (id, status, comment) => {
        await fetch(`http://localhost:5000/api/admin/student-requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ status, adminComment: comment })
        });
        fetchData();
    };

    const handleResultSubmit = async (e) => {
        e.preventDefault();
        const method = editingResult ? 'PUT' : 'POST';
        const url = editingResult ? `http://localhost:5000/api/admin/results/${editingResult.id}` : 'http://localhost:5000/api/admin/results';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ ...resultForm, userId: selectedStudent.id })
        });
        if (res.ok) { fetchStudentResults(selectedStudent.id); setEditingResult(null); setResultForm({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025' }); }
    };

    const handleAddGallery = async (e) => { 
        e.preventDefault(); 
        try {
            const res = await fetch('http://localhost:5000/api/gallery', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, 
                body: JSON.stringify(newGalleryItem) 
            });
            if (!res.ok) throw new Error('Failed to add image');
            fetchData(); 
            setNewGalleryItem({title:'', imageUrl:'', description:'', category:''}); 
            alert('Image added successfully!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddEvent = async (e) => { 
        e.preventDefault(); 
        try {
            const res = await fetch('http://localhost:5000/api/events', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, 
                body: JSON.stringify(newEvent) 
            }); 
            if (!res.ok) throw new Error('Failed to add event');
            fetchData(); 
            setNewEvent({title:'', date:'', description:'', location:'', imageUrl:''}); 
            alert('Event published successfully!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteEvent = async (id) => { await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); fetchData(); };
    const handleDeleteGallery = async (id) => { await fetch(`http://localhost:5000/api/gallery/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); fetchData(); };
    const handleSaveRoutine = async (e) => { e.preventDefault(); await fetch('http://localhost:5000/api/admin/routines', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ className: selectedClass, day: selectedDay, periods: routineForm.periods }) }); fetchData(); };

    // Helper: Registration Request Card
    const RegistrationCard = ({ r, onAccept, onReject }) => (
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: 0 }}>{r.name}</h3>
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', background: r.applicationType === 'FRESH' ? '#dcfce7' : '#e0e7ff', color: r.applicationType === 'FRESH' ? '#166534' : '#3730a3', fontWeight: 800 }}>
                            {r.applicationType}
                        </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#64748b' }}>{r.email} | Target {r.class} | Roll: {r.rollNumber}</p>
                    {r.applicationType === 'PROMOTION' && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Prev ID: {r.previousStudentId}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onReject(r.id)} className="btn" style={{ background: '#fee2e2', color: '#dc2626' }}>Decline Request</button>
                    <button onClick={() => onAccept(r.id)} className="btn btn-primary"><Check size={18} /> Approve Account</button>
                </div>
            </div>
            
            {r.applicationType === 'FRESH' && r.documents && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '0.75rem' }}><strong style={{ display: 'block', color: '#64748b' }}>Aadhar</strong> {r.documents.aadharCard ? <a href={r.documents.aadharCard} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View Doc</a> : 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem' }}><strong style={{ display: 'block', color: '#64748b' }}>Marksheet</strong> {r.documents.pastMarksheet ? <a href={r.documents.pastMarksheet} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View Doc</a> : 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem' }}><strong style={{ display: 'block', color: '#64748b' }}>Birth Cert</strong> {r.documents.birthCertificate ? <a href={r.documents.birthCertificate} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View Doc</a> : 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem' }}><strong style={{ display: 'block', color: '#64748b' }}>TC</strong> {r.documents.transferCertificate ? <a href={r.documents.transferCertificate} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View Doc</a> : 'N/A'}</div>
                </div>
            )}
        </div>
    );

    // Helper: Student Selection List for Results/Fees tabs
    const StudentSelector = ({ onSelect, label }) => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>{label}</h2>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input placeholder="Search ID/Name..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ borderRadius: '2rem', paddingLeft: '2.5rem' }} />
                </div>
            </div>
            <table style={{ width: '100%', textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9' }}><tr><th style={{ padding: '12px' }}>ID</th><th>Roll</th><th>Name</th><th>Class</th><th>Action</th></tr></thead>
                <tbody>
                    {students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.includes(studentSearch)).map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{s.studentId}</td>
                            <td>{s.rollNumber}</td>
                            <td>{s.name}</td>
                            <td>{s.class}</td>
                            <td>
                                <button onClick={() => onSelect(s)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Select Student <ChevronRight size={14} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1.5rem 2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)' }}>
                <div><h1 style={{ color: 'var(--primary)', margin: 0 }}>Admin Panel</h1><p style={{ color: '#64748b', margin: 0 }}>School Management System</p></div>
                <button onClick={logout} className="btn" style={{ background: '#fee2e2', color: '#dc2626' }}><LogOut size={18} /> Logout</button>
            </div>

            <Modal isOpen={blockModalOpen} onClose={() => setBlockModalOpen(false)} title="Restrict Student Access">
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                    You are about to restrict access for <strong>{studentToBlock?.name}</strong>. 
                    They will not be able to login. Please provide a reason (this will be visible to the student).
                </p>
                <textarea 
                    autoFocus
                    placeholder="e.g. Disciplinary action pending..."
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                    <button onClick={() => setBlockModalOpen(false)} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
                    <button onClick={() => performBlockToggle(studentToBlock.id, blockReason)} className="btn" style={{ background: '#ef4444', color: 'white' }}>Confirm Restriction</button>
                </div>
            </Modal>

            <style>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .glow-dot {
                    width: 8px; height: 8px; background: #ef4444; border-radius: 50%;
                    position: absolute; top: -2px; right: -2px;
                    animation: pulse-red 2s infinite;
                }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[
                        { id: 'students', label: 'Students', icon: Users },
                        { id: 'results', label: 'E-Results', icon: Award },
                        { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
                        { id: 'reg-requests', label: 'Registration Req.', icon: UserPlus, badge: regRequests.filter(r => r.status === 'PENDING').length },
                        { id: 'student-requests', label: 'Student Queries', icon: Bell, badge: studentRequests.filter(r => r.status === 'PENDING').length },
                        { id: 'routines', label: 'Routines', icon: TableIcon },
                        { id: 'events', label: 'Events', icon: CalendarPlus },
                        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedStudent(null); }} style={{ padding: '0.8rem 1.2rem', textAlign: 'left', borderRadius: '12px', border: 'none', backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'white', color: activeTab === tab.id ? 'white' : 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, transition: '0.2s', boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none', position: 'relative' }}>
                            <tab.icon size={18} /> {tab.label}
                            {tab.badge > 0 && <div className="glow-dot"></div>}
                        </button>
                    ))}
                </div>

                <div className="card" style={{ padding: '2rem', minHeight: '600px' }}>
                    {/* STUDENTS */}
                    {activeTab === 'students' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>Student Directory</h2>
                                <div style={{ position: 'relative', width: '250px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input placeholder="Search ID/Name..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ borderRadius: '2rem', paddingLeft: '2.5rem' }} />
                                </div>
                            </div>
                            <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr) auto', gap: '0.4rem', marginBottom: '2.5rem', alignItems: 'end', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <input required placeholder="Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                                <input required type="email" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                                <input required placeholder="ID" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} />
                                <input required type="number" placeholder="Roll" value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} />
                                <select value={newStudent.className} onChange={e => setNewStudent({...newStudent, className: e.target.value})}>
                                    {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                                </select>
                                <input placeholder="Pic URL" value={newStudent.profilePic} onChange={e => setNewStudent({...newStudent, profilePic: e.target.value})} />
                                <input required type="password" placeholder="Pass" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} />
                                <button type="submit" className="btn btn-primary" style={{ height: '42px', width: '42px', padding: 0 }}><Plus size={20} /></button>
                            </form>
                            <table style={{ width: '100%', textAlign: 'left' }}>
                                <thead style={{ background: '#f1f5f9' }}><tr><th style={{ padding: '12px' }}>ID</th><th>Roll</th><th>Name</th><th>Email</th><th>Class</th><th>Action</th></tr></thead>
                                <tbody>
                                    {students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.includes(studentSearch)).map(s => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <img src={s.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    {s.studentId}
                                                </div>
                                            </td>
                                            <td>{s.rollNumber}</td>
                                            <td>{s.isBlocked && <AlertCircle size={14} color="red" />} {s.name}</td>
                                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</td>
                                            <td>{s.class}</td>
                                            <td>
                                                <button onClick={() => { setSelectedStudent(s); setActiveTab('results'); }} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginRight: '5px', background: '#e2e8f0' }}>Results</button>
                                                <button onClick={() => { 
                                                    const url = prompt('Enter Profile Picture URL:', s.profilePic);
                                                    if (url) handleUpdateProfilePic(s.id, url);
                                                }} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginRight: '5px', background: '#e0e7ff', color: '#3730a3' }}>Pic</button>
                                                <button onClick={() => { setSelectedStudent(s); setActiveTab('fees'); setFeesForm({amount: s.feesAmount||0, dueDate: s.feesDueDate?s.feesDueDate.split('T')[0]:'', isPaid: s.isFeesPaid}); }} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginRight: '5px', background: '#dcfce7', color: '#166534' }}>Fees</button>
                                                <button onClick={() => handleToggleBlock(s)} style={{ color: s.isBlocked ? 'green' : 'orange', background: 'none', border: 'none', cursor: 'pointer' }}>{s.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* FEES */}
                    {activeTab === 'fees' && (
                        <div>
                             {selectedStudent ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <button onClick={() => setSelectedStudent(null)} className="btn" style={{ background: '#F1F5F9' }}>← Back to List</button>
                                        <h3 style={{ margin: 0 }}>Fee Setup: {selectedStudent.name} <code>({selectedStudent.studentId})</code></h3>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Amount (₹) 
                                                <input type="number" style={{ marginTop: '0.5rem' }} value={feesForm.amount} onChange={e => setFeesForm({...feesForm, amount: e.target.value})} />
                                            </label>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Due Date 
                                                <input type="date" style={{ marginTop: '0.5rem' }} value={feesForm.dueDate} onChange={e => setFeesForm({...feesForm, dueDate: e.target.value})} />
                                            </label>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '10px', border: '1px solid #eee', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={feesForm.isPaid} onChange={e => setFeesForm({...feesForm, isPaid: e.target.checked})} style={{ width: '22px', height: '22px', cursor: 'pointer' }} /> 
                                            <span style={{ fontWeight: 600 }}>Mark as Paid</span>
                                        </label>
                                        <button onClick={() => handleUpdateFees(selectedStudent.id)} className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Save Fee Configuration</button>
                                    </div>
                                </div>
                             ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                                        <h2>Global Financials & Payments</h2>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Select a student from the directory to set individual fees.</p>
                                    </div>
                                    
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>Assign Fees to Student</p>
                                        <StudentSelector onSelect={(s) => { 
                                            setSelectedStudent(s); 
                                            setFeesForm({amount: s.feesAmount||0, dueDate: s.feesDueDate?s.feesDueDate.split('T')[0]:'', isPaid: s.isFeesPaid}); 
                                        }} label="Fee Assignment" />
                                    </div>

                                    <h3 style={{ marginTop: '3rem' }}>Successful Transactions</h3>
                                    <table style={{ width: '100%', textAlign: 'left', marginTop: '1rem' }}>
                                        <thead><tr style={{ background: '#f1f5f9' }}><th style={{ padding: '10px' }}>Student</th><th>Amount</th><th>Method</th><th>Status</th><th>TXN ID</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {payments.length === 0 ? <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No transactions recorded yet.</td></tr> : payments.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}><strong>{p.user?.name}</strong> <br/> <small>{p.user?.studentId}</small></td>
                                                    <td style={{ fontWeight: 700 }}>₹{p.amount}</td>
                                                    <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{p.paymentMethod || 'UPI'}</span></td>
                                                    <td><span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>SUCCESS</span></td>
                                                    <td><code>{p.transactionId}</code></td>
                                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             )}
                        </div>
                    )}

                    {/* RESULTS */}
                    {activeTab === 'results' && (
                        selectedStudent ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <button onClick={() => setSelectedStudent(null)} className="btn" style={{ background: '#F1F5F9' }}>← Back to Student List</button>
                                    <h3 style={{ margin: 0 }}>Results Management: {selectedStudent.name}</h3>
                                </div>
                                <form onSubmit={handleResultSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '0.75rem', margin: '2rem 0', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <input required placeholder="Subject" value={resultForm.subject} onChange={e => setResultForm({...resultForm, subject: e.target.value})} />
                                    <input required type="number" placeholder="Marks" value={resultForm.marks} onChange={e => setResultForm({...resultForm, marks: e.target.value})} />
                                    <input required placeholder="Grade" value={resultForm.grade} onChange={e => setResultForm({...resultForm, grade: e.target.value})} />
                                    <input required placeholder="Semester" value={resultForm.semester} onChange={e => setResultForm({...resultForm, semester: e.target.value})} />
                                    <button type="submit" className="btn btn-primary">{editingResult ? 'Update' : 'Add Entry'}</button>
                                </form>
                                <table style={{ width: '100%', textAlign: 'left', marginTop: '1rem' }}>
                                    <thead style={{ background: '#f1f5f9' }}><tr><th style={{ padding: '12px' }}>Subject</th><th>Marks</th><th>Grade</th><th>Semester/Term</th></tr></thead>
                                    <tbody>
                                        {studentResults.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No results uploaded for this student.</td></tr> : studentResults.map(r => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '12px' }}>{r.subject}</td><td>{r.marks}</td><td>{r.grade}</td><td>{r.semester}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div>
                                <StudentSelector onSelect={(s) => setSelectedStudent(s)} label="Academic Results Management" />
                            </div>
                        )
                    )}

                    {/* REGISTRATION REQUESTS */}
                    {activeTab === 'reg-requests' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Admission Queue</h2>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Responses: {regRequests.length}</p>
                            </div>

                            {/* Section: New Admissions */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '2px solid #eef2f6' }}>
                                    <UserPlus size={20} /> New Admission Applications (Fresh)
                                </h3>
                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    {regRequests.filter(r => r.applicationType === 'FRESH' && r.status === 'PENDING').length === 0 ? 
                                        <p style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0' }}>No pending fresh admissions.</p> : 
                                        regRequests.filter(r => r.applicationType === 'FRESH' && r.status === 'PENDING').map(r => (
                                            <RegistrationCard key={r.id} r={r} onAccept={handleAcceptReg} onReject={handleRejectReg} />
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Section: Promotions */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '2px solid #eef2f6' }}>
                                    <RefreshCw size={20} /> Re-admission / Promotion Requests
                                </h3>
                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    {regRequests.filter(r => r.applicationType === 'PROMOTION' && r.status === 'PENDING').length === 0 ? 
                                        <p style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0' }}>No pending promotion requests.</p> : 
                                        regRequests.filter(r => r.applicationType === 'PROMOTION' && r.status === 'PENDING').map(r => (
                                            <RegistrationCard key={r.id} r={r} onAccept={handleAcceptReg} onReject={handleRejectReg} />
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Section: Processed Archive */}
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eef2f6' }}>
                                    Decision Archive (Processed)
                                </h3>
                                <div style={{ display: 'grid', gap: '0.8rem' }}>
                                    {regRequests.filter(r => r.status !== 'PENDING').slice(0, 10).map(r => (
                                        <div key={r.id} style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                            <div>
                                                <strong>{r.name}</strong> <small style={{ color: '#94a3b8' }}>({r.studentId})</small>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email} | {r.applicationType}</div>
                                            </div>
                                            <span style={{ fontWeight: 800, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', backgroundColor: r.status === 'ACCEPTED' ? '#dcfce7' : '#fee2e2', color: r.status === 'ACCEPTED' ? '#166534' : '#991b1b' }}>
                                                {r.status}
                                            </span>
                                        </div>
                                    ))}
                                    {regRequests.filter(r => r.status !== 'PENDING').length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No history yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STUDENT QUERIES */}
                    {activeTab === 'student-requests' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>Student Support & Requests</h2>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Awaiting Action: {studentRequests.filter(r => r.status === 'PENDING').length}</p>
                            </div>

                            {/* Section: Pending Queries */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ borderBottom: '2px solid #eef2f6', paddingBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bell size={20} /> New Queries & Updates
                                </h3>
                                <div style={{ display: 'grid', gap: '1.2rem', marginTop: '1.2rem' }}>
                                    {studentRequests.filter(r => r.status === 'PENDING').length === 0 ? 
                                        <p style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>Inbox zero! No active student queries.</p> : 
                                        studentRequests.filter(r => r.status === 'PENDING').map(req => (
                                            <div key={req.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{req.type}</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', backgroundColor: '#fffbeb', color: '#92400e' }}>Pending</span>
                                                </div>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{req.subject}</h4>
                                                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>{req.description}</p>
                                                
                                                {req.type === 'PROFILE_UPDATE' && req.requestedProfilePic && (
                                                    <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <img src={req.requestedProfilePic} alt="New Pic" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Requested Profile Picture</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>Approve to update student profile</div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                    <strong>From:</strong> {req.user?.name} ({req.user?.studentId}) | Class: {req.user?.class}
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                                                    <input id={`comment-query-${req.id}`} placeholder="Add administrative comment..." style={{ flex: 1 }} defaultValue={req.adminComment} />
                                                    <button onClick={() => {
                                                        const comment = document.getElementById(`comment-query-${req.id}`).value;
                                                        handleUpdateQuery(req.id, 'APPROVED', comment);
                                                    }} className="btn" style={{ background: '#dcfce7', color: '#166534' }}>Approve</button>
                                                    <button onClick={() => {
                                                        const comment = document.getElementById(`comment-query-${req.id}`).value;
                                                        handleUpdateQuery(req.id, 'DECLINED', comment);
                                                    }} className="btn" style={{ background: '#fee2e2', color: '#991b1b' }}>Decline</button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Section: Resolved Workspace */}
                            <div>
                                <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eef2f6' }}>
                                    Resolved Inbox (Archive)
                                </h3>
                                <div style={{ display: 'grid', gap: '0.8rem' }}>
                                    {studentRequests.filter(r => r.status !== 'PENDING').slice(0, 10).map(req => (
                                        <div key={req.id} style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                            <div>
                                                <strong>{req.subject}</strong> <small style={{ color: '#94a3b8' }}>- {req.user?.name}</small>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Type: {req.type} | {new Date(req.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <span style={{ fontWeight: 800, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', backgroundColor: req.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: req.status === 'APPROVED' ? '#166534' : '#991b1b' }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ROUTINES */}
                    {activeTab === 'routines' && (
                        <div>
                            <h2>Class Routines Management</h2>
                            <div style={{ display: 'flex', gap: '1.5rem', margin: '2rem 0' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>Select Class
                                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ width: '220px' }}>{[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}</select>
                                </label>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>Select Day
                                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ width: '220px' }}>{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => <option key={d} value={d}>{d}</option>)}</select>
                                </label>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '1.5rem' }}>Periods for {selectedClass} - {selectedDay}</h4>
                                {routineForm.periods.map((p, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                                        <input placeholder="Subject" value={p.subject} onChange={e => { let n = [...routineForm.periods]; n[i].subject = e.target.value; setRoutineForm({periods: n}); }} />
                                        <input placeholder="Teacher" value={p.teacher} onChange={e => { let n = [...routineForm.periods]; n[i].teacher = e.target.value; setRoutineForm({periods: n}); }} />
                                        <input placeholder="Start" value={p.startTime} onChange={e => { let n = [...routineForm.periods]; n[i].startTime = e.target.value; setRoutineForm({periods: n}); }} />
                                        <input placeholder="End" value={p.endTime} onChange={e => { let n = [...routineForm.periods]; n[i].endTime = e.target.value; setRoutineForm({periods: n}); }} />
                                        <input placeholder="Room" value={p.room} onChange={e => { let n = [...routineForm.periods]; n[i].room = e.target.value; setRoutineForm({periods: n}); }} />
                                        <button onClick={() => { let n = routineForm.periods.filter((_, idx)=>idx!==i); if(n.length===0) n=[{subject:'', teacher:'', startTime:'', endTime:'', room:''}]; setRoutineForm({periods: n}); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button onClick={() => setRoutineForm({periods: [...routineForm.periods, {subject:'', teacher:'', startTime:'', endTime:'', room:''}]})} className="btn" style={{ background: '#e2e8f0', color: 'var(--primary)', fontWeight: 700 }}><Plus size={18} /> Add Period</button>
                                    <button onClick={handleSaveRoutine} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Save Routine</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EVENTS */}
                    {activeTab === 'events' && (
                        <div>
                            <h2>School Events Calendar</h2>
                            <form onSubmit={handleAddEvent} style={{ display: 'grid', gap: '1.2rem', background: '#f8fafc', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid #e2e8f0' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Broadcast New Event</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required placeholder="Announcement / Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                                    <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required placeholder="Location / Venue" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                                    <input placeholder="Flyer / Image URL (optional)" value={newEvent.imageUrl} onChange={e => setNewEvent({...newEvent, imageUrl: e.target.value})} />
                                </div>
                                <textarea required placeholder="Provide event details, venue, and timing here..." rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Publish Event</button>
                            </form>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {events.length === 0 ? <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No upcoming events scheduled.</p> : events.map(ev => (
                                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', border: '1px solid #eef2f6', borderRadius: '12px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div><strong style={{ fontSize: '1.1rem' }}>{ev.title}</strong> <br/> <small style={{ color: '#64748b' }}>Scheduled for: {new Date(ev.date).toLocaleDateString()}</small></div>
                                        <button onClick={() => handleDeleteEvent(ev.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} title="Delete event"><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GALLERY */}
                    {activeTab === 'gallery' && (
                        <div>
                            <h2>Media Gallery Management</h2>
                            <form onSubmit={handleAddGallery} style={{ display: 'grid', gap: '1.2rem', background: '#f8fafc', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid #e2e8f0' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Upload New Image</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required placeholder="Image Caption" value={newGalleryItem.title} onChange={e => setNewGalleryItem({...newGalleryItem, title: e.target.value})} />
                                    <select value={newGalleryItem.category} onChange={e => setNewGalleryItem({...newGalleryItem, category: e.target.value})}>
                                        <option value="">Select Category</option>
                                        <option value="Campus">Campus</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Events">Events</option>
                                        <option value="Academics">Academics</option>
                                    </select>
                                </div>
                                <input required placeholder="Direct Image URL (Static assets or Unsplash)" value={newGalleryItem.imageUrl} onChange={e => setNewGalleryItem({...newGalleryItem, imageUrl: e.target.value})} />
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Post to Gallery</button>
                            </form>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                {galleryItems.length === 0 ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Gallery is empty.</p> : galleryItems.map(item => (
                                    <div key={item.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                                        <img src={item.imageUrl} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt={item.title} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px', fontSize: '0.8rem' }}>{item.title}</div>
                                        <button onClick={() => handleDeleteGallery(item.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
