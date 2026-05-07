import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Interview from './components/Interview';
import Report from './components/Report';
import DeviceCheck from './components/DeviceCheck';
import CameraMicCheck from './components/CameraMicCheck';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/check-auth', {
        credentials: 'include'
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        setUser({ id: data.user_id, username: data.username });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="brand-icon">🎯</span>
            <span>AI Mock Interview</span>
          </div>
          <div className="nav-links">
            <a href="/">Home</a>
            {isAuthenticated ? (
              <>
                <span className="user-welcome">👋 {user?.username}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </>
            ) : (
              <>
                <a href="/login">Login</a>
                <a href="/register">Register</a>
              </>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/device-check" element={isAuthenticated ? <CameraMicCheck /> : <Navigate to="/login" />} />
          <Route path="/device-check" element={isAuthenticated ? <DeviceCheck /> : <Navigate to="/login" />} />
          <Route path="/interview" element={isAuthenticated ? <Interview user={user} /> : <Navigate to="/login" />} />
          <Route path="/report/:sessionId" element={isAuthenticated ? <Report /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;