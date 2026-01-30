import React from 'react';
import { Link } from 'react-router-dom';
import { 
    GraduationCap, 
    Award, 
    Clock, 
    Users, 
    BookOpen, 
    Globe, 
    ArrowRight,
    FlaskConical,
    Trophy,
    Monitor
} from 'lucide-react';

const Home = () => {
    return (
        <div className="main">
            <section className="hero" style={{
                background: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '12rem 0 10rem',
                textAlign: 'center'
            }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: 'rgba(234, 179, 8, 0.2)', 
                        color: 'var(--secondary)', 
                        padding: '0.5rem 1.25rem', 
                        borderRadius: '2rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        border: '1px solid rgba(234, 179, 8, 0.3)'
                    }}>
                        <GraduationCap size={18} /> Established 1853
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, maxWidth: '1000px' }}>Shaping Minds, <span style={{ color: 'var(--secondary)' }}>Building Futures</span></h1>
                    <p style={{ fontSize: '1.4rem', color: '#cbd5e1', maxWidth: '750px', lineHeight: 1.6 }}>
                        Welcome to Ranaghat Pal Chowdhury High (H.S.) School, a legacy of academic excellence and character building in the heart of our community.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                        <Link to="/contact" className="btn btn-secondary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
                            Apply for Admission <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </Link>
                        <Link to="/about" className="btn" style={{ 
                            padding: '1.25rem 2.5rem', 
                            border: '2px solid white', 
                            color: 'white',
                            fontSize: '1.1rem' 
                        }}>Our Legacy</Link>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section style={{ padding: '0', marginTop: '-5rem', position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                        gap: '2rem',
                        padding: '1rem'
                    }}>
                        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <Users size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>2500+</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Active Students</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <Award size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>120+</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Excellence Awards</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <Clock size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>150+</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Years of Legacy</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <BookOpen size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>98%</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Final Results</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '8rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>Why Ranaghat Pal Chowdhury High (H.S.) School?</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.7' }}>
                            We provide a nurturing environment that encourages students to explore their passions, challenge their limits, and grow into competent global citizens.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                        <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '1rem', 
                                backgroundColor: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                             }}>
                                <FlaskConical size={32} />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>S.T.E.M Excellence</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                                State-of-the-art laboratories for Science, Technology, and Mathematics to foster a hands-on learning culture.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '1rem', 
                                backgroundColor: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                             }}>
                                <Trophy size={32} />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>Holistic Growth</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                                Comprehensive sports programs and creative arts curriculum to ensure overall physical and mental development.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '1rem', 
                                backgroundColor: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                             }}>
                                <Monitor size={32} />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>Modern Classrooms</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                                Smart classes equipped with digital tools and high-speed internet to stay ahead in the technological age.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ 
                padding: '10rem 0', 
                background: 'var(--primary)', 
                color: 'white', 
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative circle */}
                <div style={{ 
                    position: 'absolute', 
                    top: '-100px', 
                    right: '-100px', 
                    width: '300px', 
                    height: '300px', 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.05)' 
                }}></div>
                
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Start Your Journey Today</h2>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '750px', margin: '0 auto 3rem' }}>
                        Admissions are now open for the 2025-26 academic session. Join a tradition of excellence.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <Link to="/contact" className="btn btn-secondary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem' }}>Apply Now</Link>
                        <Link to="/gallery" className="btn" style={{ padding: '1.25rem 3.5rem', border: '1px solid #334155', color: '#94a3b8' }}>Virtual Tour</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
