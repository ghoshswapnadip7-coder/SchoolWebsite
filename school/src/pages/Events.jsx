import { API_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Search, Filter, AlertCircle, ArrowRight } from 'lucide-react';

const Events = ({ schoolConfig }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All Events');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'All Events') return matchesSearch;
        if (filter === 'Exams') return matchesSearch && event.title.toLowerCase().includes('exam');
        if (filter === 'Sports') return matchesSearch && (event.title.toLowerCase().includes('sport') || event.title.toLowerCase().includes('football') || event.title.toLowerCase().includes('cricket'));
        if (filter === 'Cultural') return matchesSearch && (event.title.toLowerCase().includes('cultural') || event.title.toLowerCase().includes('dance') || event.title.toLowerCase().includes('music') || event.title.toLowerCase().includes('art') || event.title.toLowerCase().includes('fest'));
        
        return matchesSearch;
    });

    useEffect(() => {
        fetch(`${API_URL}/events`)
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
                backgroundColor: 'var(--surface)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                        <Filter size={18} /> Filter by Category
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {['All Events', 'Exams', 'Sports', 'Cultural'].map(category => (
                            <span 
                                key={category}
                                onClick={() => setFilter(category)}
                                style={{ 
                                    padding: '0.4rem 1.2rem', 
                                    backgroundColor: filter === category ? 'var(--primary)' : 'var(--surface-hover)', 
                                    color: filter === category ? 'white' : 'var(--text-muted)', 
                                    borderRadius: '2rem', 
                                    fontSize: '0.85rem', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: 600,
                                    border: '1px solid transparent'
                                }}>
                                {category}
                            </span>
                        ))}
                    </div>
                </div>
                <div style={{ position: 'relative', flex: '1', maxWidth: '300px', minWidth: '200px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '2rem', border: '1px solid var(--border-color)', outline: 'none', width: '100%', background: 'var(--background)' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading amazing events...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'var(--surface)', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
                    <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Oops! Something went wrong</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '8rem', backgroundColor: 'var(--surface)', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
                     <Calendar size={64} style={{ color: 'var(--border-color)', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No Events Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                    {filteredEvents.map(event => {
                        const date = new Date(event.date);
                        return (
                            <div key={event.id} className="card" style={{ 
                                padding: 0, 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease',
                                cursor: 'default'
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
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                                        {event.title.toLowerCase().includes('exam') ? 'ACADEMIC' : 'SCHOOL EVENT'}
                                    </div>
                                </div>
                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>{event.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        <MapPin size={16} /> {event.location || 'School Campus'}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{event.description}</p>
                                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
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

export default Events;
