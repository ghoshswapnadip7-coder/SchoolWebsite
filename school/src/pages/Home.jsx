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
                paddingTop: '10rem',
                paddingBottom: '10rem',
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
                    <h1 className="hero-title" style={{ maxWidth: '1000px' }}>Shaping Minds, <span style={{ color: 'var(--secondary)' }}>Building Futures</span></h1>
                    <p className="hero-text">
                        Welcome to Ranaghat Pal Chowdhury High (H.S.) School, a legacy of academic excellence and character building in the heart of our community.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'center' }}>
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', /* Reduced min-width to prevent wrapping */
                        gap: '2rem', /* Slightly tighter gap to ensure fit */
                        padding: '1rem'
                    }}>
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <Users size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>2500+</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1.5px' }}>Active Students</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <Award size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>120+</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1.5px' }}>Excellence Awards</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <Clock size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>150+</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1.5px' }}>Years of Legacy</div>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', borderBottom: '4px solid var(--secondary)' }}>
                            <BookOpen size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>98%</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1.5px' }}>Final Results</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ paddingTop: '3rem', paddingBottom: '8rem' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2.5rem' }}>Why Ranaghat Pal Chowdhury High (H.S.) School?</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '2' }}>
                            We provide a nurturing environment that encourages students to explore their passions, challenge their limits, and grow into competent global citizens.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                borderRadius: '1.2rem', 
                                backgroundColor: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                             }}>
                                <FlaskConical size={36} />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.75rem' }}>S.T.E.M Excellence</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                State-of-the-art laboratories for Science, Technology, and Mathematics to foster a hands-on learning culture.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                borderRadius: '1.2rem', 
                                backgroundColor: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                             }}>
                                <Trophy size={36} />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.75rem' }}>Holistic Growth</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                Comprehensive sports programs and creative arts curriculum to ensure overall physical and mental development.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                borderRadius: '1.2rem', 
                                backgroundColor: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                             }}>
                                <Monitor size={36} />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.75rem' }}>Modern Classrooms</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                Smart classes equipped with digital tools and high-speed internet to stay ahead in the technological age.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* CTA Section */}
            <section style={{ 
                paddingTop: '6rem',
                paddingBottom: '6rem', 
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
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Start Your Journey Today</h2>
                    <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '750px', margin: '0 auto 3rem' }}>
                        Admissions are now open for the 2026-27 academic session. Join a tradition of excellence.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <Link to="/contact" className="btn btn-secondary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem' }}>Apply Now</Link>
                        <Link to="/gallery" className="btn" style={{ padding: '1.25rem 3.5rem', border: '1px solid #334155', color: '#94a3b8' }}>Virtual Tour</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
