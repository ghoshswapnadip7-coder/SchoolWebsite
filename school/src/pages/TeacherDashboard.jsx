import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
    User, BookOpen, Bell, LogOut, Award, Camera, 
    Instagram, Twitter, Linkedin, Facebook, Video, Image,
    Plus, Edit3, Save, Trash2, Search, Filter, Shield, 
    Grid, Layout, FileText, Settings, UploadCloud, X
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
    
    // Forms
    const [editForm, setEditForm] = useState({});
    const [postForm, setPostForm] = useState({ type: 'MEDIA', caption: '', title: '', content: '', videoUrl: '', mediaUrl: '' });

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
        console.log("Fetching Teacher Data from:", API_URL);

        try {
            const h = { 'Authorization': `Bearer ${token}` };
            
            const resProfile = await fetch(`${API_URL}/teacher/profile`, { headers: h });
            if (resProfile.ok) {
                const data = await resProfile.json();
                setProfile(data || {});
                setEditForm(data || {});
            } else if (resProfile.status === 404 || resProfile.status === 401) {
                console.warn("Auth failed, redirecting...");
                logout();
                window.location.href = '/login'; // Force reload
                return;
            }
            fetchStudents('All');
        } catch (err) {
            console.error("Failed to load teacher data", err);
        } finally {
            // Only stop loading if we are still logged in (didn't redirect)
            if (localStorage.getItem('token')) setLoading(false);
        }
    };

    const fetchStudents = async (className) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teacher/students?className=${className}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) setStudents(await res.json());
        } catch (err) { console.error(err); }
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
            console.error("Upload failed", error);
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

    const navItems = [
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'students', label: 'My Students', icon: <Search size={20} /> },
        { id: 'results', label: 'Marks Entry', icon: <Award size={20} /> },
        { id: 'notices', label: 'Notices', icon: <Bell size={20} /> },
    ];

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            
            {/* Sidebar */}
            <aside style={{
                width: isMobile ? '70px' : '260px',
                background: 'var(--surface)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column',
                position: isMobile ? 'fixed' : 'sticky',
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

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: isMobile ? '70px' : '0', padding: 0, overflowY: 'auto' }}>
                
                {activeTab === 'profile' && (
                    <div style={{ maxWidth: '935px', margin: '0 auto', padding: '0 20px 30px' }}>
                        
                        {/* Cover Image (Banner) */}
                        <div style={{ 
                            height: isMobile ? '120px' : '200px', 
                            width: '100%', 
                            backgroundImage: `url(${profile?.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1080&q=80'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '0 0 16px 16px', 
                            marginBottom: '20px'
                        }} />

                        {/* Profile Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '290px 1fr', gap: isMobile ? '10px' : '30px', marginBottom: '44px', position: 'relative' }}>
                            {/* Avatar */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? '-60px' : '-80px' }}>
                                <div style={{ 
                                    width: isMobile ? '100px' : '160px', 
                                    height: isMobile ? '100px' : '160px', 
                                    borderRadius: '50%', 
                                    background: 'var(--background)',
                                    padding: '5px' 
                                }}>
                                    <div style={{
                                        width: '100%', height: '100%', borderRadius: '50%',
                                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                                        padding: '3px',
                                        cursor: 'pointer'
                                    }}>
                                        <img 
                                            src={profile?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--background)', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 400, margin: 0 }}>{profile?.name || 'Teacher'}</h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setShowEditModal(true)} className="btn-secondary" style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '0.9rem', background: 'var(--surface-hover)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Edit Profile</button>
                                        <button className="btn-secondary" style={{ padding: '7px', borderRadius: '8px', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer' }}><Settings size={18} /></button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '40px', fontSize: '1rem' }}>
                                    <span><strong>{(profile?.gallery?.length || 0) + (profile?.vlogs?.length || 0) + (profile?.blogs?.length || 0)}</strong> posts</span>
                                    <span><strong>{students.length}</strong> students</span>
                                    <span><strong>{profile?.subjects?.length || 0}</strong> subjects</span>
                                </div>

                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{profile?.subjects?.join(' | ')}</div>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                        {profile?.bio || "No bio yet."}
                                    </div>
                                    {profile?.socialLinks?.linkedIn && <a href={profile.socialLinks.linkedIn} target="_blank" style={{ color: '#00376b', display: 'block', marginTop: '4px', textDecoration: 'none', fontWeight: 600 }}>LinkedIn Profile ↗</a>}
                                </div>
                            </div>
                        </div>

                        {/* Stories / Highlights (Optional) */}
                        <div style={{ display: 'flex', gap: '30px', marginBottom: '44px', paddingBottom: '20px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)' }}>
                            {['Achievements', 'Events', 'Classrooms'].map((story, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: '70px' }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--surface-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Award size={24} color="var(--text-muted)" />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{story}</span>
                                </div>
                            ))}
                            <div onClick={() => setShowPostModal(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: '70px' }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--surface)', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={30} color="var(--text-muted)" />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Post</span>
                                </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', borderTop: '1px solid var(--border-color)', marginBottom: '4px' }}>
                            {[
                                { id: 'grid', label: 'POSTS', icon: Grid },
                                { id: 'vlogs', label: 'VLOGS', icon: Video },
                                { id: 'blogs', label: 'BLOGS', icon: FileText },
                            ].map(tab => (
                                <div 
                                    key={tab.id}
                                    onClick={() => setActiveProfileTab(tab.id)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                        padding: '16px 0', 
                                        borderTop: activeProfileTab === tab.id ? '1px solid var(--text-main)' : '1px solid transparent',
                                        marginTop: '-1px',
                                        cursor: 'pointer',
                                        color: activeProfileTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px'
                                    }}
                                >
                                    <tab.icon size={12} /> {tab.label}
                                </div>
                            ))}
                        </div>

                        {/* Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: activeProfileTab === 'blogs' ? '1fr' : 'repeat(3, 1fr)', gap: activeProfileTab === 'blogs' ? '20px' : '4px' }}>
                            {activeProfileTab === 'grid' && profile?.gallery?.map((img, i) => (
                                <div key={i} style={{ aspectRatio: '1/1', position: 'relative', background: 'var(--surface-hover)', cursor: 'pointer' }} className="group">
                                    <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s', color: 'white', fontWeight: 600 }}>
                                        {img.caption}
                                    </div>
                                </div>
                            ))}
                            {activeProfileTab === 'vlogs' && profile?.vlogs?.map((vlog, i) => (
                                <div key={i} style={{ aspectRatio: '1/1.2', background: 'var(--surface-hover)', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                    {vlog.videoUrl ? (
                                        <iframe 
                                            src={vlog.videoUrl.replace('watch?v=', 'embed/')} 
                                            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} 
                                        />
                                    ) : (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={40} /></div>
                                    )}
                                    <div style={{ padding: '8px', background: 'var(--surface)', fontSize: '0.9rem', fontWeight: 600 }}>{vlog.title}</div>
                                </div>
                            ))}
                             {activeProfileTab === 'blogs' && profile?.blogs?.map((blog, i) => (
                                <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    {blog.image && <div style={{ width: '200px', height: '140px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={blog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>}
                                    <div>
                                        <h3 style={{ marginTop: 0 }}>{blog.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{blog.content.substring(0, 150)}...</p>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(blog.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         
                         {/* Empty States */}
                         {activeProfileTab === 'grid' && (!profile?.gallery || profile?.gallery?.length === 0) && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><Camera size={48} /><p>No photos yet</p></div>}
                         {activeProfileTab === 'vlogs' && (!profile?.vlogs || profile?.vlogs?.length === 0) && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><Video size={48} /><p>No vlogs yet</p></div>}
                    </div>
                )}

                 {/* Keep other tabs simple for now */}
                 {activeTab === 'notices' && <div style={{ padding: '2rem' }}><h2>Notices</h2><p>Coming soon...</p></div>}
                 {activeTab === 'students' && <div style={{ padding: '2rem' }}><h2>Student Directory</h2><pre>{JSON.stringify(students.length, null, 2)} Students</pre></div>}
                 {activeTab === 'results' && <div style={{ padding: '2rem' }}><h2>Marks Entry</h2><p>Select Student...</p></div>}

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
                                <input placeholder="Full Name" className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                <input placeholder="Subjects" className="input-field" value={editForm.subjects ? editForm.subjects.join(',') : ''} onChange={e => setEditForm({...editForm, subjects: e.target.value.split(',')})} />
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
                                            color: postForm.type === type ? 'white' : 'var(--text-muted)', cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {postForm.type === 'MEDIA' && (
                                <>
                                    <div style={{ height: '200px', background: 'var(--surface-hover)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', position: 'relative' }}>
                                        {postForm.mediaUrl ? <img src={postForm.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Camera size={32} color="var(--text-muted)" />}
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

            <style>{`
                .nav-item:hover { background: var(--surface-hover) !important; color: var(--primary) !important; }
                .input-field { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--background); color: var(--text-main); }
                .group:hover .overlay { opacity: 1 !important; }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;
