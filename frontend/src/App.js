// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Interview from './components/Interview';
import Report from './components/Report';
import DeviceCheck from './components/DeviceCheck';
import CameraMicCheck from './components/CameraMicCheck';
import { API_URL } from './config';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking auth at:', `${API_URL}/api/check-auth`);
      const response = await fetch(`${API_URL}/api/check-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔐 Auth response:', data);
        setIsAuthenticated(data.authenticated || false);
        if (data.authenticated && data.user_id) {
          setUser({ 
            id: data.user_id, 
            username: data.username || 'User' 
          });
        } else {
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      );
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Responsive Navbar */}
        <nav className="navbar">
          <div className="navbar-container">
            <div className="nav-brand">
              <Link to="/" className="brand-link" onClick={closeMobileMenu}>
                <span className="brand-icon">🎯</span>
                <span className="brand-text">AI Mock Interview</span>
              </Link>
            </div>

            {/* Hamburger Menu Button */}
            <button 
              className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

            {/* Nav Links */}
            <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
              <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link>
              
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                  <Link to="/device-check" className="nav-link" onClick={closeMobileMenu}>Device Check</Link>
                </>
              )}
              
              <div className="nav-auth">
                {isAuthenticated ? (
                  <>
                    <span className="user-welcome">👋 {user?.username || 'User'}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-link" onClick={closeMobileMenu}>Login</Link>
                    <Link to="/register" className="nav-link register-btn" onClick={closeMobileMenu}>Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} user={user} />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} apiUrl={API_URL} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Register apiUrl={API_URL} />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} apiUrl={API_URL} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/device-check" 
            element={
              <ProtectedRoute>
                <CameraMicCheck apiUrl={API_URL} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/interview" 
            element={
              <ProtectedRoute>
                <Interview user={user} apiUrl={API_URL} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/report/:sessionId" 
            element={
              <ProtectedRoute>
                <Report apiUrl={API_URL} />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Navbar Styles */}
      <style>{`
        /* ===== NAVBAR ===== */
        .navbar {
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 70px;
          display: flex;
          align-items: center;
        }

        .navbar-container {
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
        }

        /* ===== BRAND ===== */
        .nav-brand {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 20px;
          transition: opacity 0.3s;
        }

        .brand-link:hover {
          opacity: 0.8;
        }

        .brand-icon {
          font-size: 24px;
        }

        .brand-text {
          font-size: 18px;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 480px) {
          .brand-text {
            font-size: 15px;
          }
          .brand-icon {
            font-size: 20px;
          }
          .navbar {
            padding: 0 16px;
          }
        }

        /* ===== HAMBURGER MENU ===== */
        .hamburger-menu {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 22px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1001;
          transition: all 0.3s ease;
        }

        .hamburger-line {
          width: 100%;
          height: 3px;
          background: #ffffff;
          border-radius: 3px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .hamburger-menu.active .hamburger-line:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }

        .hamburger-menu.active .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger-menu.active .hamburger-line:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }

        /* ===== NAV LINKS ===== */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .nav-link {
          color: #c8c8d4;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-welcome {
          color: #c8c8d4;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(108, 92, 231, 0.1);
          border: 1px solid rgba(108, 92, 231, 0.2);
        }

        @media (max-width: 768px) {
          .user-welcome {
            font-size: 13px;
            padding: 6px 10px;
          }
        }

        .btn-logout {
          background: rgba(255, 71, 87, 0.1);
          color: #ff6b81;
          border: 1px solid rgba(255, 71, 87, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: inherit;
          white-space: nowrap;
        }

        .btn-logout:hover {
          background: rgba(255, 71, 87, 0.2);
          transform: translateY(-1px);
        }

        .register-btn {
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: white !important;
          padding: 8px 20px;
          border-radius: 8px;
        }

        .register-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 992px) {
          .nav-links {
            gap: 4px;
          }
          .nav-link {
            padding: 6px 12px;
            font-size: 13px;
          }
          .btn-logout {
            padding: 6px 12px;
            font-size: 13px;
          }
          .register-btn {
            padding: 6px 16px;
          }
        }

        @media (max-width: 768px) {
          .hamburger-menu {
            display: flex;
          }

          .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(10, 10, 15, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 20px 24px;
            gap: 4px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transform: translateY(-110%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            max-height: calc(100vh - 70px);
            overflow-y: auto;
            align-items: stretch;
          }

          .nav-links.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-link {
            padding: 12px 16px;
            font-size: 15px;
            width: 100%;
            text-align: center;
            border-radius: 8px;
          }

          .nav-link:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .nav-auth {
            flex-direction: column;
            gap: 8px;
            width: 100%;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          .user-welcome {
            text-align: center;
            width: 100%;
            padding: 10px 16px;
            font-size: 14px;
          }

          .btn-logout {
            width: 100%;
            padding: 12px 16px;
            font-size: 15px;
            text-align: center;
          }

          .register-btn {
            text-align: center;
            padding: 12px 16px;
          }

          .nav-links .nav-link:last-child {
            border-bottom: none;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            height: 60px;
            padding: 0 12px;
          }

          .nav-links {
            top: 60px;
            padding: 16px;
            max-height: calc(100vh - 60px);
          }

          .hamburger-menu {
            width: 26px;
            height: 20px;
          }

          .hamburger-line {
            height: 2.5px;
          }

          .hamburger-menu.active .hamburger-line:nth-child(1) {
            transform: translateY(8.5px) rotate(45deg);
          }

          .hamburger-menu.active .hamburger-line:nth-child(3) {
            transform: translateY(-8.5px) rotate(-45deg);
          }

          .nav-link {
            font-size: 14px;
            padding: 10px 14px;
          }

          .btn-logout {
            font-size: 14px;
            padding: 10px 14px;
          }

          .user-welcome {
            font-size: 13px;
            padding: 8px 14px;
          }
        }

        /* ===== LOADING SCREEN ===== */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0a0a0f;
          color: #ffffff;
          gap: 16px;
        }

        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(108, 92, 231, 0.2);
          border-top-color: #6c5ce7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-screen p {
          color: #8a8a9a;
          font-size: 14px;
        }

        /* ===== OVERLAY FOR MOBILE ===== */
        .nav-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .nav-overlay.active {
          display: block;
        }

        @media (max-width: 768px) {
          .nav-overlay.active {
            display: block;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;