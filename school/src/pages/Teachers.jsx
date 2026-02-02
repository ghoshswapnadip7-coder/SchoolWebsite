import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { User, Image, Video, Twitter, Linkedin, Instagram, Facebook, Grid, FileText, X } from 'lucide-react';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/public/teachers`)
            .then(res => res.json())
            .then(data => {
                setTeachers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const navigate = useNavigate();

    const getDesignationStyle = (des) => {
        if (!des) return { bg: 'var(--surface-hover)', text: 'var(--text-muted)', label: 'Faculty' };
        
        const lowerDes = des.toLowerCase();
        
        if (lowerDes.includes('headmaster') || lowerDes === 'hm') {
            return { bg: '#fee2e2', text: '#ef4444', label: 'Headmaster' };
        }
        if (lowerDes.includes('assistant') || lowerDes.includes('asst')) {
            return { bg: '#fff1f2', text: '#f43f5e', label: 'Assistant HM' };
        }
        if (lowerDes.includes('clerk')) {
            return { bg: '#e0f2fe', text: '#0ea5e9', label: 'Office Clerk' };
        }
        if (lowerDes.includes('para')) {
            return { bg: '#fef3c7', text: '#d97706', label: 'Para Teacher' };
        }
        if (lowerDes.includes('arts')) {
            return { bg: '#f0fdf4', text: '#22c55e', label: 'Faculty of Arts' };
        }
        if (lowerDes.includes('science')) {
            return { bg: '#faf5ff', text: '#a855f7', label: 'Faculty of Science' };
        }
        
        return { bg: 'var(--surface-hover)', text: 'var(--text-muted)', label: des };
    };

    const TeacherCard = ({ teacher }) => {
        const designation = teacher.designation || teacher.role || 'Faculty';
        const style = getDesignationStyle(designation);
        
        return (
        <div 
            onClick={() => navigate(`/teacher/${teacher._id || teacher.id}`)}
            style={{ 
                background: 'var(--surface)', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            className="hover-card"
        >
            <div style={{ 
                height: '140px', 
                background: teacher.coverImage ? `url(${teacher.coverImage})` : 'linear-gradient(45deg, var(--primary) 0%, var(--secondary) 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative' 
            }}>
                <img 
                    src={teacher.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                    alt={teacher.name} 
                    style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '50%', 
                        border: '4px solid var(--surface)', 
                        objectFit: 'cover',
                        position: 'absolute',
                        bottom: '-50px',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                />
            </div>
            <div style={{ padding: '60px 20px 20px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ 
                    background: style.bg,
                    color: style.text,
                    padding: '2px 10px',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    border: `1px solid ${style.text}33`
                }}>
                    {style.label}
                </span>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{teacher.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {teacher.subjects && teacher.subjects.join(' • ')}
                </p>
                {teacher.bio && <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.7rem' }}>{teacher.bio}</p>}
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button className="btn is-small" style={{ borderRadius: '20px' }}>View Full Profile</button>
                </div>
            </div>
        </div>
    );
    };

    const Modal = ({ teacher, onClose }) => {
        const [activeTab, setActiveTab] = useState('grid'); // grid, vlogs, blogs
        if (!teacher) return null;

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div style={{ width: '90%', maxWidth: '935px', height: '90%', background: 'var(--background)', borderRadius: '16px', overflowY: 'auto', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}><X size={24} /></button>
                    
                    <div style={{ padding: '0 20px 30px' }}>
                        {/* Cover Image (Banner) */}
                        <div style={{ 
                            height: '200px', 
                            width: '100%', 
                            backgroundImage: `url(${teacher.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1080&q=80'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '0 0 16px 16px', 
                            marginBottom: '20px'
                        }} />

                        {/* Profile Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 200px) 1fr', gap: '30px', marginBottom: '44px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-80px' }}>
                                <div style={{ 
                                    width: '150px', height: '150px', borderRadius: '50%', padding: '5px', background: 'var(--background)' 
                                }}>
                                    <div style={{
                                        width: '100%', height: '100%', borderRadius: '50%',
                                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                                        padding: '3px'
                                    }}>
                                        <img src={teacher.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--background)', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 400 }}>{teacher.name}</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {teacher.socialLinks?.linkedIn && <a href={teacher.socialLinks.linkedIn} target="_blank" style={{ color: '#0077b5' }}><Linkedin size={20} /></a>}
                                        {teacher.socialLinks?.twitter && <a href={teacher.socialLinks.twitter} target="_blank" style={{ color: '#1da1f2' }}><Twitter size={20} /></a>}
                                        {teacher.socialLinks?.instagram && <a href={teacher.socialLinks.instagram} target="_blank" style={{ color: '#e1306c' }}><Instagram size={20} /></a>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '40px', fontSize: '1rem' }}>
                                    <span><strong>{teacher.gallery?.length + (teacher.vlogs?.length || 0) + (teacher.blogs?.length || 0) || 0}</strong> posts</span>
                                    <span><strong>{teacher.subjects?.length || 0}</strong> subjects</span>
                                </div>

                                <div>
                                    <div style={{ fontWeight: 600 }}>{teacher.subjects?.join(' | ')}</div>
                                    <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{teacher.bio}</div>
                                </div>
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
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                        padding: '16px 0', 
                                        borderTop: activeTab === tab.id ? '1px solid var(--text-main)' : '1px solid transparent',
                                        marginTop: '-1px',
                                        cursor: 'pointer',
                                        color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px'
                                    }}
                                >
                                    <tab.icon size={12} /> {tab.label}
                                </div>
                            ))}
                        </div>

                        {/* Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'blogs' ? '1fr' : 'repeat(3, 1fr)', gap: activeTab === 'blogs' ? '20px' : '4px' }}>
                            {activeTab === 'grid' && teacher.gallery?.map((img, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedPost({ ...img, type: 'POST', author: teacher.name })}
                                    style={{ aspectRatio: '1/1', background: 'var(--surface-hover)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }} 
                                    className="instagram-post"
                                >
                                    <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                                    <div className="post-overlay" style={{ 
                                        position: 'absolute', 
                                        top: 0, left: 0, right: 0, bottom: 0, 
                                        background: 'rgba(0,0,0,0.4)', 
                                        color: 'white', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: '20px',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                            {img.caption || 'View Post'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {activeTab === 'vlogs' && teacher.vlogs?.map((vlog, i) => (
                                <div key={i} style={{ aspectRatio: '1/1.2', background: 'var(--surface-hover)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                    {vlog.videoUrl ? (
                                        <iframe src={vlog.videoUrl.replace('watch?v=', 'embed/')} style={{ width: '100%', height: '100%', border: 'none' }} />
                                    ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video /></div>}
                                    <div style={{ padding: '8px', background: 'var(--surface)', fontWeight: 600 }}>{vlog.title}</div>
                                </div>
                            ))}

                            {activeTab === 'blogs' && teacher.blogs?.map((blog, i) => (
                                <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    {blog.image && <div style={{ width: '200px', height: '140px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={blog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>}
                                    <div>
                                        <h3 style={{ marginTop: 0 }}>{blog.title}</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>{blog.content}</p>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(blog.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeTab === 'grid' && (!teacher.gallery || teacher.gallery.length === 0) && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No posts yet</div>}
                        {activeTab === 'vlogs' && (!teacher.vlogs || teacher.vlogs.length === 0) && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No vlogs yet</div>}
                        {activeTab === 'blogs' && (!teacher.blogs || teacher.blogs.length === 0) && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No blogs yet</div>}

                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container page-content" style={{ padding: '40px 20px', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Meet Our Faculty</h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Dedicated educators shaping the future of our students through excellence in teaching and mentorship.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center' }}>Loading teachers...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {teachers.map(t => <TeacherCard key={t._id || t.id} teacher={t} />)}
                </div>
            )}
            
            <Modal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
            
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
                        padding: '40px',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--surface)',
                            width: '100%',
                            maxWidth: '1000px',
                            height: '80vh',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            display: 'flex',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Left Side: Photo */}
                        <div style={{ flex: 1.4, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={selectedPost.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        
                        {/* Right Side: Info */}
                        <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-hover)', overflow: 'hidden' }}>
                                    <img src={selectedTeacher?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <span style={{ fontWeight: 700 }}>{selectedTeacher?.name}</span>
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <p style={{ lineHeight: 1.6, fontSize: '1rem' }}>{selectedPost.caption || 'No caption provided.'}</p>
                            </div>

                            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                                <button 
                                    onClick={() => setSelectedPost(null)}
                                    className="btn" 
                                    style={{ width: '100%', background: '#000', color: '#fff', border: 'none' }}
                                >
                                    Close Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .hover-card:hover {
                    transform: translateY(-5px) !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                }
                .instagram-post:hover .post-overlay {
                    opacity: 1 !important;
                }
                .instagram-post:hover img {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default Teachers;
