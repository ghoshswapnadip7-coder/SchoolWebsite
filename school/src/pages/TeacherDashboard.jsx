import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
    User, BookOpen, Bell, LogOut, Award, Camera, 
    Instagram, Twitter, Linkedin, Facebook, Video, Image,
    Plus, Edit3, Save, Trash2, Search, Filter, Shield, 
    Grid, Layout, FileText, Settings, UploadCloud, X, Check
} from 'lucide-react';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // UI State
    const [activeTab, setActiveTab] = useState('profile'); // profile, students, marks, notices
    const [activeProfileTab, setActiveProfileTab] = useState('grid'); // grid, vlogs, blogs
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    // Data State
    const [profile, setProfile] = useState(user || {});
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Marks System State
    const [selectedMarksClass, setSelectedMarksClass] = useState('All');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('Final Exam 2025');
    const [isMarksVisible, setIsMarksVisible] = useState(false);
    const [marksData, setMarksData] = useState({}); // { studentId: { marks, project, grade } }
    
    // Notices State
    const [notices, setNotices] = useState([]);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', targetType: 'CLASS', targetId: '' });
    const [activeNoticeSubTab, setActiveNoticeSubTab] = useState('authority'); // authority, sent
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    
    // Results Sub-tab State
    const [activeResultsSubTab, setActiveResultsSubTab] = useState('entry'); // entry, history
    const [marksHistory, setMarksHistory] = useState([]);
    
    // Forms
    const [editForm, setEditForm] = useState({});
    const [postForm, setPostForm] = useState({ type: 'MEDIA', caption: '', title: '', content: '', videoUrl: '', mediaUrl: '' });
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchTeacherData();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchTeacherData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        // console.log("Fetching Teacher Data from:", API_URL);

        try {
            const h = { 'Authorization': `Bearer ${token}` };
            
            const resProfile = await fetch(`${API_URL}/teacher/profile`, { headers: h });
            if (resProfile.ok) {
                const data = await resProfile.json();
                setProfile(data || {});
                setEditForm(data || {});
            } else if (resProfile.status === 404 || resProfile.status === 401) {
                // console.warn("Auth failed, redirecting...");
                logout();
                window.location.href = '/login'; // Force reload
                return;
            }
            fetchStudents('All');
            fetchNotices();
        } catch (err) {
            // console.error("Failed to load teacher data", err);
        } finally {
            // Only stop loading if we are still logged in (didn't redirect)
            if (localStorage.getItem('token')) setLoading(false);
        }
    };

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/notices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setNotices(await res.json());
        } catch (err) { /* console.error("Failed to fetch notices", err); */ }
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(noticeForm)
            });
            if (res.ok) {
                alert("Notice submitted for admin approval!");
                setNoticeForm({ title: '', content: '', targetType: 'CLASS', targetId: '' });
                setShowNoticeModal(false);
                fetchNotices();
            }
        } catch (err) { alert("Failed to submit notice"); }
    };

    // Load existing marks when class/semester changes
    useEffect(() => {
        if (activeTab === 'results' && isMarksVisible && selectedMarksClass !== 'All') {
            fetchExistingMarks();
        }
    }, [activeTab, isMarksVisible, selectedMarksClass, selectedSemester, selectedSubject]);

    const fetchExistingMarks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/results-summary?className=${selectedMarksClass}&semester=${selectedSemester}&subject=${selectedSubject}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const results = await res.json();
                const savedData = {};
                results.forEach(r => {
                    if (r.user?.studentId) {
                        savedData[r.user.studentId] = {
                            marks: r.marks,
                            project: r.projectMarks,
                            grade: r.grade,
                            saved: true,
                            isPublished: r.isPublished
                        };
                    } else if (r.user) {
                        // Fallback if user is just an ID
                        const student = students.find(s => s.id === r.user || s._id === r.user);
                        if (student) {
                            savedData[student.studentId] = {
                                marks: r.marks,
                                project: r.projectMarks,
                                grade: r.grade,
                                saved: true,
                                isPublished: r.isPublished
                            };
                        }
                    }
                });
                setMarksData(prev => ({ ...prev, ...savedData }));
            }
        } catch (err) { /* console.error("Failed to load existing marks", err); */ }
    };

    const fetchMarksHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/marks-history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setMarksHistory(await res.json());
        } catch (err) { /* console.error("Failed to fetch marks history", err); */ }
    };

    const fetchStudents = async (className) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/students?className=${className}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) setStudents(await res.json());
        } catch (err) { /* console.error(err); */ }
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                return data.url;
            }
        } catch (error) {
            // console.error("Upload failed", error);
            alert("Image upload failed");
        }
        return null;
    };

    const saveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setProfile(await res.json());
                setShowEditModal(false);
            }
        } catch (err) { alert("Save failed"); }
    };

    const handlePostSubmit = async () => {
        let updatedProfile = { ...profile };
        
        if (postForm.type === 'MEDIA') {
             // Logic handled inside the component for simplicity, in real app upload first then submit
             const newMedia = { type: 'IMAGE', url: postForm.mediaUrl, caption: postForm.caption };
             updatedProfile.gallery = [newMedia, ...(updatedProfile.gallery || [])];
        } else if (postForm.type === 'VLOG') {
            const newVlog = { title: postForm.title, description: postForm.content, videoUrl: postForm.videoUrl, date: new Date() };
            updatedProfile.vlogs = [newVlog, ...(updatedProfile.vlogs || [])];
        } else if (postForm.type === 'BLOG') {
            const newBlog = { title: postForm.title, content: postForm.content, image: postForm.mediaUrl, date: new Date() };
            updatedProfile.blogs = [newBlog, ...(updatedProfile.blogs || [])];
        }

        // Save
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedProfile)
            });
            if (res.ok) {
                setProfile(await res.json());
                setShowPostModal(false);
                setPostForm({ type: 'MEDIA', caption: '', title: '', content: '', videoUrl: '', mediaUrl: '' });
            }
        } catch (err) { alert("Post failed"); }
    };

    const handleMarksSave = async (studentId, studentRecordId) => {
        const data = marksData[studentId];
        if (!data || !selectedSubject) {
            alert("Please select a subject and enter marks.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    userId: studentRecordId,
                    subject: selectedSubject,
                    marks: data.marks || 0,
                    projectMarks: data.project || 0,
                    grade: data.grade || 'C',
                    semester: selectedSemester,
                    className: selectedMarksClass
                })
            });
            
            if (res.ok) {
                // Flash success or update UI
                const updated = { ...marksData };
                updated[studentId].saved = true;
                setMarksData(updated);
                setTimeout(() => {
                    const reset = { ...marksData };
                    if (reset[studentId]) reset[studentId].saved = false;
                    setMarksData(reset);
                }, 2000);
            } else {
                alert("Failed to save marks");
            }
        } catch (err) {
            alert("Error saving marks");
        }
    };

    const handleDeletePost = async (postToDelete) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        let updatedProfile = { ...profile };
        
        if (activeProfileTab === 'grid') {
            updatedProfile.gallery = updatedProfile.gallery.filter(p => p.url !== postToDelete.url);
        } else if (activeProfileTab === 'vlogs') {
            updatedProfile.vlogs = updatedProfile.vlogs.filter(v => v.videoUrl !== postToDelete.videoUrl || v.title !== postToDelete.title);
        } else if (activeProfileTab === 'blogs') {
            updatedProfile.blogs = updatedProfile.blogs.filter(b => b.title !== postToDelete.title);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedProfile)
            });
            if (res.ok) {
                setProfile(await res.json());
                setSelectedPost(null);
            }
        } catch (err) { alert("Delete failed"); }
    };

    const navItems = [
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'students', label: 'My Students', icon: <Search size={20} /> },
        { id: 'results', label: 'Marks Entry', icon: <Award size={20} /> },
        { id: 'notices', label: 'Notices', icon: <Bell size={20} /> },
    ];

    const getDesignationStyle = (des) => {
        const styles = {
            'HM': { bg: '#fee2e2', text: '#ef4444', label: 'Headmaster' },
            'Assistant HM': { bg: '#fff1f2', text: '#f43f5e', label: 'Assistant HM' },
            'Clerk': { bg: '#e0f2fe', text: '#0ea5e9', label: 'Office Clerk' },
            'Para teacher': { bg: '#fef3c7', text: '#d97706', label: 'Para Teacher' },
            'Arts': { bg: '#f0fdf4', text: '#22c55e', label: 'Faculty of Arts' },
            'Science': { bg: '#faf5ff', text: '#a855f7', label: 'Faculty of Science' }
        };
        return styles[des] || { bg: 'var(--surface-hover)', text: 'var(--text-muted)', label: des || 'Faculty' };
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            
            {/* Sidebar (Desktop Only) */}
            {!isMobile && (
            <aside style={{
                width: '260px',
                background: 'var(--surface)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column',
                position: 'sticky',
                top: 0, height: '100vh', zIndex: 100
            }}>
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={28} className="text-gradient" />
                    {!isMobile && <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Teacher<span className="text-secondary">Portal</span></h2>}
                </div>

                <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '12px 16px', borderRadius: '12px',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                                background: activeTab === item.id ? 'var(--surface-hover)' : 'transparent',
                                fontWeight: activeTab === item.id ? 600 : 500
                            }}
                        >
                            {item.icon}
                            {!isMobile && <span>{item.label}</span>}
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '1.5rem' }}>
                    <button onClick={logout} className="btn-logout" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <LogOut size={20} />
                        {!isMobile && <span>Logout</span>}
                    </button>
                </div>
            </aside>
            )}

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: 'var(--surface)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
                    padding: '8px 0', zIndex: 1000,
                    height: '60px'
                }}>
                    {navItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: '4px', flex: 1, cursor: 'pointer',
                                color: activeTab === item.id ? 'var(--text-main)' : 'var(--text-muted)'
                            }}
                        >
                            {React.cloneElement(item.icon, { 
                                size: 24, 
                                strokeWidth: activeTab === item.id ? 2.5 : 2 
                            })}
                        </div>
                    ))}
                    <div 
                        onClick={logout}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: '4px', flex: 1, cursor: 'pointer', color: 'var(--text-muted)'
                        }}
                    >
                         <LogOut size={24} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: 0, padding: 0, overflowY: 'auto', paddingBottom: isMobile ? '60px' : '0' }}>
                
                {activeTab === 'profile' && (
                    <div style={{ maxWidth: '935px', margin: '0 auto', padding: '0 20px 30px' }}>
                         {/* Profile Header Container */}
                        <div style={{ padding: '0 20px 0 20px', paddingTop: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 150px) 1fr', gap: '30px', alignItems: 'flex-start', marginBottom: '20px' }}>
                                
                                {/* Avatar Column */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ 
                                        width: 'clamp(80px, 15vw, 150px)', 
                                        height: 'clamp(80px, 15vw, 150px)', 
                                        borderRadius: '50%', 
                                        padding: '3px', /* Gradient border space */
                                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                                        flexShrink: 0
                                    }}>
                                        <div style={{ background: 'var(--background)', width: '100%', height: '100%', borderRadius: '50%', padding: '3px' }}>
                                            <img 
                                                src={profile?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', height: '100%' }}>
                                    
                                    {/* Desktop: Name & Actions Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                        <h2 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', margin: 0, fontWeight: 400, color: 'var(--text-main)' }}>{profile?.name || 'Teacher'}</h2>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => setShowEditModal(true)} 
                                                className="btn" 
                                                style={{ 
                                                    padding: '7px 16px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.9rem', 
                                                    background: 'var(--surface-hover)', 
                                                    color: 'var(--text-main)',
                                                    border: 'none', 
                                                    fontWeight: 600, 
                                                    cursor: 'pointer' 
                                                }}
                                            >
                                                Edit Profile
                                            </button>
                                            <button 
                                                onClick={() => setShowPostModal(true)} 
                                                className="btn" 
                                                style={{ 
                                                    padding: '7px 16px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.9rem', 
                                                    background: 'var(--btn-primary-bg)', 
                                                    color: 'var(--btn-primary-text)',
                                                    border: 'none', 
                                                    fontWeight: 600, 
                                                    cursor: 'pointer' 
                                                }}
                                            >
                                                New Post
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '30px', fontSize: '1rem', color: 'var(--text-main)' }}>
                                        <span><strong>{(profile?.gallery?.length || 0) + (profile?.vlogs?.length || 0) + (profile?.blogs?.length || 0)}</strong> posts</span>
                                        <span><strong>{students.length}</strong> students</span>
                                        <span><strong>{profile?.subjects?.length || 0}</strong> subjects</span>
                                    </div>

                                    {/* Desktop Bio */}
                                    <div className="desktop-bio" style={{ display: 'none' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{profile?.subjects?.join(' • ')}</div>
                                        <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginTop: '5px' }}>{profile?.bio || "No bio yet."}</div>
                                        {profile?.socialLinks && (
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                                {profile.socialLinks.linkedIn && <a href={profile.socialLinks.linkedIn} target="_blank" style={{ color: 'var(--text-main)' }}><Linkedin size={20} /></a>}
                                                {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" style={{ color: 'var(--text-main)' }}><Twitter size={20} /></a>}
                                                {profile.socialLinks.instagram && <a href={profile.socialLinks.instagram} target="_blank" style={{ color: 'var(--text-main)' }}><Instagram size={20} /></a>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Bio (Below columns) */}
                            <div className="mobile-bio" style={{ display: 'block', marginBottom: '20px' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile?.subjects?.join(' • ')}</div>
                                <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginTop: '4px' }}>{profile?.bio || "No bio yet."}</div>
                                {profile?.socialLinks && (
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        {profile.socialLinks.linkedIn && <a href={profile.socialLinks.linkedIn} target="_blank" style={{ color: 'var(--text-main)' }}><Linkedin size={20} /></a>}
                                        {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" style={{ color: 'var(--text-main)' }}><Twitter size={20} /></a>}
                                        {profile.socialLinks.instagram && <a href={profile.socialLinks.instagram} target="_blank" style={{ color: 'var(--text-main)' }}><Instagram size={20} /></a>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '60px', 
                            marginBottom: '4px',
                            position: 'sticky',
                            top: 0,
                            background: 'var(--background)',
                            zIndex: 10,
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            {[
                                { id: 'grid', label: 'POSTS', icon: Grid },
                                { id: 'vlogs', label: 'VLOGS', icon: Video },
                                { id: 'blogs', label: 'BLOGS', icon: FileText },
                            ].map(tab => (
                                <div 
                                    key={tab.id}
                                    onClick={() => setActiveProfileTab(tab.id)}
                                    style={{ 
                                        flex: 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
                                        padding: '12px 0', 
                                        borderTop: activeProfileTab === tab.id ? '1px solid var(--text-main)' : '1px solid transparent',
                                        marginTop: '-1px',
                                        cursor: 'pointer',
                                        color: activeProfileTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px'
                                    }}
                                >
                                    <tab.icon size={20} strokeWidth={activeProfileTab === tab.id ? 2.5 : 1.5} />
                                    <span style={{ display: 'none', md: 'inline' }} className="tab-label">{tab.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: activeProfileTab === 'blogs' ? '1fr' : 'repeat(3, 1fr)', gap: '4px' }}>
                            {activeProfileTab === 'grid' && profile?.gallery?.map((img, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedPost(img)}
                                    style={{ aspectRatio: '1/1', position: 'relative', background: 'var(--surface-hover)', cursor: 'pointer', overflow: 'hidden' }} 
                                    className="instagram-post"
                                >
                                    <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                                    <div className="overlay" style={{ 
                                        position: 'absolute', 
                                        top: 0, left: 0, right: 0, bottom: 0, 
                                        background: 'rgba(0,0,0,0.5)', 
                                        opacity: 0, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        transition: 'opacity 0.2s', 
                                        color: 'white', 
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        padding: '10px'
                                    }}>
                                        {/* {img.caption} */}
                                    </div>
                                </div>
                            ))}
                            {activeProfileTab === 'vlogs' && profile?.vlogs?.map((vlog, i) => (
                                <div key={i} style={{ aspectRatio: '9/16', background: '#000', position: 'relative', overflow: 'hidden' }}>
                                    {vlog.videoUrl ? (
                                        <iframe 
                                            src={vlog.videoUrl.replace('watch?v=', 'embed/')} 
                                            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} 
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}><Video size={40} /></div>
                                    )}
                                     <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <Video size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }}/> {vlog.title}
                                    </div>
                                </div>
                            ))}
                             {activeProfileTab === 'blogs' && profile?.blogs?.map((blog, i) => (
                                <div key={i} style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px' }}>
                                    {blog.image && <div style={{ width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0 }}>
                                        <img src={blog.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                    </div>}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>{blog.title}</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                         
                         {/* Empty States */}
                         {activeProfileTab === 'grid' && (!profile?.gallery || profile?.gallery?.length === 0) && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Camera size={30} /></div>
                                <h3>Share Photos</h3>
                                <p>When you share photos, they will appear on your profile.</p>
                            </div>
                        )}
                         {activeProfileTab === 'vlogs' && (!profile?.vlogs || profile?.vlogs?.length === 0) && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><Video size={48} /><p>No vlogs yet</p></div>}
                         {activeProfileTab === 'blogs' && (!profile?.blogs || profile?.blogs?.length === 0) && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><FileText size={48} /><p>No articles yet</p></div>}
                    
                        <style>{`
                            @media (min-width: 768px) {
                                .mobile-bio { display: none !important; }
                                .desktop-bio { display: block !important; }
                                .tab-label { display: inline !important; }
                            }
                            .instagram-post:hover .overlay {
                                opacity: 1 !important;
                            }
                        `}</style>
                    </div>
                )}

                {/* Notices Tab */}
                {activeTab === 'notices' && (
                    <div style={{ padding: isMobile ? '20px' : '40px', maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Communications</h2>
                                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Authority updates and your class announcements.</p>
                            </div>
                            {!isMobile && (
                                <button 
                                    onClick={() => setShowNoticeModal(true)}
                                    className="btn" 
                                    style={{ 
                                        background: 'var(--btn-secondary-bg)', 
                                        color: 'var(--btn-secondary-text)', 
                                        display: 'flex', alignItems: 'center', gap: '8px', 
                                        padding: '10px 20px', borderRadius: '12px', fontWeight: 700,
                                        boxShadow: 'var(--btn-glow)'
                                    }}
                                >
                                    <Plus size={20} /> Create New Notice
                                </button>
                            )}
                        </div>
                        
                        {/* Mobile FAB for New Notice */}
                        {isMobile && (
                            <button
                                onClick={() => setShowNoticeModal(true)}
                                style={{
                                    position: 'fixed', bottom: '160px', right: '20px',
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    background: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)',
                                    border: 'none', boxShadow: 'var(--shadow-lg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 900
                                }}
                            >
                                <Plus size={28} />
                            </button>
                        )}

                        {/* Sub-Tabs */}
                        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                            <button 
                                onClick={() => setActiveNoticeSubTab('authority')}
                                style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: activeNoticeSubTab === 'authority' ? '3px solid var(--secondary)' : '3px solid transparent', color: activeNoticeSubTab === 'authority' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                            >
                                School Authority Notices
                            </button>
                            <button 
                                onClick={() => setActiveNoticeSubTab('sent')}
                                style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: activeNoticeSubTab === 'sent' ? '3px solid var(--secondary)' : '3px solid transparent', color: activeNoticeSubTab === 'sent' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                            >
                                My Sent Notices
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {activeNoticeSubTab === 'authority' ? (
                                notices.filter(n => n.targetType === 'TEACHER').length > 0 ? (
                                    notices.filter(n => n.targetType === 'TEACHER').map(notice => (
                                        <div key={notice._id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', borderLeft: '5px solid var(--secondary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{notice.title}</h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{notice.content}</p>
                                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.7rem', background: 'var(--surface-hover)', padding: '4px 10px', borderRadius: '10px', fontWeight: 600 }}>FROM: SCHOOL AUTHORITY</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                        <Bell size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>No notices from school authority yet.</p>
                                    </div>
                                )
                            ) : (
                                notices.filter(n => {
                                    if (!user) return false;
                                    const currentId = user.id || user._id || user.userId;
                                    const authorId = n.author?._id || n.author;
                                    return authorId === currentId;
                                }).length > 0 ? (
                                    notices.filter(n => {
                                        if (!user) return false;
                                        const currentId = user.id || user._id || user.userId;
                                        const authorId = n.author?._id || n.author;
                                        return authorId === currentId;
                                    }).map(notice => (
                                        <div key={notice._id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{notice.title}</h3>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ 
                                                        fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                                                        background: notice.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.1)' : (notice.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                                        color: notice.status === 'PUBLISHED' ? '#22c55e' : (notice.status === 'PENDING' ? '#f59e0b' : '#ef4444')
                                                    }}>
                                                        {notice.status}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6 }}>{notice.content}</p>
                                            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: <strong>{notice.targetType} {notice.targetId}</strong></span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                        <Bell size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>You haven't sent any notices yet.</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Notice Creation Modal */}
                        {showNoticeModal && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                <div style={{ background: 'var(--surface)', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0 }}>Create New Notice</h3>
                                        <button onClick={() => setShowNoticeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleNoticeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                                            <input required value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} placeholder="e.g. Tomorrow's Lab Session Change" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Content</label>
                                            <textarea required rows={4} value={noticeForm.content} onChange={e => setNoticeForm({...noticeForm, content: e.target.value})} placeholder="Write notice details here..." />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Target</label>
                                                <select value={noticeForm.targetType} onChange={e => setNoticeForm({...noticeForm, targetType: e.target.value})}>
                                                    <option value="CLASS">Specific Class</option>
                                                    <option value="STUDENT">Specific Student</option>
                                                    <option value="ALL">Public/Everyone</option>
                                                </select>
                                            </div>
                                            {noticeForm.targetType !== 'ALL' && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{noticeForm.targetType === 'CLASS' ? 'Class Name' : 'Student ID'}</label>
                                                    <input required placeholder={noticeForm.targetType === 'CLASS' ? 'e.g. Class-10' : 'e.g. RPHS20250101'} value={noticeForm.targetId} onChange={e => setNoticeForm({...noticeForm, targetId: e.target.value})} />
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--surface-hover)', padding: '10px', borderRadius: '8px' }}>
                                            💡 Note: Your notice will be sent to administrators for approval before it becomes visible to students.
                                        </p>
                                        <button type="submit" className="btn" style={{ background: 'var(--primary)', color: 'var(--background)', padding: '12px', borderRadius: '12px', fontWeight: 800 }}>Send for Approval</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div style={{ padding: isMobile ? '20px' : '40px', maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Student Directory</h2>
                                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>View and manage students in your assigned classes.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['All', 'Class-10', 'Class-11', 'Class-12'].map(cls => (
                                    <button 
                                        key={cls}
                                        onClick={() => fetchStudents(cls)}
                                        style={{ 
                                            padding: '8px 16px', 
                                            borderRadius: '10px', 
                                            border: '1px solid var(--border-color)', 
                                            background: 'var(--surface)', 
                                            color: 'var(--text-main)', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600, 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="filter-btn"
                                    >
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {students.length > 0 ? students.map(s => (
                                <div key={s.id || s.studentId} style={{ 
                                    background: 'var(--surface)', 
                                    padding: '1.5rem', 
                                    borderRadius: '24px', 
                                    border: '1px solid var(--border-color)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '1.25rem', 
                                    position: 'relative',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    boxShadow: 'var(--shadow-md)'
                                }} className="hover-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={s.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                                alt={s.name} 
                                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--surface-hover)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                            />
                                            <div style={{ 
                                                position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', 
                                                background: '#22c55e', border: '2px solid var(--surface)', borderRadius: '50%' 
                                            }}></div>
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</h4>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.studentId}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1, background: 'var(--surface-hover)', padding: '10px', borderRadius: '15px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{s.class?.replace('Class-', '') || 'N/A'}</div>
                                        </div>
                                        <div style={{ flex: 1, background: 'var(--surface-hover)', padding: '10px', borderRadius: '15px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)' }}>{s.rollNumber || 'N/A'}</div>
                                        </div>
                                    </div>
                                    
                                    <button style={{ 
                                        width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', 
                                        background: 'var(--background)', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => {
                                        setActiveTab('results');
                                        // Auto-focus on this student in results could be implemented here
                                    }}>
                                        <Award size={16} /> Enter Marks
                                    </button>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <Search size={48} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                                    <h3>No Students Found</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>We couldn't find any students matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Marks Entry Tab */}
                {activeTab === 'results' && (
                    <div style={{ padding: isMobile ? '20px' : '40px', maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Marks Entry System</h2>
                                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Record periodic evaluation and final marks for your students.</p>
                            </div>
                            <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                {['entry', 'history'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveResultsSubTab(tab);
                                            if (tab === 'history') fetchMarksHistory();
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: activeResultsSubTab === tab ? 'var(--secondary)' : 'transparent',
                                            color: activeResultsSubTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {tab === 'entry' ? 'Marks Entry' : 'Submission History'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeResultsSubTab === 'entry' ? (
                            <>
                            {/* Selection Panel */}
                        <div style={{ 
                            background: 'var(--surface)', 
                            padding: '1.5rem', 
                            borderRadius: '20px', 
                            border: '1px solid var(--border-color)', 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto', 
                            gap: '15px',
                            alignItems: 'flex-end',
                            marginBottom: '30px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>SELECT CLASS</label>
                                <select 
                                    value={selectedMarksClass} 
                                    onChange={(e) => {
                                        setSelectedMarksClass(e.target.value);
                                        setIsMarksVisible(false);
                                    }}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}
                                >
                                    <option value="All">Select Class</option>
                                    {['Class-10', 'Class-11', 'Class-12'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>SELECT SUBJECT</label>
                                <select 
                                    value={selectedSubject} 
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}
                                >
                                    <option value="">Choose Subject</option>
                                    {profile?.subjects?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>SEMESTER / EXAM</label>
                                <select 
                                    value={selectedSemester} 
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}
                                >
                                    {['Unit Test-1', 'Unit Test-2', 'Selection Test', 'Final Exam 2025'].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                                </select>
                            </div>
                            <button 
                                className="btn btn-primary" 
                                style={{ padding: '12px 25px', borderRadius: '12px' }}
                                onClick={() => {
                                    if (selectedMarksClass === 'All' || !selectedSubject) {
                                        alert("Please select both Class and Subject");
                                        return;
                                    }
                                    fetchStudents(selectedMarksClass);
                                    setIsMarksVisible(true);
                                }}
                            >
                                <Search size={20} style={{ marginRight: '8px' }} /> Load Students
                            </button>
                        </div>

                        {/* Marks Input Table */}
                        {isMarksVisible && (
                            <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ padding: '20px', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Entering {selectedSubject} marks for {selectedMarksClass}</h3>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{students.length} Students Loaded</div>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                                <th style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ROLL</th>
                                                <th style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>STUDENT</th>
                                                <th style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>THEORY ({['Class-11', 'Class-12'].includes(selectedMarksClass) ? '80' : '90'})</th>
                                                <th style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>PROJECT ({['Class-11', 'Class-12'].includes(selectedMarksClass) ? '20' : '10'})</th>
                                                <th style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>GRADE</th>
                                                <th style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map(s => (
                                                <tr key={s.studentId} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                                                    <td style={{ padding: '15px 20px', fontWeight: 800 }}>{s.rollNumber}</td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <img src={s.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                                            <div>
                                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.name}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <input 
                                                            type="number" 
                                                            placeholder="0"
                                                            value={marksData[s.studentId]?.marks || ''}
                                                            onChange={(e) => setMarksData({ ...marksData, [s.studentId]: { ...marksData[s.studentId], marks: e.target.value } })}
                                                            style={{ width: '70px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }} 
                                                        />
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <input 
                                                            type="number" 
                                                            placeholder="0"
                                                            value={marksData[s.studentId]?.project || ''}
                                                            onChange={(e) => setMarksData({ ...marksData, [s.studentId]: { ...marksData[s.studentId], project: e.target.value } })}
                                                            style={{ width: '70px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }} 
                                                        />
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <select 
                                                            value={marksData[s.studentId]?.grade || 'C'}
                                                            onChange={(e) => setMarksData({ ...marksData, [s.studentId]: { ...marksData[s.studentId], grade: e.target.value } })}
                                                            style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)', fontWeight: 700 }}
                                                        >
                                                            {['AA', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <button 
                                                            onClick={() => handleMarksSave(s.studentId, s.id)}
                                                            style={{ 
                                                                padding: '10px 15px', 
                                                                borderRadius: '10px', 
                                                                border: 'none', 
                                                                background: marksData[s.studentId]?.saved ? '#22c55e' : 'var(--secondary)', 
                                                                color: 'white', 
                                                                fontWeight: 700, 
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            {marksData[s.studentId]?.saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save</>}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        </>
                        ) : (
                            <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Recent Marks Submissions</h3>
                                {marksHistory.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No submission history found.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 800 }}>DATE</th>
                                                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 800 }}>STUDENT</th>
                                                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 800 }}>SUBJECT</th>
                                                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 800 }}>SEM/CLASS</th>
                                                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 800 }}>MARKS</th>
                                                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 800 }}>STATUS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {marksHistory.map((h, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            <strong>{h.user?.name}</strong>
                                                            <div style={{ fontSize: '0.7rem' }}>{h.user?.studentId}</div>
                                                        </td>
                                                        <td style={{ padding: '12px' }}>{h.subject}</td>
                                                        <td style={{ padding: '12px' }}>{h.semester} <br/> <small>{h.className}</small></td>
                                                        <td style={{ padding: '12px' }}>{h.marks} + {h.projectMarks}</td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span style={{ 
                                                                padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                                                                background: h.isPublished ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                                color: h.isPublished ? '#22c55e' : '#f59e0b'
                                                            }}>
                                                                {h.isPublished ? 'PUBLISHED' : 'PENDING'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--surface)', width: '90%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Edit Profile</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setShowEditModal(false)} />
                        </div>
                        <div style={{ padding: '20px', display: 'grid', gap: '20px' }}>
                            {/* Profile Pic Upload */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px', background: 'var(--surface-hover)', borderRadius: '12px' }}>
                                <img src={editForm.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: '5px' }}>Profile Picture</h4>
                                    <label className="btn is-small" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                        Change Photo
                                        <input type="file" hidden onChange={async (e) => {
                                            const url = await handleFileUpload(e.target.files[0]);
                                            if(url) setEditForm({...editForm, profilePic: url});
                                        }} />
                                    </label>
                                </div>
                            </div>
                            
                            {/* Cover Image Upload (Banner) */}
                            <div style={{ padding: '10px', background: 'var(--surface-hover)', borderRadius: '12px' }}>
                                <h4 style={{ margin: 0, marginBottom: '10px' }}>Banner / Cover Image</h4>
                                {editForm.coverImage && <img src={editForm.coverImage} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />}
                                <label className="btn is-small" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                    <UploadCloud size={14} style={{ marginRight: '6px' }} /> Upload New Banner
                                    <input type="file" hidden onChange={async (e) => {
                                        const url = await handleFileUpload(e.target.files[0]);
                                        if(url) setEditForm({...editForm, coverImage: url});
                                    }} />
                                </label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ opacity: 0.7 }}>
                                    <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Name (Admin Managed)</label>
                                    <input placeholder="Full Name" className="input-field" value={editForm.name} disabled style={{ cursor: 'not-allowed', background: 'var(--background)' }} />
                                </div>
                                <div style={{ opacity: 0.7 }}>
                                    <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Subjects (Admin Managed)</label>
                                    <input placeholder="Subjects" className="input-field" value={editForm.subjects ? editForm.subjects.join(',') : ''} disabled style={{ cursor: 'not-allowed', background: 'var(--background)' }} />
                                </div>
                            </div>
                            
                            <div style={{ opacity: 0.7 }}>
                                <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Assigned Class (Admin Managed)</label>
                                <input placeholder="Class" className="input-field" value={editForm.class || 'Not Assigned'} disabled style={{ cursor: 'not-allowed', background: 'var(--background)' }} />
                            </div>
                            
                            <textarea placeholder="Bio" className="input-field" rows={4} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
                            
                            <h4 style={{ margin: '10px 0 5px' }}>Social Links</h4>
                            <input placeholder="LinkedIn" className="input-field" value={editForm.socialLinks?.linkedIn || ''} onChange={e => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, linkedIn: e.target.value}})} />
                            <input placeholder="Instagram" className="input-field" value={editForm.socialLinks?.instagram || ''} onChange={e => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, instagram: e.target.value}})} />

                            <button onClick={saveProfile} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Post Modal */}
            {showPostModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ background: 'var(--surface)', width: '90%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <h3 style={{ margin: 0 }}>Create New Post</h3>
                            <button onClick={() => setShowPostModal(false)} style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </div>
                        <div style={{ padding: '20px', display: 'grid', gap: '15px' }}>
                            {/* Type Selector */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                {['MEDIA', 'VLOG', 'BLOG'].map(type => (
                                    <button 
                                        key={type} 
                                        onClick={() => setPostForm({...postForm, type})}
                                        style={{ 
                                            flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', 
                                            background: postForm.type === type ? 'var(--primary)' : 'transparent',
                                            color: postForm.type === type ? 'var(--background)' : 'var(--text-muted)', cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {postForm.type === 'MEDIA' && (
                                <>
                                    <div style={{ height: '200px', background: 'var(--surface-hover)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', position: 'relative' }}>
                                        {postForm.mediaUrl ? <img src={postForm.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color="var(--text-muted)" />}
                                        <input type="file" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={async(e) => {
                                            const url = await handleFileUpload(e.target.files[0]);
                                            if(url) setPostForm({...postForm, mediaUrl: url});
                                        }} />
                                    </div>
                                    <input placeholder="Write a caption..." className="input-field" value={postForm.caption} onChange={e => setPostForm({...postForm, caption: e.target.value})} />
                                </>
                            )}

                            {postForm.type === 'VLOG' && (
                                <>
                                    <input placeholder="Vlog Title" className="input-field" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
                                    <input placeholder="YouTube ID / URL" className="input-field" value={postForm.videoUrl} onChange={e => setPostForm({...postForm, videoUrl: e.target.value})} />
                                    <textarea placeholder="Description..." className="input-field" rows={3} value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
                                </>
                            )}
                            
                            {postForm.type === 'BLOG' && (
                                <>
                                    <div style={{ height: '100px', background: 'var(--surface-hover)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', position: 'relative' }}>
                                        {postForm.mediaUrl ? <img src={postForm.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>Add Cover Image</span>}
                                        <input type="file" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={async(e) => {
                                            const url = await handleFileUpload(e.target.files[0]);
                                            if(url) setPostForm({...postForm, mediaUrl: url});
                                        }} />
                                    </div>
                                    <input placeholder="Blog Title" className="input-field" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
                                    <textarea placeholder="Write your article..." className="input-field" rows={8} value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
                                </>
                            )}

                            <button onClick={handlePostSubmit} className="btn btn-primary" style={{ marginTop: '10px' }}>Share</button>
                        </div>
                   </div>
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div 
                    onClick={() => setSelectedPost(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: isMobile ? '10px' : '40px',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--surface)',
                            width: '100%',
                            maxWidth: '1100px',
                            height: isMobile ? 'auto' : '85vh',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Left Side: Photo */}
                        <div style={{ flex: 1.5, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', height: isMobile ? '300px' : '100%' }}>
                            <img src={selectedPost.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        
                        {/* Right Side: Info */}
                        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid var(--border-color)', background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-hover)', overflow: 'hidden', padding: '2px', border: '2px solid var(--secondary)' }}>
                                    <img src={profile?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{profile?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faculty Member (You)</div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-main)' }}>{selectedPost.caption || 'No caption provided.'}</p>
                            </div>

                            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => handleDeletePost(selectedPost)}
                                    style={{ 
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #ef4444',
                                        background: 'transparent',
                                        color: '#ef4444',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete
                                </button>
                                <button 
                                    onClick={() => setSelectedPost(null)}
                                    style={{ 
                                        flex: 2, 
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: '#000',
                                        color: '#fff',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .nav-item:hover { background: var(--surface-hover) !important; color: var(--primary) !important; }
                .input-field { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--background); color: var(--text-main); }
                .group:hover .overlay { opacity: 1 !important; }
                .group:hover img { transform: scale(1.05); }
                .new-post-btn:hover { border-color: var(--secondary) !important; background: var(--surface-hover) !important; }
                .hover-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl) !important; }
                .filter-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; transform: scale(1.05); }
                .table-row-hover:hover { background: rgba(255,255,255,0.03); }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
