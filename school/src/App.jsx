import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Teachers from './pages/Teachers';
import TeacherProfile from './pages/TeacherProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Toppers from './pages/Toppers';
import StatusDashboard from './pages/StatusDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import AuthStatusManager from './components/AuthStatusManager';

import { useLocation } from 'react-router-dom';

function AppLayout() {
  const location = useLocation();
  const isAdminDashboard = location.pathname === '/admin-dashboard';

  const schoolConfig = {
    name: "ABC School",
    description: "This is a School Description",
    foundedYear: "0000",
    address: "ABC Street, City, State, Zip",
    phone: "+91 0000000000",
    email: "info@abcschool.com",
    headmaster: "ABC Headmaster"
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar schoolConfig={schoolConfig} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home schoolConfig={schoolConfig} />} />
          <Route path="/about" element={<About schoolConfig={schoolConfig} />} />
          <Route path="/gallery" element={<Gallery schoolConfig={schoolConfig} />} />
          <Route path="/events" element={<Events schoolConfig={schoolConfig} />} />
          <Route path="/toppers" element={<Toppers />} />
          <Route path="/all-teachers" element={<Teachers />} />
          <Route path="/teacher/:id" element={<TeacherProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login schoolConfig={schoolConfig} />} />
          <Route path="/register" element={<Register schoolConfig={schoolConfig} />} />
          <Route path="/status" element={<StatusDashboard />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard schoolConfig={schoolConfig} />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdminDashboard && <Footer schoolConfig={schoolConfig} />}
    </div>
  );
}

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AuthStatusManager />
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
