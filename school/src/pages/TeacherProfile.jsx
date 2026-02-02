import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { User, Video, Twitter, Linkedin, Instagram, Grid, FileText, ArrowLeft } from 'lucide-react';

const TeacherProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('grid');

    useEffect(() => {
        if (!id) return;
        fetch(`${API_URL}/public/teachers/${id}`)
            .then(res => res.json())
            .then(data => {
                setTeacher(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (!teacher) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Teacher not found</div>;

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '40px' }}>
            <div style={{ maxWidth: '935px', margin: '0 auto', padding: '0 20px', paddingTop: '20px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        background: 'none', border: 'none', color: 'var(--text-main)', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '20px', fontSize: '1rem', fontWeight: 600
                    }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                 {/* Cover Image (Banner) */}
                 <div style={{ 
                    height: '250px', 
                    width: '100%', 
                    backgroundImage: `url(${teacher.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1080&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '16px', 
                    marginBottom: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }} />

                {/* Profile Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 200px) 1fr', gap: '40px', marginBottom: '44px', position: 'relative', paddingLeft: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-100px' }}>
                        <div style={{ width: '170px', height: '170px', borderRadius: '50%', padding: '5px', background: 'var(--background)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', padding: '3px' }}>
                                <img src={teacher.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--background)', objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 300 }}>{teacher.name}</h2>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {teacher.socialLinks?.linkedIn && <a href={teacher.socialLinks.linkedIn} target="_blank" style={{ color: '#0077b5' }}><Linkedin size={24} /></a>}
                                {teacher.socialLinks?.twitter && <a href={teacher.socialLinks.twitter} target="_blank" style={{ color: '#1da1f2' }}><Twitter size={24} /></a>}
                                {teacher.socialLinks?.instagram && <a href={teacher.socialLinks.instagram} target="_blank" style={{ color: '#e1306c' }}><Instagram size={24} /></a>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '40px', fontSize: '1.1rem' }}>
                            <span><strong>{teacher.gallery?.length + (teacher.vlogs?.length || 0) + (teacher.blogs?.length || 0) || 0}</strong> posts</span>
                            <span><strong>{teacher.subjects?.length || 0}</strong> subjects</span>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '5px' }}>{teacher.subjects?.join(' | ')}</div>
                            <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-main)', maxWidth: '600px' }}>{teacher.bio}</div>
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
                                fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px'
                            }}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'blogs' ? '1fr' : 'repeat(3, 1fr)', gap: activeTab === 'blogs' ? '20px' : '20px' }}>
                    {activeTab === 'grid' && teacher.gallery?.map((img, i) => (
                        <div key={i} style={{ aspectRatio: '1/1', background: 'var(--surface-hover)', position: 'relative', borderRadius: '4px', overflow: 'hidden' }} className="group">
                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {img.caption && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.8rem' }}>{img.caption}</div>}
                        </div>
                    ))}
                    
                    {activeTab === 'vlogs' && teacher.vlogs?.map((vlog, i) => (
                        <div key={i} style={{ aspectRatio: '1/1.2', background: 'var(--surface-hover)', position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
                            {vlog.videoUrl ? (
                                <iframe src={vlog.videoUrl.replace('watch?v=', 'embed/')} style={{ width: '100%', height: '100%', border: 'none' }} />
                            ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video /></div>}
                            <div style={{ padding: '12px', background: 'var(--surface)', fontWeight: 600 }}>{vlog.title}</div>
                        </div>
                    ))}

                    {activeTab === 'blogs' && teacher.blogs?.map((blog, i) => (
                        <div key={i} style={{ display: 'flex', gap: '30px', padding: '30px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            {blog.image && <div style={{ width: '250px', height: '180px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={blog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>}
                            <div style={{ flex: 1 }}>
                                <h2 style={{ marginTop: 0, marginBottom: '10px' }}>{blog.title}</h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '15px' }}>{new Date(blog.date).toLocaleDateString()}</span>
                                <p style={{ color: 'var(--text-main)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{blog.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Empty States */}
                {activeTab === 'grid' && (!teacher.gallery || teacher.gallery.length === 0) && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No photos posted</div>}
                {activeTab === 'vlogs' && (!teacher.vlogs || teacher.vlogs.length === 0) && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No vlogs shared</div>}
                {activeTab === 'blogs' && (!teacher.blogs || teacher.blogs.length === 0) && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No articles published</div>}
            </div>
        </div>
    );
};

export default TeacherProfile;
