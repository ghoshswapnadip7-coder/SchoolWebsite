import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { User, Video, Twitter, Linkedin, Instagram, Grid, FileText, ArrowLeft, Camera } from 'lucide-react';

const TeacherProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('grid');
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
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

    const getDesignationStyle = (des) => {
        const styles = {
            'HM': { bg: '#fee2e2', text: '#ef4444', label: 'Headmaster' },
            'Assistant HM': { bg: '#fff1f2', text: '#f43f5e', label: 'Assistant HM' },
            'Clerk': { bg: '#e0f2fe', text: '#0ea5e9', label: 'Office Clerk' },
            'Para teacher': { bg: '#fef3c7', text: '#d97706', label: 'Para Teacher' },
            'Arts': { bg: '#f0fdf4', text: '#22c55e', label: 'Faculty of Arts' },
            'Science': { bg: '#faf5ff', text: '#a855f7', label: 'Faculty of Science' }
        };
        return styles[des] || { bg: 'var(--surface-hover)', text: 'var(--text-muted)', label: des || 'Faculty Member' };
    };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (!teacher) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Teacher not found</div>;

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '40px', overflowX: 'hidden' }}>
            <div style={{ maxWidth: '935px', margin: '0 auto', paddingTop: '10px' }}>
                <div style={{ padding: '0 20px' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ 
                            background: 'none', border: 'none', color: 'var(--text-main)', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            marginBottom: '15px', fontSize: '1rem', fontWeight: 600
                        }}
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                </div>

                {/* Profile Header Container */}
                <div style={{ padding: '0 20px 20px 20px' }}>
                    <div className="profile-header-grid">
                        
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
                                        src={teacher.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', height: '100%' }}>
                            
                            {/* Desktop: Name & Actions Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <h2 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', margin: 0, fontWeight: 400, color: 'var(--text-main)' }}>{teacher.name}</h2>
                                <span style={{ 
                                    background: getDesignationStyle(teacher.designation).bg,
                                    color: getDesignationStyle(teacher.designation).text,
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    {getDesignationStyle(teacher.designation).label}
                                </span>
                            </div>

                            {/* Stats Row */}
                            <div className="profile-stats">
                                <span><strong>{teacher.gallery?.length + (teacher.vlogs?.length || 0) + (teacher.blogs?.length || 0) || 0}</strong> posts</span>
                                <span><strong>{teacher.students?.length || 0}</strong> students</span>
                                <span><strong>{teacher.subjects?.length || 0}</strong> subjects</span>
                            </div>

                            {/* Desktop Bio */}
                            <div className="desktop-bio" style={{ display: 'none' }}>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{teacher.subjects?.join(' • ')}</div>
                                <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginTop: '5px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{teacher.bio}</div>
                                {teacher.socialLinks && (
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        {teacher.socialLinks.linkedIn && <a href={teacher.socialLinks.linkedIn} target="_blank" style={{ color: 'var(--text-main)' }}><Linkedin size={20} /></a>}
                                        {teacher.socialLinks.twitter && <a href={teacher.socialLinks.twitter} target="_blank" style={{ color: 'var(--text-main)' }}><Twitter size={20} /></a>}
                                        {teacher.socialLinks.instagram && <a href={teacher.socialLinks.instagram} target="_blank" style={{ color: 'var(--text-main)' }}><Instagram size={20} /></a>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Bio (Below columns) */}
                    <div className="mobile-bio" style={{ display: 'block', marginBottom: '20px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{teacher.subjects?.join(' • ')}</div>
                        <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{teacher.bio}</div>
                        {teacher.socialLinks && (
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                {teacher.socialLinks.linkedIn && <a href={teacher.socialLinks.linkedIn} target="_blank" style={{ color: 'var(--text-main)' }}><Linkedin size={20} /></a>}
                                {teacher.socialLinks.twitter && <a href={teacher.socialLinks.twitter} target="_blank" style={{ color: 'var(--text-main)' }}><Twitter size={20} /></a>}
                                {teacher.socialLinks.instagram && <a href={teacher.socialLinks.instagram} target="_blank" style={{ color: 'var(--text-main)' }}><Instagram size={20} /></a>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation (Sticky) */}
                <div style={{ 
                    display: 'flex', justifyContent: 'center', 
                    borderTop: '1px solid var(--border-color)', 
                    position: 'sticky', top: 0, background: 'var(--background)', zIndex: 10 
                }}>
                    {[
                        { id: 'grid', label: 'POSTS', icon: Grid },
                        { id: 'vlogs', label: 'VLOGS', icon: Video },
                        { id: 'blogs', label: 'BLOGS', icon: FileText },
                    ].map(tab => (
                        <div 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
                                padding: '12px 0', 
                                borderTop: activeTab === tab.id ? '1px solid var(--text-main)' : '1px solid transparent',
                                marginTop: '-1px',
                                cursor: 'pointer',
                                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px'
                            }}
                        >
                            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
                            <span style={{ display: 'none' }} className="tab-label">{tab.label}</span>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'blogs' ? '1fr' : 'repeat(3, 1fr)', gap: '4px' }}>
                    {activeTab === 'grid' && teacher.gallery?.map((img, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedPost(img)}
                            style={{ aspectRatio: '1/1', background: 'var(--surface-hover)', position: 'relative', cursor: 'pointer', overflow: 'hidden' }} 
                            className="instagram-post"
                        >
                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                    
                    {activeTab === 'vlogs' && teacher.vlogs?.map((vlog, i) => (
                        <div key={i} style={{ aspectRatio: '9/16', background: '#000', position: 'relative', overflow: 'hidden' }}>
                            {vlog.videoUrl ? (
                                <iframe src={vlog.videoUrl.replace('watch?v=', 'embed/')} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
                            ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}><Video /></div>}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Video size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }}/> {vlog.title}
                            </div>
                        </div>
                    ))}

                    {activeTab === 'blogs' && teacher.blogs?.map((blog, i) => (
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
                {activeTab === 'grid' && (!teacher.gallery || teacher.gallery.length === 0) && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Camera size={30} /></div>
                        <h3>No Posts Yet</h3>
                    </div>
                )}
                {activeTab === 'vlogs' && (!teacher.vlogs || teacher.vlogs.length === 0) && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No vlogs yet</div>} 
                {activeTab === 'blogs' && (!teacher.blogs || teacher.blogs.length === 0) && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No articles yet</div>}
            </div>

            {/* Post Modal (Redesigned for better mobile overlay) */}
            {selectedPost && (
                <div 
                    onClick={() => setSelectedPost(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)', zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', background: 'var(--background)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                            <img src={teacher?.profilePic} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <span style={{ fontWeight: 600 }}>{teacher?.name}</span>
                        </div>
                        <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                            <img src={selectedPost.url} style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ padding: '15px' }}>
                            <p>{selectedPost.caption}</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .profile-header-grid {
                    display: grid;
                    grid-template-columns: minmax(80px, 150px) 1fr;
                    gap: 15px;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .profile-stats {
                    display: flex;
                    gap: 15px;
                    font-size: 0.9rem;
                    color: var(--text-main);
                    flex-wrap: wrap;
                }

                @media (min-width: 768px) {
                    .mobile-bio { display: none !important; }
                    .desktop-bio { display: block !important; }
                    .tab-label { display: inline !important; }
                    
                    .profile-header-grid {
                        gap: 30px;
                        align-items: flex-start;
                    }
                    .profile-stats {
                        gap: 30px;
                        font-size: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default TeacherProfile;
