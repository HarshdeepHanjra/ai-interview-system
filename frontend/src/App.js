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
    }
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
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <span className="brand-icon">🎯</span>
              <span>AI Mock Interview</span>
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/device-check" className="nav-link">Device Check</Link>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <span className="user-welcome">👋 {user?.username || 'User'}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link register-btn">Register</Link>
              </>
            )}
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
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
    </Router>
  );
}

export default App;