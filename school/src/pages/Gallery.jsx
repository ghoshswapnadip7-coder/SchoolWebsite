import { API_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { ImageIcon, Maximize2, Filter, AlertCircle, Camera } from 'lucide-react';

const Gallery = ({ schoolConfig }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetch(`${API_URL}/gallery`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch gallery");
                return res.json();
            })
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const categories = ['All', ...new Set(items.map(item => item.category || 'Other'))];
    const filteredItems = category === 'All' ? items : items.filter(item => (item.category || 'Other') === category);

    return (
        <div className="main">
            <section style={{
                background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '8rem 0 6rem',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>Visual Journey</h1>
                    <p style={{ fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
                        Capturing the spirit of {schoolConfig.name} through moments of learning, sports, and celebrations.
                    </p>
                </div>
            </section>

            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    {/* Category Filter */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '1rem', 
                        marginBottom: '4rem',
                        flexWrap: 'wrap'
                    }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '2rem',
                                    border: 'none',
                                    backgroundColor: category === cat ? 'var(--primary)' : 'var(--surface-hover)',
                                    color: category === cat ? 'var(--background)' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: category === cat ? 'var(--shadow-md)' : 'none'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading visual memories...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#fef2f2', borderRadius: '2rem' }}>
                            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                            <h3 style={{ color: '#991b1b' }}>Failed to Load Gallery</h3>
                            <p style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '8rem', backgroundColor: 'var(--surface)', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
                            <Camera size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.5 }} />
                            <h3 style={{ color: 'var(--text-main)' }}>No Images Found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We haven't uploaded images for this category yet.</p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                            gap: '2.5rem' 
                        }}>
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className="card" 
                                    onClick={() => setSelectedItem(item)}
                                    style={{ 
                                        padding: 0, 
                                        overflow: 'hidden',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                >
                                    <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title} 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease'
                                            }} 
                                        />
                                        <div className="gallery-overlay" style={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            right: 0, 
                                            bottom: 0,
                                            background: 'rgba(15, 23, 42, 0.7)',
                                            padding: '1.5rem',
                                            color: 'white',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease'
                                        }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{item.category || 'General'}</div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>{item.title}</h3>
                                            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.4', color: 'white' }}>{item.description}</p>
                                        </div>
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '1rem', 
                                                right: '1rem',
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(10px)',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: 'white',
                                                zIndex: 10
                                            }}
                                        >
                                            <Maximize2 size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <style>{`
                        .card:hover .gallery-overlay {
                            opacity: 1 !important;
                        }
                        .card:hover img {
                            transform: scale(1.1);
                        }
                    `}</style>

                    {/* Image Detail Modal */}
                    {selectedItem && (
                        <div 
                            onClick={() => setSelectedItem(null)}
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
                                    height: isMobile ? 'auto' : '80vh',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                {/* Left Side: Large Image */}
                                <div style={{ 
                                    flex: 1.5, 
                                    background: '#000', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    height: isMobile ? '300px' : '100%'
                                }}>
                                    <img 
                                        src={selectedItem.imageUrl} 
                                        alt={selectedItem.title}
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'contain' 
                                        }} 
                                    />
                                </div>

                                {/* Right Side: Details */}
                                <div style={{ 
                                    flex: 1, 
                                    padding: '2.5rem', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    background: 'var(--surface)',
                                    borderLeft: isMobile ? 'none' : '1px solid var(--border-color)'
                                }}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <span style={{ 
                                            background: 'var(--primary)', 
                                            color: 'white', 
                                            padding: '0.4rem 1rem', 
                                            borderRadius: '2rem', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 700 
                                        }}>
                                            {selectedItem.category || 'General'}
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 800 }}>
                                        {selectedItem.title}
                                    </h2>
                                    <p style={{ 
                                        fontSize: '1.1rem', 
                                        lineHeight: '1.8', 
                                        color: 'var(--text-muted)',
                                        flex: 1,
                                        overflowY: 'auto'
                                    }}>
                                        {selectedItem.description}
                                    </p>
                                    
                                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                                        <button 
                                            onClick={() => setSelectedItem(null)}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'opacity 0.2s'
                                            }}
                                        >
                                            Close Gallery
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Gallery;
