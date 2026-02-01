import { API_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { Award, Filter, AlertCircle, X, ChevronRight, Play, Info } from 'lucide-react';

const Toppers = () => {
    const [toppers, setToppers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterClass, setFilterClass] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [selectedTopper, setSelectedTopper] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/toppers`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch toppers");
                return res.json();
            })
            .then(data => {
                setToppers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const classes = ['All', ...new Set(toppers.map(t => t.class))].sort();
    const years = ['All', ...new Set(toppers.map(t => t.year))].sort((a,b) => b-a);

    const filteredToppers = toppers.filter(t => 
        (filterClass === 'All' || t.class === filterClass) &&
        (filterYear === 'All' || t.year.toString() === filterYear.toString())
    );

    return (
        <div className="main">
            <section style={{
                background: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1523050853063-bd80e295ce7f?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '10rem 0 8rem',
                textAlign: 'center'
            }}>
                <div className="container">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(234, 179, 8, 0.2)', padding: '0.5rem 1.5rem', borderRadius: '2rem', color: 'var(--secondary)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '2rem', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                        <Award size={18} /> HALL OF FAME
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'white' }}>Toppers Gallery</h1>
                    <p style={{ fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
                        Celebrating the academic excellence and outstanding achievements of our brightest stars who continue to inspire generations.
                    </p>
                </div>
            </section>

            <section style={{ padding: '5rem 0', background: 'var(--background)' }}>
                <div className="container">
                    {/* Filters */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '1rem', 
                        marginBottom: '4rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        background: 'var(--surface-hover)',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '100px',
                        border: '1px solid var(--border-color)',
                        width: 'fit-content',
                        margin: '0 auto 4rem auto',
                        boxShadow: 'var(--shadow-sm)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', paddingRight: '1rem', borderRight: '1px solid var(--border-color)' }}>
                            <Filter size={14} /> Filter By
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <select 
                                value={filterClass} 
                                onChange={(e) => setFilterClass(e.target.value)}
                                style={{ 
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '50px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--surface)', 
                                    color: 'var(--text-main)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '140px'
                                }}
                            >
                                {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'Every Class' : c}</option>)}
                            </select>
                            <select 
                                value={filterYear} 
                                onChange={(e) => setFilterYear(e.target.value)}
                                style={{ 
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '50px', 
                                    border: '1px solid var(--border-color)', 
                                    background: 'var(--surface)', 
                                    color: 'var(--text-main)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '120px'
                                }}
                            >
                                {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching our champions...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '2rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                            <h3 style={{ color: '#991b1b', fontSize: '1.8rem' }}>Connection Interrupted</h3>
                            <p style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    ) : filteredToppers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '8rem', backgroundColor: 'var(--surface-hover)', borderRadius: '2rem', border: '1px dashed var(--border-color)' }}>
                            <Award size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.3 }} />
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>No Toppers Found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We don't have records for this specific selection yet.</p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                            gap: '3rem' 
                        }}>
                            {filteredToppers.map(topper => (
                                <div 
                                    key={topper.id} 
                                    className="topper-card"
                                    onClick={() => setSelectedTopper(topper)}
                                    style={{ 
                                        backgroundColor: 'var(--surface)',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        boxShadow: 'var(--shadow-md)',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
                                        <img 
                                            src={topper.imageUrl} 
                                            alt={topper.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                                        />
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '1.5rem', 
                                            left: '1.5rem',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            backdropFilter: 'blur(8px)',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: 800,
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            Rank {topper.rank}
                                        </div>
                                        <div style={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            left: 0, 
                                            right: 0, 
                                            background: 'linear-gradient(transparent, rgba(15, 23, 42, 1))',
                                            padding: '2rem',
                                            color: 'white'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>
                                                {topper.class} • {topper.year}
                                            </div>
                                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>{topper.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>
                                                View Achievement <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Topper Detail Modal */}
            {selectedTopper && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem',
                    backdropFilter: 'blur(10px)'
                }} onClick={() => setSelectedTopper(null)}>
                    <div style={{
                        maxWidth: '1000px',
                        width: '100%',
                        maxHeight: '90vh',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setSelectedTopper(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={24} />
                        </button>
                        
                        <div style={{ height: window.innerWidth > 768 ? 'auto' : '300px', position: 'relative' }}>
                            <img src={selectedTopper.imageUrl} alt={selectedTopper.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {selectedTopper.videoUrl && (
                                <a href={selectedTopper.videoUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'var(--secondary)', color: 'white', padding: '1rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 10px 15px -3px rgba(234, 179, 8, 0.4)' }}>
                                    <Play size={20} fill="currentColor" /> Watch Video
                                </a>
                            )}
                        </div>

                        <div style={{ padding: '3.5rem', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem' }}>
                                <Award size={18} /> RANK {selectedTopper.rank} • {selectedTopper.year}
                            </div>
                            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{selectedTopper.name}</h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2.5rem' }}>{selectedTopper.class || 'Class Topper'}</p>
                            
                            {selectedTopper.message && (
                                <div style={{ background: 'var(--surface-hover)', padding: '2.5rem', borderRadius: '24px', borderLeft: '4px solid var(--secondary)', marginBottom: '2.5rem', position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '4rem', opacity: 0.1, fontFamily: 'serif', lineHeight: 1 }}>"</span>
                                    <p style={{ margin: 0, fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                                        {selectedTopper.message}
                                    </p>
                                </div>
                            )}

                            {selectedTopper.details && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                        <Info size={18} className="text-secondary" /> Achievements & Details
                                    </h4>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                        {selectedTopper.details}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .topper-card:hover {
                    transform: translateY(-12px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .topper-card:hover img {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default Toppers;
