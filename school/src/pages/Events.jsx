import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Search, Filter, AlertCircle } from 'lucide-react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/events')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch events");
                return res.json();
            })
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container" style={{ padding: '6rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Upcoming Events</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Stay updated with the latest happenings, academic calendars, and school activities.</p>
            </div>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '3rem',
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                        <Filter size={18} /> Filter by Category
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ padding: '0.4rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem', cursor: 'pointer' }}>All Events</span>
                        <span style={{ padding: '0.4rem 1.2rem', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '2rem', fontSize: '0.85rem', cursor: 'pointer' }}>Exams</span>
                        <span style={{ padding: '0.4rem 1.2rem', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '2rem', fontSize: '0.85rem', cursor: 'pointer' }}>Sports</span>
                        <span style={{ padding: '0.4rem 1.2rem', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '2rem', fontSize: '0.85rem', cursor: 'pointer' }}>Cultural</span>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        style={{ padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '2rem', border: '1px solid #e2e8f0', outline: 'none', width: '300px' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading amazing events...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#fef2f2', borderRadius: '2rem', border: '1px solid #fee2e2' }}>
                    <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Oops! Something went wrong</h3>
                    <p style={{ color: '#ef4444' }}>{error}</p>
                </div>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '8rem', backgroundColor: '#f8fafc', borderRadius: '2rem' }}>
                     <Calendar size={64} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No Events Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>There are no upcoming events at the moment. Please check back later!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                    {events.map(event => {
                        const date = new Date(event.date);
                        return (
                            <div key={event.id} className="card" style={{ 
                                padding: 0, 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease',
                                cursor: 'pointer'
                            }}>
                                <div style={{ 
                                    padding: '2rem', 
                                    background: event.imageUrl ? `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("${event.imageUrl}")` : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    color: 'white',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{date.getDate()}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, marginTop: '0.25rem' }}>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {event.title.toLowerCase().includes('exam') ? 'ACADEMIC' : 'SCHOOL EVENT'}
                                    </div>
                                </div>
                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>{event.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        <MapPin size={16} /> {event.location || 'School Campus'}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{event.description}</p>
                                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        DETAILS & RSVP <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ArrowRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>;

export default Events;
