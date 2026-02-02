import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

const Contact = ({ schoolConfig }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <div className="main">
            <section style={{
                background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '8rem 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>Contact {schoolConfig.name}</h1>
                    <p style={{ fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
                        {schoolConfig.description}
                    </p>
                </div>
            </section>

            <section style={{ padding: '8rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 2fr 3fr))', gap: '5rem' }}>
                        {/* Contact Info */}
                        <div>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '2rem' }}>Get in Touch</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.8' }}>
                                Our administration office is open Monday through Saturday to assist you with any information you might need regarding our school.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '1rem', 
                                        backgroundColor: 'var(--surface-hover)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        flexShrink: 0
                                    }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Visit Us</h4>
                                        <p style={{ color: 'var(--text-muted)' }}>{schoolConfig.address}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '1rem', 
                                        backgroundColor: 'var(--surface-hover)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        flexShrink: 0
                                    }}>
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Call Us</h4>
                                        <p style={{ color: 'var(--text-muted)' }}>{schoolConfig.phone}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '1rem', 
                                        backgroundColor: 'var(--surface-hover)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        flexShrink: 0
                                    }}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Email Us</h4>
                                        <p style={{ color: 'var(--text-muted)' }}>{schoolConfig.email}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '1rem', 
                                        backgroundColor: 'var(--surface-hover)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        flexShrink: 0
                                    }}>
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Office Hours</h4>
                                        <p style={{ color: 'var(--text-muted)' }}>Mon - Fri: 8:00 AM - 4:00 PM<br />Sat: 8:00 AM - 1:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="card" style={{ padding: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                <MessageSquare style={{ color: 'var(--secondary)' }} />
                                <h3 style={{ fontSize: '1.75rem', margin: 0 }}>Send a Message</h3>
                            </div>

                            {status === 'success' ? (
                                <div style={{ 
                                    padding: '2rem', 
                                    backgroundColor: '#dcfce7', 
                                    color: '#166534', 
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Message Sent!</h4>
                                    <p>We'll get back to you as soon as possible.</p>
                                    <button 
                                        onClick={() => setStatus(null)}
                                        className="btn btn-primary"
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                placeholder="John Doe"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
                                            <input 
                                                type="email" 
                                                required 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                placeholder="john@example.com"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Subject</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            placeholder="Admission Inquiry"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Message</label>
                                        <textarea 
                                            required 
                                            rows="5"
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            placeholder="Tell us how we can help you..."
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }}
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'sending'}
                                        className="btn btn-primary" 
                                        style={{ width: '100%', padding: '1rem', display: 'flex', gap: '0.5rem' }}
                                    >
                                        {status === 'sending' ? 'Sending...' : (
                                            <>Submit Message <Send size={18} /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
