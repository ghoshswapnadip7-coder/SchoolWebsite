import React, { useEffect, useState } from 'react';

const Gallery = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/gallery')
            .then(res => res.json())
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>School Gallery</h1>

            {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {items.map(item => (
                        <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem' }}>{item.title}</h3>
                                {item.description && <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
