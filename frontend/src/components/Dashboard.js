// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaStar, 
  FaClock, 
  FaEye, 
  FaMicrophone,
  FaBrain,
  FaArrowRight,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaDownload,
  FaTrash,
  FaTrophy
} from 'react-icons/fa';
import { API_URL } from '../config';
import './Dashboard.css';

function Dashboard({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    averageScore: 0,
    bestScore: 0,
    recentSessions: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching sessions from:', `${API_URL}/api/user-sessions`);
      
      const response = await fetch(`${API_URL}/api/user-sessions`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Sessions response:', data);
      setSessions(data.sessions || []);
      
      if (data.sessions && data.sessions.length > 0) {
        const scores = data.sessions.map(s => s.score).filter(s => s !== null && s !== undefined);
        const total = data.sessions.length;
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        
        setStats({
          total,
          averageScore: averageScore || 0,
          bestScore: bestScore || 0,
          recentSessions: data.sessions.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      setError('Failed to load your interview history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#FBBF24';
    return '#EF4444';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    return '📈';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'data_science': '📊',
      'software_engineering': '💻',
      'product_management': '📱',
      'marketing': '📢',
      'finance': '💰',
      'healthcare': '🏥',
      'education': '📚',
      'general': '🎯'
    };
    return icons[role] || '🎯';
  };

  const handleViewReport = (sessionId) => {
    navigate(`/report/${sessionId}`);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/session/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        fetchUserSessions();
      } else {
        alert('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FaSpinner className="spin large" />
        <p>Loading your interview history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle className="error-icon" />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchUserSessions} className="btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Your Interview Dashboard</h1>
        <p>Track your progress and review past interviews</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card-dashboard">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' }}>
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Interviews</p>
          </div>
        </div>
        <div className="stat-card-dashboard">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>{stats.averageScore.toFixed(1)}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card-dashboard">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24' }}>
            <FaTrophy />
          </div>
          <div className="stat-info">
            <h3>{stats.bestScore.toFixed(1)}%</h3>
            <p>Best Score</p>
          </div>
        </div>
        <div className="stat-card-dashboard">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
            <FaBrain />
          </div>
          <div className="stat-info">
            <h3>{sessions.length > 0 ? sessions[0]?.role?.replace('_', ' ').toUpperCase() || 'N/A' : 'N/A'}</h3>
            <p>Latest Role</p>
          </div>
        </div>
      </div>

      <div className="sessions-section">
        <div className="sessions-header">
          <h2>Your Interview History</h2>
          <span className="sessions-count">{sessions.length} interviews</span>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No Interviews Yet</h3>
            <p>Start your first interview practice to track your progress!</p>
            <button onClick={() => navigate('/device-check')} className="btn-primary">
              Start First Interview
              <FaArrowRight className="btn-icon" />
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-card-header">
                  <div className="session-role">
                    <span className="role-icon">{getRoleIcon(session.role)}</span>
                    <span className="role-name">{session.role?.replace('_', ' ').toUpperCase() || 'General'}</span>
                  </div>
                  <div className="session-actions">
                    <button 
                      onClick={() => handleViewReport(session.id)} 
                      className="view-report-btn"
                    >
                      <FaEye /> View Report
                    </button>
                    <button 
                      onClick={() => handleDeleteSession(session.id)} 
                      className="delete-btn"
                      title="Delete Session"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="session-card-body">
                  <div className="session-score">
                    <div className="score-circle" style={{ borderColor: getScoreColor(session.score) }}>
                      <span className="score-number" style={{ color: getScoreColor(session.score) }}>
                        {session.score !== null && session.score !== undefined ? Math.round(session.score) : 'N/A'}
                      </span>
                      <span className="score-label">Score</span>
                    </div>
                    <div className="score-emoji">
                      {getScoreEmoji(session.score)}
                    </div>
                  </div>
                  <div className="session-meta">
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{formatDate(session.created_at || session.date)}</span>
                    </div>
                    <div className="meta-item">
                      <FaClock className="meta-icon" />
                      <span>Completed</span>
                    </div>
                    {session.score >= 80 && (
                      <div className="meta-item success">
                        <FaCheckCircle className="meta-icon" />
                        <span>Excellent!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button onClick={() => navigate('/device-check')} className="action-btn">
            <FaMicrophone />
            <span>New Interview</span>
          </button>
          <button onClick={() => navigate('/')} className="action-btn">
            <FaBrain />
            <span>Practice More</span>
          </button>
          <button onClick={() => window.print()} className="action-btn">
            <FaDownload />
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;