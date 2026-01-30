import { NavLink, Link } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="logo">
                    Ranaghat P.C.H(H.S).SCHOOL
                </Link>

                <div className="links">
                    <NavLink to="/" className={({ isActive }) => isActive ? "link active" : "link"}>Home</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "link active" : "link"}>About Us</NavLink>
                    <NavLink to="/gallery" className={({ isActive }) => isActive ? "link active" : "link"}>Gallery</NavLink>
                    <NavLink to="/events" className={({ isActive }) => isActive ? "link active" : "link"}>Events</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? "link active" : "link"}>Contact</NavLink>
                    {user && (
                        <NavLink to={user.role === 'ADMIN' ? "/admin-dashboard" : "/dashboard"} className={({ isActive }) => isActive ? "link active" : "link"}>
                            {user.role === 'ADMIN' ? "Admin Panel" : "Dashboard"}
                        </NavLink>
                    )}
                </div>
                <div className="nav-actions">
                    {!user && <NavLink to="/register" className={({ isActive }) => isActive ? "link active" : "link"} style={{ marginRight: '1rem' }}>Register</NavLink>}
                    {user ? (
                        <Link to={user.role === 'ADMIN' ? "/admin-dashboard" : "/dashboard"} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} /> {user.role === 'ADMIN' ? "Admin" : "Profile"}
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LogIn size={18} /> Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
