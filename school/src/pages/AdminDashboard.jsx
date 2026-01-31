import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Image as ImageIcon, CalendarPlus, Trash2, Plus, LogOut,
    CheckCircle, XCircle, Edit3, X, Users, Table as TableIcon, Search,
    UserPlus, Clock, BookOpen, User, ClipboardList, Bell, Check,
    AlertCircle, Award, CreditCard, Lock, Unlock, Download, Printer, ChevronRight, Hash,

    RefreshCw, AlertTriangle, Loader2
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

const ResultStatusDashboard = ({ onSelectStudent, token, onRefresh }) => {
    const [summary, setSummary] = useState({ drafts: [], published: [], errors: [] });
    const [loading, setLoading] = useState(false);
    
    // Batch Report Report State (Local to this component or lifted?)
    const [batchReport, setBatchReport] = useState([]);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            console.log('Fetching summary...');
            const res = await fetch('http://localhost:5000/api/admin/results/status-summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Summary Data:', data);
                setSummary(data);
            } else {
                console.error('Summary fetch failed with status:', res.status);
            }
        } catch (error) { console.error('Summary fetch error:', error); } finally { setLoading(false); }
    };

    const handleBatchPublish = async () => {
        if(!confirm('Are you sure you want to PUBLISH ALL PENDING RESULTS?')) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/results/publish-batch', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setBatchReport(data.report);
                setReportModalOpen(true);
                fetchSummary();
                onRefresh && onRefresh();
            } else { alert('Batch process failed.'); }
        } catch(err) { alert('Error connecting to server.'); } finally { setLoading(false); }
    };

    const StatusCard = ({ title, items, color, icon: Icon }) => (
        <div style={{ flex: 1, padding: '1.5rem', background: 'white', borderRadius: '12px', border: `1px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: color }}>
                <Icon size={20} /> {title} ({items.length})
            </h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No items.</p> : items.map((item, idx) => (
                    <div key={idx} style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{item.student?.name}</strong> <span style={{ color: '#64748b' }}>({item.student?.studentId})</span>
                            <div style={{ fontSize: '0.75rem', color: '#475569' }}>{item.semester}</div>
                            {item.issues && item.issues.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
                                    {item.issues.join(', ')}
                                </div>
                            )}
                        </div>
                        <button onClick={() => onSelectStudent(item.student)} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>View →</button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Publishing Overview <small style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>(Total Records: {summary.totalCount || 0})</small></h3>
                <button onClick={fetchSummary} className="btn" style={{ background: '#e2e8f0', padding: '6px 12px', fontSize: '0.8rem' }}><RefreshCw size={14} /> Refresh</button>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <StatusCard title="Pending Drafts" items={summary.drafts} color="#f59e0b" icon={Clock} />
                <StatusCard title="Published History" items={summary.published.slice(0, 10)} color="#10b981" icon={CheckCircle} />
                <StatusCard title="Attention Needed" items={summary.errors} color="#ef4444" icon={AlertTriangle} />
            </div>

            <div style={{ padding: '2rem', background: '#f0f9ff', borderRadius: '16px', border: '1px dashed #bae6fd', textAlign: 'center' }}>
                <h3 style={{ color: '#0369a1', margin: '0 0 0.5rem 0' }}>Ready to Publish?</h3>
                <p style={{ color: '#0c4a6e', marginBottom: '1.5rem' }}>
                    {summary.drafts.length > 0 ? `There are ${summary.drafts.length} result sets waiting to be sent.` : 'No pending drafts to publish.'}
                </p>
                <button 
                    onClick={handleBatchPublish} 
                    className="btn" 
                    disabled={loading || summary.drafts.length === 0} 
                    style={{ 
                        background: summary.drafts.length === 0 ? '#cbd5e1' : '#0369a1', 
                        color: 'white', 
                        padding: '12px 24px',
                        cursor: summary.drafts.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Processing...' : 'Publish All Drafts Now'}
                </button>
            </div>

            <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Batch Publication Report">
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Student</th>
                                <th>Status</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchReport.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px' }}>
                                        <strong>{item.studentName}</strong><br/>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.studentId}</span>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: item.status === 'SUCCESS' ? '#dcfce7' : item.status === 'WARNING' ? '#fef9c3' : '#fee2e2', color: item.status === 'SUCCESS' ? '#166534' : item.status === 'WARNING' ? '#854d0e' : '#991b1b' }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', color: '#334155' }}>{item.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                    <button onClick={() => setReportModalOpen(false)} className="btn btn-primary">Close</button>
                </div>
            </Modal>
        </div>
    );
};

// Custom hook to detect mobile
const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // Example breakpoint for mobile
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// Reusable Student List Component (Desktop: Table, Mobile: Cards)
const StudentList = ({ students, onSelect, actionLabel }) => {
    const isMobile = useMobile();

    if (!students || students.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>No students found matching your criteria.</div>;
    }

    if (isMobile) {
        return (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {students.map(s => (
                    <div key={s.id} onClick={() => onSelect(s)} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={s.profilePic || `https://ui-avatars.com/api/?name=${s.name}`} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</h4>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.studentId} • Class {s.class || s.className?.split('-')[1]}</div>
                        </div>
                        <ChevronRight size={20} color="#cbd5e1" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>STUDENT PROFILE</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>CONTACT</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>STATUS</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>ACTION</th>
                </tr>
            </thead>
            <tbody>
                {students.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => onSelect(s)} onMouseEnter={(e) => e.currentTarget.style.background='#fbfcfe'} onMouseLeave={(e) => e.currentTarget.style.background='white'}>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={s.profilePic || `https://ui-avatars.com/api/?name=${s.name}`} alt={s.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{s.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.studentId}</div>
                            </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>{s.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: s.isRestricted ? '#fee2e2' : '#dcfce7', color: s.isRestricted ? '#991b1b' : '#166534', display: 'inline-block' }}>
                                {s.isRestricted ? 'Restricted' : 'Active'}
                            </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {actionLabel || 'Manage'} <ChevronRight size={14} />
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');
    
    const isMobile = useMobile(); // Hook use



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
    const [sendingEmail, setSendingEmail] = useState(null);
    
    // Form States
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', imageUrl: '', description: '', category: '' });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', imageUrl: '' });
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', studentId: '', className: 'Class-10', rollNumber: '', profilePic: '' });
    const [studentSearch, setStudentSearch] = useState('');
    const [routineForm, setRoutineForm] = useState({ periods: [{ subject: '', teacher: '', startTime: '', endTime: '', room: '' }] });
    const [resultForm, setResultForm] = useState({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025' });
    const [editingResult, setEditingResult] = useState(null);
    const [feesForm, setFeesForm] = useState({ amount: 0, dueDate: '', isPaid: false });
    const [studentFilterClass, setStudentFilterClass] = useState('All');

    // Block Modal State
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [studentToBlock, setStudentToBlock] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    
    // Batch Report State
    const [batchReport, setBatchReport] = useState([]);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    // Mobile Navigation Tabs configuration (Dependent on Data State)
    const mobileTabs = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'results', label: 'Results', icon: Award },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'queries', label: 'Queries', icon: Bell, badge: studentRequests.filter(r => r.status === 'PENDING').length },
        { id: 'events', label: 'Events', icon: CalendarPlus }
    ];

    const handleFileUpload = async (file, setter, field) => {
        if (!file) return;
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: data });
            if (res.ok) {
                const { url } = await res.json();
                setter(prev => ({ ...prev, [field]: url }));
            } else { alert('Upload failed'); }
        } catch (err) { alert('Error uploading'); }
    };

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

    const handleDeleteStudent = async (id) => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                alert('Student deleted successfully.');
                fetchData();
            } else {
                const errorData = await res.json();
                alert(`Failed to delete student: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student.');
        }
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


    // Helper: Dynamic Student List (Table vs Card)
    const StudentList = ({ students, onSelect, actionLabel }) => {
        if (isMobile) {
            return (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {students.map(s => (
                        <div key={s.id} style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.name}</span>
                                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{s.class}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', display: 'grid', gap: '4px' }}>
                                <div>ID: {s.studentId}</div>
                                <div>Roll: {s.rollNumber}</div>
                            </div>
                            <button 
                                onClick={() => onSelect ? onSelect(s) : null} 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}
                            >
                                {actionLabel || 'Select Student'} <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <table style={{ width: '100%', textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9' }}><tr><th style={{ padding: '12px' }}>ID</th><th>Roll</th><th>Name</th><th>Email</th><th>Class</th><th>Action</th></tr></thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{s.studentId}</td>
                            <td>{s.rollNumber}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={s.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                    {s.name}
                                </div>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{s.email}</td>
                            <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{s.class}</span></td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setActiveTab('results'); setSelectedStudent(s); }}>View Results</button>
                                <button onClick={() => handleDeleteStudent(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                <button onClick={() => handleToggleBlock(s)} style={{ color: s.isBlocked ? 'green' : 'orange', background: 'none', border: 'none', cursor: 'pointer' }}>{s.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

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
                    
                    {r.stream && (
                        <div style={{ marginTop: '0.5rem', padding: '0.6rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>{r.stream} Stream • Selected Subjects</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {r.subjects?.map((sub, idx) => (
                                    <span key={idx} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#334155' }}>{sub}</span>
                                ))}
                            </div>
                        </div>
                    )}
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select 
                        value={studentFilterClass} 
                        onChange={(e) => setStudentFilterClass(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '2rem', border: '1px solid #e2e8f0' }}
                    >
                        <option value="All">All Classes</option>
                        {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                    </select>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input placeholder="Search ID/Name..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ borderRadius: '2rem', paddingLeft: '2.5rem' }} />
                    </div>
                </div>
            </div>
            <StudentList 
                students={students
                    .filter(s => studentFilterClass === 'All' || s.class === studentFilterClass)
                    .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.includes(studentSearch))}
                onSelect={onSelect}
                actionLabel="Select Student"
            />
        </div>
    );

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f8fafc', overflow: 'hidden' }}>
            <style>{`
                .nav-btn:hover {
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    background: rgba(255, 255, 255, 0.05);
                }
                /* Custom scrollbar for the card */
                .scroll-card::-webkit-scrollbar { width: 6px; }
                .scroll-card::-webkit-scrollbar-track { background: transparent; }
                .scroll-card::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .scroll-card::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div style={{ width: '260px', background: 'var(--primary)', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', zIndex: 10 }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--secondary)', borderRadius: '8px' }}></div>
                        AdminPanel
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
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
                            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedStudent(null); }} style={{ 
                                padding: '0.8rem 1.2rem', 
                                textAlign: 'left', 
                                borderRadius: '12px', 
                                border: 'none', 
                                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent', 
                                color: activeTab === tab.id ? 'white' : '#94a3b8', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem', 
                                fontWeight: 600, 
                                transition: 'all 0.2s ease-in-out', 
                                position: 'relative',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                                border: '1px solid transparent'
                            }} className="nav-btn">
                                <tab.icon size={18} /> {tab.label}
                                {tab.badge > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>{tab.badge}</span>}
                            </button>
                        ))}
                    </div>

                    <button onClick={logout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#f87171', marginTop: 'auto' }}>
                        <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, padding: isMobile ? '1rem' : '2.5rem', paddingBottom: isMobile ? '80px' : '2.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Mobile Header */}
                {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                         <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>AdminPanel</div>
                         <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444' }}><LogOut size={20} /></button>
                    </div>
                )}

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
            <div style={{ gap: '2rem', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>


                <div className="card scroll-card" style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}>
                    {/* STUDENTS */}
                    {activeTab === 'students' && (
                        <div className="card" style={{ padding: isMobile ? '1rem' : '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '2rem', gap: '1rem' }}>
                                <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem' }}>Student Directory</h2>
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
                                    <select value={studentFilterClass} onChange={(e) => setStudentFilterClass(e.target.value)}>
                                        <option value="All">All Classes</option>
                                        {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                                    </select>
                                    <input placeholder="Search..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                                </div>
                            </div>

                            {/* Add Student Form */}
                            <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr) auto', gap: '0.5rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <h3 style={{ gridColumn: '1/-1', fontSize: '1rem', marginBottom: '0.5rem', color: '#64748b' }}>Add New Student</h3>
                                <input required placeholder="Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                                <input required type="email" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                                <input required placeholder="ID" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} />
                                <input required type="number" placeholder="Roll" value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} />
                                <select value={newStudent.className} onChange={e => setNewStudent({...newStudent, className: e.target.value})}>
                                    {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                                </select>
                                <input type="file" onChange={(e) => handleFileUpload(e.target.files[0], setNewStudent, 'profilePic')} />
                                <input required type="password" placeholder="Pass" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} />
                                <button type="submit" className="btn btn-primary" style={{ height: '42px' }}><Plus size={20} /></button>
                            </form>
                            <StudentList 
                                students={students
                                    .filter(s => studentFilterClass === 'All' || s.class === studentFilterClass)
                                    .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.includes(studentSearch))} 
                                onSelect={(s) => { setActiveTab('results'); setSelectedStudent(s); }}
                                actionLabel="View Results"
                            />
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

                                    {/* QR Code Section */}
                                    <div style={{ 
                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                                        padding: '2rem', 
                                        borderRadius: '16px', 
                                        marginBottom: '3rem',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: 'var(--shadow-lg)'
                                    }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>School UPI Payment</h3>
                                            <p style={{ margin: 0, opacity: 0.9, maxWidth: '400px' }}>Scan this QR code to pay fees securely via any UPI App (GPay, PhonePe, Paytm). Please use Student ID as the reference.</p>
                                        </div>
                                        <div style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
                                            <img 
                                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9641360922@fam&pn=Swapnadip%20Ghosh&mc=0000&mode=02&purpose=00" 
                                                alt="UPI QR" 
                                                style={{ width: '120px', height: '120px' }} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexDirection: isMobile ? 'column' : 'row', gap: '1rem' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Assign Fees to Student</p>
                                            <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
                                                <select value={studentFilterClass} onChange={(e) => setStudentFilterClass(e.target.value)} style={{ padding: '0.5rem', borderRadius: '2rem', border: '1px solid #e2e8f0' }}>
                                                    <option value="All">All Classes</option>
                                                    {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                                                </select>
                                                <input placeholder="Search..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ borderRadius: '2rem', paddingLeft: '1rem', width: '100%' }} />
                                            </div>
                                        </div>
                                        <StudentList 
                                            students={students
                                                .filter(s => studentFilterClass === 'All' || s.class === studentFilterClass)
                                                .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentId.includes(studentSearch))}
                                            onSelect={(s) => { 
                                                setSelectedStudent(s); 
                                                setFeesForm({amount: s.feesAmount||0, dueDate: s.feesDueDate?s.feesDueDate.split('T')[0]:'', isPaid: s.isFeesPaid}); 
                                            }}
                                            actionLabel="Select for Fees"
                                        />
                                    </div>
                                    
                                    <h3 style={{ marginTop: '3rem' }}>Successful Transactions</h3>
                                    {isMobile ? (
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {payments.map(p => (
                                                <div key={p.id} style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '5px' }}>
                                                        <strong>{p.user?.name}</strong>
                                                        <span style={{ fontWeight: 800 }}>₹{p.amount}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.user?.studentId} • {new Date(p.paymentDate).toLocaleDateString()}</div>
                                                    <div style={{ marginTop: '5px', fontSize: '0.75rem' }}>
                                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>SUCCESS</span>
                                                        <span style={{ marginLeft: '10px', color: '#94a3b8' }}>{p.transactionId}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
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
                                    )}
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
                                    {['Class-11', 'Class-12'].includes(selectedStudent.class) ? (
                                        <select 
                                            required 
                                            value={resultForm.subject} 
                                            onChange={e => setResultForm({...resultForm, subject: e.target.value})}
                                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="">Select Subject</option>
                                            {[...new Set(['Bengali', 'English', ...(selectedStudent.subjects || [])])].map((s, i) => (
                                                <option key={i} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select 
                                            required 
                                            value={resultForm.subject} 
                                            onChange={e => setResultForm({...resultForm, subject: e.target.value})}
                                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="">Select Subject</option>
                                            {['Bengali', 'English', 'Mathematics', 'History', 'Geography', 'Life Science', 'Physical Science'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    )}
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="Marks" 
                                        value={resultForm.marks} 
                                        onChange={e => {
                                            const m = parseInt(e.target.value) || 0;
                                            let g = 'F';
                                            if (m >= 90) g = 'AA';
                                            else if (m >= 80) g = 'A+';
                                            else if (m >= 60) g = 'A';
                                            else if (m >= 50) g = 'B';
                                            else if (m >= 40) g = 'C';
                                            else if (m >= 30) g = 'D';
                                            setResultForm({...resultForm, marks: e.target.value, grade: g});
                                        }} 
                                    />
                                    <input 
                                        required 
                                        readOnly
                                        placeholder="Grade (Auto)" 
                                        value={resultForm.grade} 
                                        style={{ background: '#f1f5f9', color: '#64748b' }}
                                    />
                                    <input required placeholder="Semester" value={resultForm.semester} onChange={e => setResultForm({...resultForm, semester: e.target.value})} />
                                    <button type="submit" className="btn btn-primary">{editingResult ? 'Update Marks' : 'Add Entry'}</button>
                                    {editingResult && (
                                        <button 
                                            type="button" 
                                            className="btn" 
                                            onClick={() => { setEditingResult(null); setResultForm({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025' }); }}
                                            style={{ background: '#e2e8f0' }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </form>

                                {Object.entries(studentResults.reduce((acc, curr) => {
                                    (acc[curr.semester] = acc[curr.semester] || []).push(curr);
                                    return acc;
                                }, {})).map(([semester, results]) => (
                                    <div key={semester} style={{  marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
                                            <h4 style={{ margin: 0, color: '#1e293b' }}>{semester}</h4>
                                            
                                            {results.every(r => r.isPublished) ? (
                                                <button 
                                                    disabled={!!sendingEmail}
                                                    onClick={async () => {
                                                        if(confirm(`Resend results for ${semester}? This will email the UPDATED result PDF.`)){
                                                            try {
                                                                setSendingEmail(semester);
                                                                const res = await fetch('http://localhost:5000/api/admin/results/publish', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                                                    body: JSON.stringify({ studentId: selectedStudent.id, semester })
                                                                });
                                                                if(res.ok) { alert('Results Re-Published and Email Sent!'); fetchStudentResults(selectedStudent.id); }
                                                            } catch(e) { alert('Failed'); } finally { setSendingEmail(null); }
                                                        }
                                                    }}
                                                    className="btn" 
                                                    style={{ background: sendingEmail === semester ? '#e2e8f0' : '#dcfce7', color: sendingEmail === semester ? '#64748b' : '#166534', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: sendingEmail ? 'not-allowed' : 'pointer' }}
                                                >
                                                    {sendingEmail === semester ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} 
                                                    {sendingEmail === semester ? 'Sending...' : 'Resend Email'}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        if(confirm(`Publish results for ${semester}?`)) {
                                                            fetch('http://localhost:5000/api/admin/results/publish', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                                                body: JSON.stringify({ studentId: selectedStudent.id, semester })
                                                            }).then(res => { if(res.ok) { alert('Published!'); fetchStudentResults(selectedStudent.id); } });
                                                        }
                                                    }}
                                                    className="btn btn-primary" 
                                                    style={{ fontSize: '0.8rem' }}
                                                >
                                                    Publish
                                                </button>
                                            )}
                                        </div>

                                        {isMobile ? (
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {results.map(r => (
                                                    <div key={r.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <strong>{r.subject}</strong>
                                                            <span style={{ fontWeight: 700, color: r.grade === 'F' ? '#dc2626' : '#166534' }}>{r.grade} ({r.marks})</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: r.isPublished ? 'green' : 'orange' }}>{r.isPublished ? 'Published' : 'Draft'}</span>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => { setEditingResult(r); setResultForm({ subject: r.subject, marks: r.marks, grade: r.grade, semester: r.semester }); }} style={{ color: '#3b82f6', background: 'none', border: 'none' }}><Edit3 size={16} /></button>
                                                                <button onClick={async () => { if(confirm('Delete?')) { await fetch(`http://localhost:5000/api/admin/results/${r.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}); fetchStudentResults(selectedStudent.id); } }} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead style={{ background: '#f8fafc', fontSize: '0.85rem', color: '#64748b' }}><tr><th>Subject</th><th>Marks</th><th>Grade</th><th>Status</th><th>Action</th></tr></thead>
                                                <tbody>
                                                    {results.map(r => (
                                                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '8px' }}>{r.subject}</td>
                                                            <td>{r.marks}</td>
                                                            <td>
                                                                <span style={{ fontWeight: 700, color: r.grade === 'F' ? '#dc2626' : '#166534' }}>{r.grade}</span>
                                                                {r.grade === 'F' && <span style={{ marginLeft: '8px', fontSize: '0.6rem', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>FAILED</span>}
                                                            </td>
                                                            <td style={{ fontSize: '0.75rem', color: r.isPublished ? 'green' : 'orange' }}>
                                                                {r.isPublished ? 'Visible' : 'Draft'}
                                                            </td>
                                                            <td>
                                                                <button onClick={() => { setEditingResult(r); setResultForm({ subject: r.subject, marks: r.marks, grade: r.grade, semester: r.semester }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '10px' }}><Edit3 size={16} /></button>
                                                                <button onClick={async () => { if(confirm('Delete result?')) { await fetch(`http://localhost:5000/api/admin/results/${r.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}); fetchStudentResults(selectedStudent.id); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <StudentSelector onSelect={(s) => setSelectedStudent(s)} label="Academic Results Management" />
                                
                                {/* New Result Status Dashboard */}
                                <ResultStatusDashboard 
                                    onSelectStudent={(s) => setSelectedStudent(s)}
                                    token={localStorage.getItem('token')}
                                    onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
                                />
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
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Event Image {newEvent.imageUrl && '✓'}</label>
                                        <input type="file" onChange={e => handleFileUpload(e.target.files[0], setNewEvent, 'imageUrl')} />
                                    </div>
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
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Upload Image {newGalleryItem.imageUrl && <span style={{ color: 'green' }}>✓ Ready</span>}</label>
                                    <input type="file" required={!newGalleryItem.imageUrl} onChange={e => handleFileUpload(e.target.files[0], setNewGalleryItem, 'imageUrl')} />
                                </div>
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

            {/* Mobile Navigation */}
            {isMobile && !selectedStudent && (
                 <MobileNav tabs={mobileTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            )}

            </div>
        </div>
        </div>
    );
};

export default AdminDashboard;
