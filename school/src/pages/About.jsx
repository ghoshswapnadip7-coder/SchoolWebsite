import React from 'react';
import { Target, Lightbulb, Users, Award, ShieldCheck, History } from 'lucide-react';

const About = ({ schoolConfig }) => {
    return (
        <div className="main">
            <section style={{
                background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1523050853063-bd8012fec046?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '8rem 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>Our Legacy of Excellence</h1>
                    <p style={{ fontSize: '1.3rem', maxWidth: '850px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
                        Serving the community since {schoolConfig.foundedYear}, {schoolConfig.name} is dedicated to nurturing future leaders through holistic education and moral integrity.
                    </p>
                </div>
            </section>

            <section style={{ padding: '8rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                left: '-20px', 
                                width: '100px', 
                                height: '100px', 
                                backgroundColor: 'var(--secondary)', 
                                borderRadius: '1rem',
                                zIndex: -1
                            }}></div>
                            <img 
                                src="https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&q=80&w=800" 
                                alt="Students in Classroom" 
                                style={{ width: '100%', borderRadius: '2rem', boxShadow: 'var(--shadow-lg)' }}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: '1rem' }}>
                                <History size={20} /> OUR HISTORY
                            </div>
                            <h2 style={{ color: 'var(--text-main)', fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>A Journey of {new Date().getFullYear() - parseInt(schoolConfig.foundedYear)}+ Years</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
                                What started as a vision to education by local visionaries in {schoolConfig.foundedYear} has now transformed into a premier educational institution. Our school has been a witness to the success stories of generations of alumni.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                                We bridge the gap between traditional values and modern innovation, ensuring our students are prepared for the challenges of the 21st century.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ padding: '8rem 0', backgroundColor: 'var(--surface-hover)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--secondary)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '2px' }}>CORE PILLARS</div>
                    <h2 style={{ fontSize: '3rem', marginBottom: '5rem', color: 'var(--text-main)' }}>Vision, Mission & Values</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2.5rem', borderTop: '6px solid var(--primary)' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--background)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 2rem',
                                color: 'var(--text-main)'
                            }}>
                                <Target size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Our Vision</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                To empower every student with the knowledge, skills, and values required to become empathetic and innovative global citizens.
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2.5rem', borderTop: '6px solid var(--secondary)' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                backgroundColor: 'rgba(234, 179, 8, 0.1)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 2rem',
                                color: 'var(--secondary)'
                            }}>
                                <Lightbulb size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Our Mission</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                To provide an inclusive environment where academic rigor is balanced with creative expression and personal development.
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2.5rem', borderTop: '6px solid var(--primary)' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--background)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 2rem',
                                color: 'var(--text-main)'
                            }}>
                                <ShieldCheck size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Our Values</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                Integrity, Respect, Resilience, and Service. These principles guide every interaction and decision in our school.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ padding: '8rem 0', textAlign: 'center' }}>
                <div className="container">
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Leadership</h2>
                        <div style={{ 
                            maxWidth: '900px', 
                            margin: '0 auto', 
                            padding: '4rem',
                            backgroundColor: 'var(--surface)',
                            borderRadius: '2rem',
                            boxShadow: 'var(--shadow-lg)',
                            position: 'relative',
                            border: '1px solid var(--border-color)'
                        }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: '-30px', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '60px',
                            backgroundColor: 'var(--secondary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '2rem'
                         }}>“</div>
                        <p style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '2.5rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                            "We don't just teach subjects; we inspire young minds to question the world and create their own paths. Our goal is excellence in every sphere of life."
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.25rem' }}>{schoolConfig.headmaster}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>HEADMASTER, {schoolConfig.name}</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
