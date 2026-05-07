import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaVideo, FaChartLine, FaBrain, FaDatabase, FaMobile, FaBullhorn } from 'react-icons/fa';

function Home({ isAuthenticated }) {
  const navigate = useNavigate();

  const roles = [
    { icon: <FaDatabase />, name: 'Data Science', color: '#667eea' },
    { icon: <FaBrain />, name: 'Software Engineering', color: '#764ba2' },
    { icon: <FaMobile />, name: 'Product Management', color: '#f093fb' },
    { icon: <FaBullhorn />, name: 'Marketing', color: '#4facfe' }
  ];

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Master Your Interviews with <span className="gradient-text">AI</span></h1>
          <p>Practice with realistic mock interviews tailored to your role. Get instant feedback on your answers, speech clarity, and body language.</p>
          {!isAuthenticated ? (
            <button onClick={() => navigate('/register')} className="btn-primary btn-large">
              Start Free Practice
            </button>
          ) : (
            <button onClick={() => navigate('/device-check')} className="btn-primary btn-large">
              Begin Interview
            </button>
          )}
        </div>
      </section>

      <section className="roles-section">
        <h2>Interview for Any Role</h2>
        <div className="roles-grid">
          {roles.map((role, index) => (
            <div key={index} className="role-card" style={{ borderBottomColor: role.color }}>
              <div className="role-icon" style={{ color: role.color }}>{role.icon}</div>
              <h3>{role.name}</h3>
              <p>Tailored questions for {role.name} positions</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaMicrophone className="feature-icon" />
            <h3>Speech Analysis</h3>
            <p>Real-time transcription and clarity scoring of your answers</p>
          </div>
          <div className="feature-card">
            <FaVideo className="feature-icon" />
            <h3>Camera & Eye Contact</h3>
            <p>Track your eye contact and body language during interviews</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Detailed Reports</h3>
            <p>Comprehensive feedback and performance metrics after each session</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <h3>10+</h3>
          <p>Interview Roles</p>
        </div>
        <div className="stat-item">
          <h3>100+</h3>
          <p>Practice Questions</p>
        </div>
        <div className="stat-item">
          <h3>95%</h3>
          <p>User Satisfaction</p>
        </div>
      </section>
    </div>
  );
}

export default Home;