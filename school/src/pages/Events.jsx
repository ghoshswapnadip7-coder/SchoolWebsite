import React, { useEffect, useState } from 'react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/events')
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary)' }}>Upcoming Events</h1>

            {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    {events.map(event => {
                        const date = new Date(event.date);
                        return (
                            <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'row', padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    background: 'var(--primary)', color: 'white', width: '100px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                                }}>
                                    <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{date.toLocaleString('default', { month: 'short' })}</span>
                                    <span style={{ fontSize: '2rem', fontWeight: 700 }}>{date.getDate()}</span>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{event.title}</h2>
                                    <div style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        <span>📍 {event.location}</span>
                                    </div>
                                    <p>{event.description}</p>
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
