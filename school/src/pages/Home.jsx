import { API_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { 
    BookOpen, Users, Trophy, Target, ArrowRight, Star,
    CheckCircle2, Globe, GraduationCap, Calendar, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = ({ schoolConfig }) => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, alumni: 0 });

    useEffect(() => {
        // Mock stats or fetch from API
        setStats({ students: 1500, teachers: 85, alumni: 5000 });
    }, []);

    return (
        <div style={{ background: 'var(--background)' }}>
            {/* Hero Section */}
            <section style={{ 
                minHeight: '90vh', 
                display: 'flex', 
                alignItems: 'center', 
                background: 'linear-gradient(135deg, var(--footer-bg) 0%, #171d29 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                padding: '4rem 1rem'
            }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2rem', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                <Star size={16} fill="var(--secondary)" /> EXCELLENCE IN EDUCATION SINCE {schoolConfig.foundedYear}
                            </div>
                            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                Shaping Minds, <span style={{ color: 'var(--secondary)' }}>Building <br /> Futures</span>
                            </h1>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '600px' }}>
                                {schoolConfig.description}
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <Link to="/register" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Admission 2025-26</Link>
                                <Link to="/contact" className="btn" style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>Contact Us <ArrowRight size={18} /></Link>
                            </div>
                        </div>
                        <div style={{ display: 'none', lg: 'block' }}>
                            <div style={{ position: 'relative', borderRadius: '2rem', overflow: 'hidden', boxShadow: '20px 20px 60px rgba(0,0,0,0.3)' }}>
                                <img src="https://images.unsplash.com/photo-1523050853063-91a51e0672a2?auto=format&fit=crop&q=80&w=800" alt="School Campus" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '1.5rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{new Date().getFullYear() - parseInt(schoolConfig.foundedYear)}+</div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Years Legacy</div>
                                        </div>
                                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                                        <div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>5k+</div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Happy Alumni</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '8rem 1rem' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Why Choose {schoolConfig.name}?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Combining traditional values with modern learning methodologies.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                        {[
                            { icon: BookOpen, title: "Modern Curriculum", desc: "Digital classrooms with the latest teaching aids and a focus on holistic development.", color: "var(--secondary)" },
                            { icon: Trophy, title: "Sports Excellence", desc: "Large playgrouds for cricket, football and other indoor sports facilities.", color: "#eab308" },
                            { icon: Target, title: "Skill Development", desc: "Dedicated vocational training centers and laboratories for hands-on learning.", color: "#22c55e" },
                            { icon: Globe, title: "Digital Literacy", desc: "Advanced computer labs and coding workshops to prepare for the future.", color: "#ef4444" }
                        ].map((feature, idx) => (
                            <div key={idx} className="card" style={{ transition: 'all 0.3s ease' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: idx === 0 ? 'rgba(234,179,8,0.1)' : `${feature.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: feature.color }}>
                                    <feature.icon size={30} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section style={{ padding: '8rem 1rem', background: 'var(--surface-hover)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800" alt="Students" style={{ width: '100%', borderRadius: '2rem', boxShadow: 'var(--shadow-lg)' }} />
                            <div style={{ position: 'absolute', top: '-1.5rem', left: '-1.5rem', background: 'var(--secondary)', color: 'var(--primary)', padding: '2rem', borderRadius: '1.5rem', fontWeight: 800, boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ fontSize: '2.5rem' }}>A+</div>
                                <div style={{ fontSize: '0.8rem' }}>Grade Rating</div>
                            </div>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-main)' }}>Our Vision for Future Generation</h2>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {[
                                    { title: "Academic Rigor", desc: "Challenging students to reach their full potential." },
                                    { title: "Character Building", desc: "Instilling values of integrity and empathy." },
                                    { title: "Innovation", desc: "Encouraging creative thinking and problem solving." }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ flexShrink: 0 }}><CheckCircle2 color="var(--secondary)" size={24} /></div>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{item.title}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/gallery" className="btn btn-primary" style={{ marginTop: '3rem' }}>Explore Gallery</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ backgroundColor: 'var(--footer-bg)', color: 'white', padding: '6rem 1rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.15)', filter: 'blur(100px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', filter: 'blur(80px)' }}></div>
                
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1.5rem', fontWeight: 800, color: 'white' }}>Start Your Journey Today</h2>
                        <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9, lineHeight: 1.6 }}>Join our vibrant community of learners and educators. Admissions for the academic year 2025-26 are now open.</p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-secondary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem' }}>Apply Online Now</Link>
                            <Link to="/contact" className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem 3.5rem', fontSize: '1.1rem', backdropFilter: 'blur(10px)' }}>Visit Our Campus</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
