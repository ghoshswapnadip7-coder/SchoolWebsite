import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Image as ImageIcon, CalendarPlus, Trash2, Plus, LogOut,
    CheckCircle, XCircle, Edit3, X, Users, Table as TableIcon, Search,
    UserPlus, Clock, BookOpen, User, ClipboardList, Bell, Check,
    AlertCircle, Award, CreditCard, Lock, Unlock, Download, Printer, ChevronRight, Hash, FileText, MessageSquare,
    RefreshCw, AlertTriangle, Loader2, Rocket, ToggleLeft, ToggleRight, Info
} from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--surface)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
            const res = await fetch(`${API_URL}/admin/results/status-summary`, {
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
            const res = await fetch(`${API_URL}/admin/results/publish-batch`, {
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
        <div style={{ flex: 1, padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: `1px solid ${color}`, boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: color }}>
                <Icon size={20} /> {title} ({items.length})
            </h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="scroll-card">
                {items.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No items.</p> : items.map((item, idx) => (
                    <div key={idx} style={{ padding: '8px', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong style={{ color: 'var(--text-main)' }}>{item.student?.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({item.student?.studentId})</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.semester}</div>
                            {item.issues && item.issues.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
                                    {item.issues.join(', ')}
                                </div>
                            )}
                        </div>
                        <button onClick={() => onSelectStudent(item.student)} style={{ border: 'none', background: 'none', color: 'var(--secondary)', cursor: 'pointer', fontWeight: 600 }}>View →</button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Publishing Overview <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Total Records: {summary.totalCount || 0})</small></h3>
                <button onClick={fetchSummary} className="btn" style={{ background: 'var(--surface-hover)', color: 'var(--text-main)', padding: '6px 12px', fontSize: '0.8rem' }}><RefreshCw size={14} /> Refresh</button>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <StatusCard title="Pending Drafts" items={summary.drafts} color="#f59e0b" icon={Clock} />
                <StatusCard title="Published History" items={summary.published.slice(0, 10)} color="#10b981" icon={CheckCircle} />
                <StatusCard title="Attention Needed" items={summary.errors} color="#ef4444" icon={AlertTriangle} />
            </div>

            <div style={{ padding: '2rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--secondary)', margin: '0 0 0.5rem 0' }}>Ready to Publish?</h3>
                <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                    {summary.drafts.length > 0 ? `There are ${summary.drafts.length} result sets waiting to be sent.` : 'No pending drafts to publish.'}
                </p>
                <button 
                    onClick={handleBatchPublish} 
                    className="btn" 
                    disabled={loading || summary.drafts.length === 0} 
                    style={{ 
                        background: summary.drafts.length === 0 ? 'var(--border-color)' : 'var(--secondary)', 
                        color: 'var(--primary)', 
                        padding: '12px 24px',
                        cursor: summary.drafts.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 800
                    }}
                >
                    {loading ? 'Processing...' : 'Publish All Drafts Now'}
                </button>
            </div>

            <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Batch Publication Report">
                <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="scroll-card">
                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '8px', color: 'var(--text-muted)' }}>Student</th>
                                <th style={{ color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ color: 'var(--text-muted)' }}>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchReport.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>{item.studentName}</strong><br/>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.studentId}</span>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: item.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.1)' : item.status === 'WARNING' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: item.status === 'SUCCESS' ? '#22c55e' : item.status === 'WARNING' ? '#eab308' : '#ef4444' }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', color: 'var(--text-main)' }}>{item.message}</td>
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
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>No students found matching your criteria.</div>;
    }

    if (isMobile) {
        return (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {students.map(s => (
                    <div key={s.id} onClick={() => onSelect(s)} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem', background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '2px solid var(--border-color)' }}>
                <tr>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENT PROFILE</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONTACT</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>STATUS</th>
                    <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTION</th>
                </tr>
            </thead>
            <tbody>
                {students.map(s => (
                    <tr key={s.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => onSelect(s)}>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={s.profilePic || `https://ui-avatars.com/api/?name=${s.name}`} alt={s.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{s.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                            </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>{s.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: s.isRestricted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: s.isRestricted ? '#ef4444' : '#22c55e', display: 'inline-block' }}>
                                {s.isRestricted ? 'Restricted' : 'Active'}
                            </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
    const [admissionSettings, setAdmissionSettings] = useState({ isOpen: false, expiryDate: '', allowedClasses: [] });
    const [toppers, setToppers] = useState([]);
    const [examSheets, setExamSheets] = useState([]);


    // Selection/UI State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentResults, setStudentResults] = useState([]);
    const [selectedClass, setSelectedClass] = useState('Class-10');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [loading, setLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('Academic Marks');
    
    // Form States
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', imageUrl: '', description: '', category: '' });
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', imageUrl: '' });
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', studentId: '', className: 'Class-10', rollNumber: '', profilePic: '' });
    const [studentSearch, setStudentSearch] = useState('');
    const [routineForm, setRoutineForm] = useState({ periods: [{ subject: '', teacher: '', startTime: '', endTime: '', room: '' }] });
    const [resultForm, setResultForm] = useState({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025', className: 'Class-10' });
    const [editingResult, setEditingResult] = useState(null);
    const [feesForm, setFeesForm] = useState({ amount: 0, dueDate: '', isPaid: false, paymentDate: new Date().toISOString().split('T')[0] });
    const [studentFilterClass, setStudentFilterClass] = useState('All');

    // Block Modal State
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [studentToBlock, setStudentToBlock] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    
    const [batchReport, setBatchReport] = useState([]);

    // Topper/ExamSheet Forms
    const [newTopper, setNewTopper] = useState({ name: '', class: 'Class-10', year: '', rank: '', imageUrl: '', videoUrl: '', message: '', details: '' });
    const [examSheetForm, setExamSheetForm] = useState({ title: '', sheetUrl: '', semester: 'Final Exam 2025', examDate: new Date().toISOString().split('T')[0] });
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
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: data });
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
            
            const fetchJSON = async (url) => {
                try {
                    const r = await fetch(url, { headers: h });
                    if (!r.ok) return null;
                    return await r.json();
                } catch (e) {
                    console.error(`Failed to fetch ${url}:`, e);
                    return null;
                }
            };

            const [resGallery, resEvents, resStudents, resRoutines, resRegRequests, resStudentRequests, resPayments, resAdmissionSettings, resToppers, resExamSheets] = await Promise.all([
                fetch(`${API_URL}/gallery`).then(res => res.ok ? res.json() : []).catch(() => []),
                fetch(`${API_URL}/events`).then(res => res.ok ? res.json() : []).catch(() => []),
                fetchJSON(`${API_URL}/admin/students`),
                fetchJSON(`${API_URL}/admin/routines`),
                fetchJSON(`${API_URL}/admin/registration-requests`),
                fetchJSON(`${API_URL}/admin/student-requests`),
                fetchJSON(`${API_URL}/admin/payments`),
                fetchJSON(`${API_URL}/admin/admission-settings`),
                fetchJSON(`${API_URL}/admin/toppers`),
                fetchJSON(`${API_URL}/admin/exam-sheets`)
            ]);

            setGalleryItems(Array.isArray(resGallery) ? resGallery : []);
            setEvents(Array.isArray(resEvents) ? resEvents : []);
            setStudents(Array.isArray(resStudents) ? resStudents : []);
            setRoutines(Array.isArray(resRoutines) ? resRoutines : []);
            setRegRequests(Array.isArray(resRegRequests) ? resRegRequests : []);
            setStudentRequests(Array.isArray(resStudentRequests) ? resStudentRequests : []);
            setPayments(Array.isArray(resPayments) ? resPayments : []);
            setToppers(Array.isArray(resToppers) ? resToppers : []);
            setExamSheets(Array.isArray(resExamSheets) ? resExamSheets : []);

            // Handle Admission Settings
            if (resAdmissionSettings) {
                setAdmissionSettings({
                    isOpen: resAdmissionSettings.isOpen,
                    expiryDate: resAdmissionSettings.expiryDate ? resAdmissionSettings.expiryDate.split('T')[0] : '',
                    allowedClasses: resAdmissionSettings.allowedClasses || []
                });
            }


        } catch (err) { console.error(err); }
    };

    const fetchStudentResults = async (sid) => {
        const res = await fetch(`${API_URL}/admin/results/${sid}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setStudentResults(await res.json());
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/admin/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(newStudent)
        });
        if (res.ok) { fetchData(); setNewStudent({ name: '', email: '', password: '', studentId: '', className: 'Class-10', rollNumber: '', profilePic: '' }); }
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${API_URL}/admin/students/${id}`, {
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
        await fetch(`${API_URL}/admin/students/${id}/toggle-block`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ reason })
        });
        fetchData();
        setBlockModalOpen(false);
        setStudentToBlock(null);
    };

    const handleUpdateFees = async (sid) => {
        await fetch(`${API_URL}/admin/students/${sid}/fees`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ 
                feesAmount: feesForm.amount, 
                feesDueDate: feesForm.dueDate, 
                isFeesPaid: feesForm.isPaid,
                paymentDate: feesForm.paymentDate
            })
        });
        setSelectedStudent(null);
        fetchData();
    };

    const handleUpdateAdmission = async () => {
        const res = await fetch(`${API_URL}/admin/admission-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(admissionSettings)
        });
        if (res.ok) {
            alert('Admission settings updated successfully!');
            fetchData();
        } else {
            alert('Failed to update settings');
        }
    };

    const handleAcceptReg = async (id) => {
        const res = await fetch(`${API_URL}/admin/registration-requests/${id}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchData();
    };

    const handleRejectReg = async (id) => {
        const res = await fetch(`${API_URL}/admin/registration-requests/${id}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchData();
    };

    const handleUpdateProfilePic = async (sid, url) => {
        const res = await fetch(`${API_URL}/admin/students/${sid}/profile-pic`, {
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
        await fetch(`${API_URL}/admin/student-requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ status, adminComment: comment })
        });
        fetchData();
    };

    const handleResultSubmit = async (e) => {
        e.preventDefault();
        const method = editingResult ? 'PUT' : 'POST';
        const url = editingResult ? `${API_URL}/admin/results/${editingResult.id}` : `${API_URL}/admin/results`;
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ ...resultForm, userId: selectedStudent.id })
        });
        if (res.ok) { fetchStudentResults(selectedStudent.id); setEditingResult(null); setResultForm({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025', className: 'Class-10' }); }
    };

    const handleAddGallery = async (e) => { 
        e.preventDefault(); 
        try {
            const res = await fetch(`${API_URL}/gallery`, { 
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
            const res = await fetch(`${API_URL}/events`, { 
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

    const handleDeleteEvent = async (id) => { await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); fetchData(); };
    const handleDeleteGallery = async (id) => { await fetch(`${API_URL}/gallery/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); fetchData(); };
    const handleSaveRoutine = async (e) => { e.preventDefault(); await fetch(`${API_URL}/admin/routines`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ className: selectedClass, day: selectedDay, periods: routineForm.periods }) }); fetchData(); };

    const handleAddTopper = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/admin/toppers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(newTopper)
            });
            if (!res.ok) throw new Error('Failed to add topper');
            fetchData();
            setNewTopper({ name: '', class: 'Class-10', year: '', rank: '', imageUrl: '', videoUrl: '', message: '', details: '' });
            alert('Topper added successfully!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteTopper = async (id) => {
        if (!confirm('Are you sure you want to delete this topper?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/toppers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to delete topper');
            fetchData();
            alert('Topper deleted successfully!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExamSheetSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/admin/students/${selectedStudent.id}/exam-sheets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(examSheetForm)
            });
            if (!res.ok) throw new Error('Failed to upload sheet');
            const data = await res.json();
            setExamSheets(prev => [data, ...prev]);
            setExamSheetForm({ title: '', sheetUrl: '', semester: 'Final Exam 2025', examDate: new Date().toISOString().split('T')[0] });
            alert('Exam sheet added successfully!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteExamSheet = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/exam-sheets/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed');
            setExamSheets(prev => prev.filter(s => s.id !== id));
        } catch (err) { alert(err.message); }
    };

    // Helper: Dynamic Student List (Table vs Card)
    const StudentList = ({ students, onSelect, actionLabel }) => {
        if (isMobile) {
            return (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {students.map(s => (
                        <div key={s.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{s.name}</span>
                                <span style={{ background: 'var(--background)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border-color)' }}>{s.class}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                ID: {s.studentId} • Roll: {s.rollNumber}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 800, 
                                    backgroundColor: s.isFeesPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    color: s.isFeesPaid ? '#22c55e' : '#ef4444' 
                                }}>
                                    {s.isFeesPaid ? 'PAID' : 'UNPAID'}
                                </span>
                            </div>
                            <button 
                                onClick={() => onSelect ? onSelect(s) : (setActiveTab('results'), setSelectedStudent(s))} 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}
                            >
                                {actionLabel || 'View Results'} <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--background)', borderBottom: '2px solid var(--border-color)' }}>
                    <tr>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>ID</th>
                        <th style={{ color: 'var(--text-muted)' }}>Roll</th>
                        <th style={{ color: 'var(--text-muted)' }}>Name</th>
                        <th style={{ color: 'var(--text-muted)' }}>Class</th>
                        <th style={{ color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ color: 'var(--text-muted)' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{s.studentId}</td>
                            <td style={{ color: 'var(--text-main)' }}>{s.rollNumber}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                                    <img src={s.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-color)' }} />
                                    {s.name}
                                </div>
                            </td>
                            <td><span style={{ background: 'var(--background)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{s.class}</span></td>
                            <td>
                                <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '20px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 800, 
                                    backgroundColor: s.isFeesPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    color: s.isFeesPaid ? '#22c55e' : '#ef4444' 
                                }}>
                                    {s.isFeesPaid ? 'PAID' : 'UNPAID'}
                                </span>
                            </td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
                                    onClick={(e) => { e.stopPropagation(); onSelect ? onSelect(s) : (setActiveTab('results'), setSelectedStudent(s)); }}
                                >
                                    {actionLabel || 'View Results'}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteStudent(s.id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleToggleBlock(s); }} style={{ color: s.isBlocked ? '#22c55e' : '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>{s.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Helper: Registration Request Card
    const RegistrationCard = ({ r, onAccept, onReject }) => (
        <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
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
                                    <span key={idx} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--surface)', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#334155' }}>{sub}</span>
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
                        style={{ padding: '0.5rem 1rem', borderRadius: '2rem' }}
                    >
                        <option value="All">All Classes</option>
                        {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                    </select>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--background)', overflow: 'hidden' }}>
            <style>{`
                .nav-btn {
                    border: 1px solid transparent !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    margin-bottom: 4px;
                }
                .nav-btn:hover {
                    border-color: rgba(234, 179, 8, 0.3) !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    transform: translateX(4px);
                    box-shadow: -4px 0 0 var(--secondary);
                }
                .nav-btn.active {
                    background: var(--secondary) !important;
                    color: #0f172a !important;
                    box-shadow: var(--btn-glow) !important;
                    transform: translateX(6px);
                }
                /* Custom scrollbar for the card */
                .scroll-card::-webkit-scrollbar { width: 6px; }
                .scroll-card::-webkit-scrollbar-track { background: transparent; }
                .scroll-card::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
                .scroll-card::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div style={{ width: '270px', background: '#0f172a', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', zIndex: 10, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)', padding: '0 0.5rem' }}>
                        <LayoutDashboard size={28} />
                        AdminPanel
                    </div>
                    
                    <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }}>
                        {[
                            { id: 'students', label: 'Students', icon: Users },
                            { id: 'results', label: 'E-Results', icon: Award },
                            { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
                            { id: 'admission', label: 'Admission Launch', icon: Rocket },
                            { id: 'reg-requests', label: 'Registration Req.', icon: UserPlus, badge: regRequests.filter(r => r.status === 'PENDING').length },
                            { id: 'student-requests', label: 'Student Queries', icon: Bell, badge: studentRequests.filter(r => r.status === 'PENDING').length },
                            { id: 'routines', label: 'Routines', icon: TableIcon },
                            { id: 'toppers', label: 'Toppers', icon: Award },
                            { id: 'events', label: 'Events', icon: CalendarPlus },
                            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => { setActiveTab(tab.id); setSelectedStudent(null); }} 
                                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                                style={{ 
                                    padding: '0.85rem 1.25rem', 
                                    textAlign: 'left', 
                                    borderRadius: '12px',
                                    backgroundColor: 'transparent', 
                                    color: activeTab === tab.id ? '#0f172a' : '#94a3b8', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem', 
                                    fontWeight: 700, 
                                    position: 'relative',
                                }}
                            >
                                <tab.icon size={18} /> {tab.label}
                                {tab.badge > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>{tab.badge}</span>}
                            </button>
                        ))}
                    </div>

                    <button onClick={logout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', marginTop: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
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
                    <button onClick={() => setBlockModalOpen(false)} className="btn" style={{ background: 'var(--surface-hover)', color: 'var(--text-main)' }}>Cancel</button>
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


                <div className="scroll-card" style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
                    {/* STUDENTS */}
                    {activeTab === 'students' && (
                        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
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

                            <form onSubmit={handleAddStudent} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr 1fr 0.6fr 1.2fr 1fr 1fr auto', 
                                gap: '0.75rem', 
                                marginBottom: '2rem', 
                                padding: '1.25rem', 
                                background: 'var(--surface-hover)', 
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ gridColumn: '1/-1', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Add New Student</h3>
                                <input required placeholder="Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                                <input required type="email" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                                <input readOnly style={{ background: 'var(--surface)', opacity: 0.7, cursor: 'not-allowed' }} placeholder="ID: AUTO" value={newStudent.studentId} />
                                <input required type="number" placeholder="Roll" value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} />
                                <select value={newStudent.className} onChange={e => setNewStudent({...newStudent, className: e.target.value})}>
                                    {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                                </select>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="file" 
                                        id="student-photo"
                                        onChange={(e) => handleFileUpload(e.target.files[0], setNewStudent, 'profilePic')} 
                                        style={{ display: 'none' }}
                                    />
                                    <label 
                                        htmlFor="student-photo" 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '8px',
                                            padding: '0.75rem 1rem', 
                                            background: 'var(--background)', 
                                            border: '1px dashed var(--border-color)', 
                                            borderRadius: 'var(--radius-md)', 
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-muted)',
                                            margin: 0,
                                            height: '100%'
                                        }}
                                    >
                                        <ImageIcon size={16} /> {newStudent.profilePic ? 'Photo Selected' : 'Add Photo'}
                                    </label>
                                </div>
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
                                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', padding: '2rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: feesForm.isPaid ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Amount (₹) 
                                                <input type="number" style={{ marginTop: '0.5rem' }} value={feesForm.amount} onChange={e => setFeesForm({...feesForm, amount: e.target.value})} />
                                            </label>
                                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Due Date 
                                                <input type="date" style={{ marginTop: '0.5rem' }} value={feesForm.dueDate} onChange={e => setFeesForm({...feesForm, dueDate: e.target.value})} />
                                            </label>
                                            {feesForm.isPaid && (
                                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Payment Date 
                                                    <input type="date" style={{ marginTop: '0.5rem' }} value={feesForm.paymentDate} onChange={e => setFeesForm({...feesForm, paymentDate: e.target.value})} />
                                                </label>
                                            )}
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
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
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select a student from the directory to set individual fees.</p>
                                    </div>

                                    {/* QR Code Section */}
                                    <div style={{ 
                                        background: 'linear-gradient(135deg, var(--footer-bg) 0%, var(--primary-light) 100%)', 
                                        padding: '2.5rem', 
                                        borderRadius: '20px', 
                                        marginBottom: '3rem',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: 'var(--shadow-lg)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>School UPI Payment</h3>
                                            <p style={{ margin: 0, opacity: 0.9, maxWidth: '400px' }}>Scan this QR code to pay fees securely via any UPI App (GPay, PhonePe, Paytm). Please use Student ID as the reference.</p>
                                        </div>
                                        <div style={{ background: 'var(--surface)', padding: '10px', borderRadius: '12px' }}>
                                            <img 
                                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9641360922@fam&pn=Swapnadip%20Ghosh&mc=0000&mode=02&purpose=00" 
                                                alt="UPI QR" 
                                                style={{ width: '120px', height: '120px' }} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexDirection: isMobile ? 'column' : 'row', gap: '1rem' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Assign Fees to Student</p>
                                            <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
                                                <select value={studentFilterClass} onChange={(e) => setStudentFilterClass(e.target.value)} style={{ padding: '0.5rem', borderRadius: '2rem' }}>
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
                                                setFeesForm({
                                                    amount: s.feesAmount||0, 
                                                    dueDate: s.feesDueDate?s.feesDueDate.split('T')[0]:'', 
                                                    isPaid: s.isFeesPaid,
                                                    paymentDate: new Date().toISOString().split('T')[0]
                                                }); 
                                            }}
                                            actionLabel="Select for Fees"
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                                        <div style={{ flex: 1, padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Revenue</p>
                                            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', color: 'var(--secondary)' }}>₹{payments.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</h3>
                                        </div>
                                        <div style={{ flex: 1, padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Transactions</p>
                                            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', color: 'var(--text-main)' }}>{payments.length}</h3>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0 }}>Successful Transactions</h3>
                                        <button onClick={fetchData} className="btn" style={{ background: 'var(--surface-hover)', color: 'var(--text-main)', padding: '6px 12px', fontSize: '0.8rem' }}><RefreshCw size={14} /> Sync</button>
                                    </div>
                                    
                                    {isMobile ? (
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {payments.map(p => (
                                                <div key={p.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <strong style={{ color: 'var(--text-main)' }}>{p.user?.name}</strong>
                                                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>₹{p.amount}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.user?.studentId} • {new Date(p.paymentDate).toLocaleDateString()}</div>
                                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800 }}>SUCCESS</span>
                                                        <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.transactionId}</code>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--border-color)' }}>
                                                        <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>STUDENT</th>
                                                        <th style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>AMOUNT</th>
                                                        <th style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>METHOD</th>
                                                        <th style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>STATUS</th>
                                                        <th style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>TXN ID</th>
                                                        <th style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>DATE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payments.length === 0 ? (
                                                        <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions recorded yet.</td></tr>
                                                    ) : (
                                                        payments.map(p => (
                                                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                                <td style={{ padding: '12px 16px' }}>
                                                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.user?.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.studentId}</div>
                                                                </td>
                                                                <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{p.amount}</td>
                                                                <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--background)', padding: '2px 8px', borderRadius: '4px' }}>{p.paymentMethod || 'UPI'}</span></td>
                                                                <td>
                                                                    <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontWeight: 800 }}>
                                                                        SUCCESS
                                                                    </span>
                                                                </td>
                                                                <td><code style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.transactionId}</code></td>
                                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
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
                                    <h3 style={{ margin: 0 }}>Results & Portfolio: {selectedStudent.name}</h3>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                    {['Academic Marks', 'Physical Sheets'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveSubTab(tab)}
                                            style={{ 
                                                padding: '0.6rem 1.2rem', 
                                                background: 'none', 
                                                border: 'none', 
                                                borderBottom: activeSubTab === tab ? '3px solid var(--secondary)' : '3px solid transparent',
                                                color: activeSubTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: '0.2s'
                                            }}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {activeSubTab === 'Academic Marks' ? (
                                    <>
                                        <form onSubmit={handleResultSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '0.75rem', margin: '2rem 0', padding: '1.5rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                            <select 
                                                required 
                                                value={resultForm.className} 
                                                onChange={e => setResultForm({...resultForm, className: e.target.value})}
                                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            >
                                                <option value="">Select Class</option>
                                                {['Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5', 'Class-6', 'Class-7', 'Class-8', 'Class-9', 'Class-10', 'Class-11', 'Class-12'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                    {['Class-11', 'Class-12'].includes(selectedStudent.class) ? (
                                        <select 
                                            required 
                                            value={resultForm.subject} 
                                            onChange={e => setResultForm({...resultForm, subject: e.target.value})}
                                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
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
                                            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
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
                                        style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}
                                    />
                                    <input required placeholder="Semester" value={resultForm.semester} onChange={e => setResultForm({...resultForm, semester: e.target.value})} />
                                    <button type="submit" className="btn btn-primary">{editingResult ? 'Update Marks' : 'Add Entry'}</button>
                                    {editingResult && (
                                        <button 
                                            type="button" 
                                            className="btn" 
                                            onClick={() => { setEditingResult(null); setResultForm({ subject: '', marks: '', grade: '', semester: 'Final Exam 2025', className: 'Class-10' }); }}
                                            style={{ background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </form>

                                {Object.entries(studentResults.reduce((acc, curr) => {
                                    (acc[curr.semester] = acc[curr.semester] || []).push(curr);
                                    return acc;
                                }, {})).map(([semester, results]) => (
                                    <div key={semester} style={{  marginBottom: '2rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
                                            <h4 style={{ margin: 0, color: '#1e293b' }}>{semester}</h4>
                                            
                                            {results.every(r => r.isPublished) ? (
                                                <button 
                                                    disabled={!!sendingEmail}
                                                    onClick={async () => {
                                                        if(confirm(`Resend results for ${semester}? This will email the UPDATED result PDF.`)){
                                                            try {
                                                                setSendingEmail(semester);
                                                                const res = await fetch(`${API_URL}/admin/results/publish`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                                                    body: JSON.stringify({ studentId: selectedStudent.id, semester })
                                                                });
                                                                if(res.ok) { alert('Results Re-Published and Email Sent!'); fetchStudentResults(selectedStudent.id); }
                                                            } catch(e) { alert('Failed'); } finally { setSendingEmail(null); }
                                                        }
                                                    }}
                                                    className="btn" 
                                                    style={{ 
                                                        background: sendingEmail === semester ? 'var(--surface-hover)' : 'rgba(34, 197, 94, 0.1)', 
                                                        color: sendingEmail === semester ? 'var(--text-muted)' : '#22c55e', 
                                                        fontSize: '0.8rem', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px', 
                                                        cursor: sendingEmail ? 'not-allowed' : 'pointer',
                                                        border: `1px solid ${sendingEmail === semester ? 'var(--border-color)' : '#22c55e'}`,
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        fontWeight: 700,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {sendingEmail === semester ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />} 
                                                    {sendingEmail === semester ? 'Sending Email...' : 'Resend Email'}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        if(confirm(`Publish results for ${semester}?`)) {
                                                            fetch(`${API_URL}/admin/results/publish`, {
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
                                                    <div key={r.id} style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <strong>{r.subject}</strong>
                                                            <span style={{ fontWeight: 700, color: r.grade === 'F' ? '#dc2626' : '#166534' }}>{r.grade} ({r.marks})</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: r.isPublished ? 'green' : 'orange' }}>{r.isPublished ? 'Published' : 'Draft'}</span>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => { setEditingResult(r); setResultForm({ subject: r.subject, marks: r.marks, grade: r.grade, semester: r.semester }); }} style={{ color: '#3b82f6', background: 'none', border: 'none' }}><Edit3 size={16} /></button>
                                                                <button onClick={async () => { if(confirm('Delete?')) { await fetch(`${API_URL}/admin/results/${r.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}); fetchStudentResults(selectedStudent.id); } }} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead style={{ background: 'var(--surface-hover)', fontSize: '0.85rem', color: 'var(--text-muted)' }}><tr><th style={{ padding: '10px' }}>Subject</th><th>Marks</th><th>Grade</th><th>Status</th><th>Action</th></tr></thead>
                                                <tbody>
                                                    {results.map(r => (
                                                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                                                                <button onClick={async () => { if(confirm('Delete result?')) { await fetch(`${API_URL}/admin/results/${r.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}); fetchStudentResults(selectedStudent.id); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ))}
                            </>
                                ) : (
                                    <div>
                                        <form onSubmit={handleExamSheetSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '1rem', background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', alignItems: 'end' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Title</label>
                                                <input required placeholder="e.g. Math Paper" value={examSheetForm.title} onChange={e => setExamSheetForm({...examSheetForm, title: e.target.value})} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Semester</label>
                                                <input required value={examSheetForm.semester} onChange={e => setExamSheetForm({...examSheetForm, semester: e.target.value})} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Exam Date</label>
                                                <input type="date" required value={examSheetForm.examDate} onChange={e => setExamSheetForm({...examSheetForm, examDate: e.target.value})} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Upload Sheet {examSheetForm.sheetUrl && <span style={{ color: 'green' }}>✓</span>}</label>
                                                <input type="file" required={!examSheetForm.sheetUrl} onChange={e => handleFileUpload(e.target.files[0], setExamSheetForm, 'sheetUrl')} />
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}><Plus size={20} /></button>
                                        </form>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                            {examSheets.filter(s => {
                                                const studentId = selectedStudent.id || selectedStudent._id;
                                                return s.user === studentId || s.user?.id === studentId || s.user?._id === studentId;
                                            }).map(sheet => (
                                                <div key={sheet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sheet.title}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sheet.semester} • {new Date(sheet.examDate).toLocaleDateString()}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <a href={sheet.sheetUrl} target="_blank" rel="noreferrer" className="btn" style={{ padding: '6px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}><Info size={16} /></a>
                                                        <button onClick={() => handleDeleteExamSheet(sheet.id)} className="btn" style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {examSheets.filter(s => {
                                                const studentId = selectedStudent.id || selectedStudent._id;
                                                return s.user === studentId || s.user?.id === studentId || s.user?._id === studentId;
                                            }).length === 0 && (
                                                <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No sheets uploaded yet.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
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

                    {/* ADMISSION MANAGEMENT */}
                    {activeTab === 'admission' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Rocket style={{ color: 'var(--secondary)' }} /> Admission Launch Control</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Manage the school's admission window and automatic expiry.</p>
                                </div>
                                <div style={{ 
                                    padding: '10px 20px', 
                                    borderRadius: '30px', 
                                    background: admissionSettings.isOpen ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: admissionSettings.isOpen ? '#22c55e' : '#ef4444',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    border: '1px solid currentColor'
                                }}>
                                    STATUS: {admissionSettings.isOpen ? 'LIVE' : 'CLOSED'}
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2rem'
                            }}>
                                <div style={{ 
                                    background: 'var(--surface)', 
                                    padding: '2.5rem', 
                                    borderRadius: '24px', 
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-md)'
                                }}>
                                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>Global Settings</h3>
                                    
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            padding: '1.5rem', 
                                            background: 'var(--surface-hover)', 
                                            borderRadius: '16px',
                                            cursor: 'pointer'
                                        }} onClick={() => setAdmissionSettings(prev => ({ ...prev, isOpen: !prev.isOpen }))}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ 
                                                    width: '45px', height: '45px', borderRadius: '12px', 
                                                    background: admissionSettings.isOpen ? 'var(--secondary)' : 'var(--background)',
                                                    color: admissionSettings.isOpen ? 'var(--primary)' : 'var(--text-muted)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {admissionSettings.isOpen ? <Rocket size={24} /> : <Lock size={24} />}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>Admission Window</p>
                                                    <small style={{ color: 'var(--text-muted)' }}>Enable/Disable the public registration form</small>
                                                </div>
                                            </div>
                                            {admissionSettings.isOpen ? <ToggleRight size={40} className="text-secondary" /> : <ToggleLeft size={40} style={{ color: 'var(--text-muted)' }} />}
                                        </div>

                                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                                            <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={16} className="text-secondary" /> Admission Deadline (Expiry Date)
                                            </label>
                                            <input 
                                                type="date" 
                                                style={{ 
                                                    padding: '1rem', 
                                                    borderRadius: '12px', 
                                                    background: 'var(--background)', 
                                                    border: '1px solid var(--border-color)',
                                                    color: 'var(--text-main)',
                                                    width: '100%'
                                                }} 
                                                value={admissionSettings.expiryDate}
                                                onChange={e => setAdmissionSettings(prev => ({ ...prev, expiryDate: e.target.value }))}
                                            />
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                When admissions expire, the form will vanish from the site. This date also becomes the <strong>Automatic Fee Due Date</strong> for newly approved students.
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                                            <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Users size={16} className="text-secondary" /> Open Admissions for Classes
                                            </label>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                                                gap: '10px',
                                                padding: '1rem',
                                                background: 'var(--background)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                {[5,6,7,8,9,10,11,12].map(n => {
                                                    const className = `Class-${n}`;
                                                    const isSelected = (admissionSettings.allowedClasses || []).includes(className);
                                                    return (
                                                        <div 
                                                            key={n} 
                                                            onClick={() => {
                                                                const newClasses = isSelected
                                                                    ? admissionSettings.allowedClasses.filter(c => c !== className)
                                                                    : [...(admissionSettings.allowedClasses || []), className];
                                                                setAdmissionSettings(prev => ({ ...prev, allowedClasses: newClasses }));
                                                            }}
                                                            style={{ 
                                                                padding: '10px',
                                                                borderRadius: '10px',
                                                                border: isSelected ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                                                                background: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--surface)',
                                                                color: isSelected ? 'var(--secondary)' : 'var(--text-muted)',
                                                                textAlign: 'center',
                                                                cursor: 'pointer',
                                                                fontWeight: 800,
                                                                fontSize: '0.8rem',
                                                                transition: 'all 0.2s ease',
                                                                userSelect: 'none'
                                                            }}
                                                        >
                                                            Class {n}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Only selected classes will appear in the registration form. Use this to launch admissions for specific grades.
                                            </p>
                                        </div>

                                        <button 
                                            className="btn btn-primary" 
                                            style={{ padding: '1.2rem', marginTop: '1rem', fontWeight: 800, borderRadius: '12px' }}
                                            onClick={handleUpdateAdmission}
                                        >
                                            Apply Admission Changes
                                        </button>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--surface-hover)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={20} style={{ color: 'var(--secondary)' }} /> How it works</h3>
                                    <ul style={{ display: 'grid', gap: '1rem', padding: 0, listStyle: 'none', fontSize: '0.9rem' }}>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>1</div>
                                            <span style={{ lineHeight: 1.4 }}><strong>Admission Window</strong>: Toggling this OFF will immediately hide the Registration page for everyone.</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>2</div>
                                            <span style={{ lineHeight: 1.4 }}><strong>Expiry Logic</strong>: Even if the window is ON, it will automatically vanish exactly at midnight on the chosen Expiry Date.</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>3</div>
                                            <span style={{ lineHeight: 1.4 }}><strong>Fees Sync</strong>: This system ensures all admitted students in the same batch have exactly the same Fee Due Date.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REGISTRATION REQUESTS */}
                    {activeTab === 'reg-requests' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Admission Queue</h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Responses: {regRequests.length}</p>
                            </div>

                            {/* Section: New Admissions */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}>
                                    <UserPlus size={20} /> New Admission Applications (Fresh)
                                </h3>
                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    {regRequests.filter(r => r.applicationType === 'FRESH' && r.status === 'PENDING').length === 0 ? 
                                        <p style={{ padding: '2rem', background: 'var(--surface-hover)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>No pending fresh admissions.</p> : 
                                        regRequests.filter(r => r.applicationType === 'FRESH' && r.status === 'PENDING').map(r => (
                                            <RegistrationCard key={r.id} r={r} onAccept={handleAcceptReg} onReject={handleRejectReg} />
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Section: Promotions */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}>
                                    <RefreshCw size={20} /> Re-admission / Promotion Requests
                                </h3>
                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    {regRequests.filter(r => r.applicationType === 'PROMOTION' && r.status === 'PENDING').length === 0 ? 
                                        <p style={{ padding: '2rem', background: 'var(--surface-hover)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>No pending promotion requests.</p> : 
                                        regRequests.filter(r => r.applicationType === 'PROMOTION' && r.status === 'PENDING').map(r => (
                                            <RegistrationCard key={r.id} r={r} onAccept={handleAcceptReg} onReject={handleRejectReg} />
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Section: Processed Archive */}
                            <div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                    Decision Archive (Processed)
                                </h3>
                                <div style={{ display: 'grid', gap: '0.8rem' }}>
                                    {regRequests.filter(r => r.status !== 'PENDING').slice(0, 10).map(r => (
                                        <div key={r.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
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
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Awaiting Action: {studentRequests.filter(r => r.status === 'PENDING').length}</p>
                            </div>

                            {/* Section: Pending Queries */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bell size={20} /> New Queries & Updates
                                </h3>
                                <div style={{ display: 'grid', gap: '1.2rem', marginTop: '1.2rem' }}>
                                    {studentRequests.filter(r => r.status === 'PENDING').length === 0 ? 
                                        <p style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-hover)', borderRadius: '12px', color: 'var(--text-muted)' }}>Inbox zero! No active student queries.</p> : 
                                        studentRequests.filter(r => r.status === 'PENDING').map(req => (
                                            <div key={req.id} style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
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

                                                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.85rem' }}>
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
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                    Resolved Inbox (Archive)
                                </h3>
                                <div style={{ display: 'grid', gap: '0.8rem' }}>
                                    {studentRequests.filter(r => r.status !== 'PENDING').slice(0, 10).map(req => (
                                        <div key={req.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
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
                            <div style={{ background: 'var(--surface-hover)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
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
                                    <button onClick={() => setRoutineForm({periods: [...routineForm.periods, {subject:'', teacher:'', startTime:'', endTime:'', room:''}]})} className="btn" style={{ background: 'var(--surface)', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--border-color)' }}><Plus size={18} /> Add Period</button>
                                    <button onClick={handleSaveRoutine} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Save Routine</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TOPPERS */}
                    {activeTab === 'toppers' && (
                        <div>
                            <h2>Toppers Gallery Management</h2>
                            <form onSubmit={handleAddTopper} style={{ display: 'grid', gap: '1.2rem', background: 'var(--surface-hover)', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Add New Topper</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required placeholder="Topper Name" value={newTopper.name} onChange={e => setNewTopper({...newTopper, name: e.target.value})} />
                                    <select value={newTopper.class} onChange={e => setNewTopper({...newTopper, class: e.target.value})}>
                                        {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={`Class-${n}`}>Class {n}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required type="number" placeholder="Year (e.g., 2023)" value={newTopper.year} onChange={e => setNewTopper({...newTopper, year: e.target.value})} />
                                    <input required type="number" placeholder="Rank" value={newTopper.rank} onChange={e => setNewTopper({...newTopper, rank: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Profile Picture {newTopper.imageUrl && <span style={{ color: 'green' }}>✓ Ready</span>}</label>
                                        <input type="file" required={!newTopper.imageUrl} onChange={e => handleFileUpload(e.target.files[0], setNewTopper, 'imageUrl')} />
                                    </div>
                                    <input placeholder="Optional Video URL" value={newTopper.videoUrl} onChange={e => setNewTopper({...newTopper, videoUrl: e.target.value})} />
                                </div>
                                <textarea placeholder="Topper's Message/Quote" rows="2" value={newTopper.message} onChange={e => setNewTopper({...newTopper, message: e.target.value})}></textarea>
                                <textarea placeholder="Additional Details (e.g., achievements)" rows="3" value={newTopper.details} onChange={e => setNewTopper({...newTopper, details: e.target.value})}></textarea>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Add Topper</button>
                            </form>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {toppers.length === 0 ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No toppers added yet.</p> : toppers.map(topper => (
                                    <div key={topper.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                                        <img src={topper.imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover' }} alt={topper.name} />
                                        <div style={{ padding: '1rem' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{topper.name}</h4>
                                            <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class {topper.class?.split('-')[1]} • Rank {topper.rank} ({topper.year})</p>
                                            {topper.message && <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-main)' }}>"{topper.message}"</p>}
                                        </div>
                                        <button onClick={() => handleDeleteTopper(topper.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--surface)', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EVENTS */}
                    {activeTab === 'events' && (
                        <div>
                            <h2>School Events Calendar</h2>
                            <form onSubmit={handleAddEvent} style={{ display: 'grid', gap: '1.2rem', background: 'var(--surface-hover)', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Broadcast New Event</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required placeholder="Announcement / Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                                    <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <input required placeholder="Location / Venue" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Event Image {newEvent.imageUrl && '✓'}</label>
                                        <input type="file" onChange={e => handleFileUpload(e.target.files[0], setNewEvent, 'imageUrl')} />
                                    </div>
                                </div>
                                <textarea required placeholder="Provide event details, venue, and timing here..." rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Publish Event</button>
                            </form>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {events.length === 0 ? <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No upcoming events scheduled.</p> : events.map(ev => (
                                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div><strong style={{ fontSize: '1.1rem' }}>{ev.title}</strong> <br/> <small style={{ color: 'var(--text-muted)' }}>Scheduled for: {new Date(ev.date).toLocaleDateString()}</small></div>
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
                            <form onSubmit={handleAddGallery} style={{ display: 'grid', gap: '1.2rem', background: 'var(--surface-hover)', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)' }}>
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
                                {galleryItems.length === 0 ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Gallery is empty.</p> : galleryItems.map(item => (
                                    <div key={item.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                                        <img src={item.imageUrl} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt={item.title} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px', fontSize: '0.8rem' }}>{item.title}</div>
                                        <button onClick={() => handleDeleteGallery(item.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--surface)', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
