import React from 'react';
import { Link } from 'react-router-dom';
import '../components/Navbar.css'; // Reusing some navbar styles if needed or create Home.css

const Home = () => {
    return (
        <div className="main">
            <section className="hero" style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                color: 'white',
                padding: '8rem 0 6rem',
                textAlign: 'center'
            }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>Welcome to P.C.H(H.S).School</h1>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px' }}>
                        Empowering the next generation with knowledge, character, and excellence.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/contact" className="btn btn-secondary">Admissions Open</Link>
                        <Link to="/about" className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }}>Learn More</Link>
                    </div>
                </div>
            </section>

            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', color: 'var(--primary)', marginBottom: '3rem' }}>Why Choose Us?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Academic Excellence</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Top-tier curriculum designed to foster critical thinking.</p>
                        </div>
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Vibrant Community</h3>
                            <p style={{ color: 'var(--text-muted)' }}>A diverse and inclusive environment where every student is valued.</p>
                        </div>
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Modern Facilities</h3>
                            <p style={{ color: 'var(--text-muted)' }}>State-of-the-art labs, libraries, and sports complexes.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
