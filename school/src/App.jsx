import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import { AuthProvider } from './context/AuthContext';

// Placeholders for now
const About = () => <div className="container" style={{ padding: '4rem 1rem' }}><h1>About Page</h1></div>;
const Contact = () => <div className="container" style={{ padding: '4rem 1rem' }}><h1>Contact Page</h1></div>;
const Login = () => <div className="container" style={{ padding: '4rem 1rem' }}><h1>Login Page</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
