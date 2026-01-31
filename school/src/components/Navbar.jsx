import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User, LogIn, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    Ranaghat P.C.H(H.S).SCHOOL
                </Link>

                <button className="menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {isOpen && <div className="nav-backdrop" onClick={closeMenu}></div>}

                <div className={`nav-content ${isOpen ? 'open' : ''}`}>
                    <div className="links">
                        <NavLink to="/" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="Home">Home</NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="About Us">About Us</NavLink>
                        <NavLink to="/gallery" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="Gallery">Gallery</NavLink>
                        <NavLink to="/events" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="Events">Events</NavLink>
                        <NavLink to="/toppers" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="Toppers">Toppers</NavLink>
                        <NavLink to="/contact" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="Contact">Contact</NavLink>
                        {user && (
                            <NavLink to={user.role === 'ADMIN' ? "/admin-dashboard" : "/dashboard"} className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title={user.role === 'ADMIN' ? "Admin Panel" : "Dashboard"}>
                                {user.role === 'ADMIN' ? "Admin Panel" : "Dashboard"}
                            </NavLink>
                        )}
                    </div>
                    <div className="nav-actions">
                        <button 
                            className="theme-toggle" 
                            onClick={toggleTheme} 
                            aria-label="Toggle Theme"
                            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {!user && <NavLink to="/register" className={({ isActive }) => isActive ? "link active" : "link"} onClick={closeMenu} title="Register">Register</NavLink>}
                        {user ? (
                            <Link to={user.role === 'ADMIN' ? "/admin-dashboard" : "/dashboard"} className="btn btn-primary" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} /> {user.role === 'ADMIN' ? "Admin" : "Profile"}
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LogIn size={18} /> Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
