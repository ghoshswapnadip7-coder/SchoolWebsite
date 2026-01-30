import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <p>&copy; {new Date().getFullYear()} Ranaghat Pal Chowdhury High (H.S.) School. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
