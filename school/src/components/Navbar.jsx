import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="logo">
                    P.C.H(H.S).School
                </Link>

                <div className="links">
                    <Link to="/" className="link">Home</Link>
                    <Link to="/about" className="link">About</Link>
                    <Link to="/gallery" className="link">Gallery</Link>
                    <Link to="/events" className="link">Events</Link>
                    <Link to="/contact" className="link">Contact</Link>
                </div>

                <div className="auth">
                    <Link to="/login" className="btn btn-primary">Login</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
