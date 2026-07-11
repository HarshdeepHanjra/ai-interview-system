// frontend/src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Cpu,
  Network,
  CheckCircle
} from 'lucide-react';
import { API_URL } from '../config';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check for registration success message
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.message) {
      setSuccess(state.message);
      setTimeout(() => setSuccess(''), 5000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📡 Sending login request to:', `${API_URL}/api/login`);
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📥 Login response:', data);
      
      if (data.success) {
        if (onLogin) {
          onLogin({ 
            id: data.user_id, 
            username: data.username 
          });
        }
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background animation */}
      <div className="bg-animation">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
        <div className="gradient-sphere sphere-4"></div>
        <div className="grid-lines"></div>
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`
            }}></div>
          ))}
        </div>
      </div>

      <div className="login-card">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="logo">
            <div className="logo-icon">
              <Brain size={28} />
              <div className="pulse-ring"></div>
            </div>
            <span>AI Interview</span>
          </div>
          <div className="badge">
            <Shield size={12} />
            <span>Secure</span>
          </div>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1>
            <span className="gradient-text">Welcome Back</span>
          </h1>
          <p>Sign in to continue your interview preparation</p>
        </div>

        {/* Features */}
        <div className="features-row">
          <div className="feature-item">
            <Cpu size={16} />
            <span>AI-Powered</span>
          </div>
          <div className="feature-item">
            <Network size={16} />
            <span>Instant Feedback</span>
          </div>
          <div className="feature-item">
            <Shield size={16} />
            <span>Secure</span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                className="form-input"
                autoComplete="username"
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                className="form-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="input-glow"></div>
            </div>
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.username || !formData.password}
            className="btn-primary btn-block"
          >
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              <span className="btn-content">
                Sign In
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="divider">
          <span>New to AI Interview?</span>
        </div>

        <Link to="/register" className="register-link">
          Create an account
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Styles */}
      <style>{`
        /* Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Container */
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        /* Background Animation */
        .bg-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .gradient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: floatSphere 25s infinite ease-in-out;
        }

        .sphere-1 {
          width: 500px;
          height: 500px;
          top: -250px;
          right: -150px;
          background: radial-gradient(circle, #6c5ce7, transparent 70%);
          animation-delay: 0s;
        }

        .sphere-2 {
          width: 350px;
          height: 350px;
          bottom: -150px;
          left: -100px;
          background: radial-gradient(circle, #00b894, transparent 70%);
          animation-delay: -8s;
        }

        .sphere-3 {
          width: 250px;
          height: 250px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, #fd79a8, transparent 70%);
          animation-delay: -15s;
        }

        .sphere-4 {
          width: 150px;
          height: 150px;
          top: 15%;
          right: 15%;
          background: radial-gradient(circle, #fdcb6e, transparent 70%);
          animation-delay: -20s;
        }

        @keyframes floatSphere {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -50px) scale(1.2); }
          50% { transform: translate(-30px, 30px) scale(0.8); }
          75% { transform: translate(30px, 50px) scale(1.1); }
        }

        .grid-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(108, 92, 231, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 92, 231, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          background: rgba(108, 92, 231, 0.3);
          border-radius: 50%;
          animation: floatParticle linear infinite;
        }

        @keyframes floatParticle {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        /* Login Card */
        .login-card {
          background: rgba(20, 20, 30, 0.92);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(108, 92, 231, 0.15);
          border-radius: 24px;
          padding: 40px 48px;
          max-width: 420px;
          width: 100%;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 20px;
            border-radius: 20px;
          }
        }

        @media (max-width: 380px) {
          .login-card {
            padding: 20px 16px;
            border-radius: 16px;
          }
        }

        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 30px 80px rgba(108, 92, 231, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        /* Brand Header */
        .brand-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        @media (max-width: 380px) {
          .brand-header {
            margin-bottom: 20px;
          }
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }

        @media (max-width: 480px) {
          .logo {
            font-size: 18px;
            gap: 10px;
          }
        }

        .logo-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          border-radius: 12px;
          color: white;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .logo-icon {
            width: 35px;
            height: 35px;
          }
          .logo-icon svg {
            width: 22px;
            height: 22px;
          }
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          border: 2px solid rgba(108, 92, 231, 0.3);
          animation: pulseRing 2s infinite;
        }

        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .badge {
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .badge {
            font-size: 10px;
            padding: 3px 10px;
          }
        }

        /* Auth Header */
        .auth-header {
          margin-bottom: 24px;
        }

        @media (max-width: 480px) {
          .auth-header {
            margin-bottom: 20px;
          }
        }

        .auth-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        @media (max-width: 480px) {
          .auth-header h1 {
            font-size: 24px;
          }
        }

        @media (max-width: 380px) {
          .auth-header h1 {
            font-size: 20px;
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, #6c5ce7, #a29bfe, #fd79a8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-header p {
          color: #8a8a9a;
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 480px) {
          .auth-header p {
            font-size: 13px;
          }
        }

        /* Features */
        .features-row {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .features-row {
            gap: 6px;
            margin-bottom: 20px;
          }
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(108, 92, 231, 0.1);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: #c8c8d4;
          border: 1px solid rgba(108, 92, 231, 0.1);
          transition: all 0.3s;
        }

        @media (max-width: 480px) {
          .feature-item {
            font-size: 10px;
            padding: 4px 10px;
          }
        }

        @media (max-width: 380px) {
          .feature-item {
            font-size: 9px;
            padding: 3px 8px;
          }
        }

        .feature-item:hover {
          background: rgba(108, 92, 231, 0.2);
          transform: translateY(-2px);
          border-color: rgba(108, 92, 231, 0.3);
        }

        .feature-item svg {
          color: #6c5ce7;
        }

        /* Messages */
        .success-message {
          background: rgba(0, 184, 148, 0.1);
          color: #00b894;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(0, 184, 148, 0.2);
          animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-message {
          background: rgba(255, 71, 87, 0.1);
          color: #ff6b81;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 71, 87, 0.2);
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        @media (max-width: 480px) {
          .login-form {
            gap: 14px;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #c8c8d4;
        }

        @media (max-width: 480px) {
          .form-group label {
            font-size: 12px;
          }
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 12px 42px 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s;
          color: #000000;
          font-family: inherit;
          position: relative;
          z-index: 1;
          height: 48px;
        }

        @media (max-width: 480px) {
          .form-input {
            padding: 11px 38px 11px 16px;
            font-size: 13px;
            height: 44px;
          }
        }

        @media (max-width: 380px) {
          .form-input {
            padding: 10px 34px 10px 14px;
            font-size: 12px;
            height: 40px;
          }
        }

        .form-input:focus {
          outline: none;
          border-color: #6c5ce7;
          background: rgba(243, 242, 242, 0.97);
          box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
        }

        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-input::placeholder {
          color: #5a5a6a;
        }

        .form-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px rgba(20, 20, 30, 0.9) inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .input-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .form-input:focus ~ .input-glow {
          opacity: 1;
          box-shadow: 0 0 30px rgba(108, 92, 231, 0.05);
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #5a5a6a;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.3s;
          z-index: 2;
        }

        .toggle-password:hover {
          color: #6c5ce7;
        }

        .toggle-password:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        @media (max-width: 480px) {
          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #8a8a9a;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .remember-me {
            font-size: 12px;
          }
        }

        .remember-me input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #6c5ce7;
          cursor: pointer;
        }

        .forgot-link {
          font-size: 13px;
          color: #6c5ce7;
          text-decoration: none;
          transition: color 0.3s;
        }

        @media (max-width: 480px) {
          .forgot-link {
            font-size: 12px;
          }
        }

        .forgot-link:hover {
          color: #a29bfe;
          text-decoration: underline;
        }

        /* Button */
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          font-family: inherit;
          position: relative;
          overflow: hidden;
          height: 54px;
        }

        @media (max-width: 480px) {
          .btn-primary {
            padding: 12px;
            font-size: 15px;
            height: 48px;
          }
        }

        @media (max-width: 380px) {
          .btn-primary {
            padding: 10px;
            font-size: 14px;
            height: 44px;
          }
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover:not(:disabled)::before {
          left: 100%;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(108, 92, 231, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0 20px;
        }

        @media (max-width: 480px) {
          .divider {
            margin: 20px 0 16px;
          }
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .divider span {
          color: #5a5a6a;
          font-size: 13px;
          white-space: nowrap;
        }

        /* Register Link */
        .register-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6c5ce7;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
          padding: 10px;
          border-radius: 8px;
        }

        @media (max-width: 480px) {
          .register-link {
            font-size: 13px;
            padding: 8px;
          }
        }

        .register-link:hover {
          gap: 12px;
          background: rgba(108, 92, 231, 0.05);
          color: #a29bfe;
        }

        /* Touch-friendly for mobile */
        @media (hover: none) {
          .feature-item:hover {
            transform: none;
            background: rgba(108, 92, 231, 0.1);
          }

          .login-card:hover {
            transform: none;
          }

          .btn-primary:hover:not(:disabled) {
            transform: none;
          }

          .register-link:hover {
            gap: 8px;
            background: none;
          }
        }

        /* Fix for iOS Safari */
        @supports (-webkit-touch-callout: none) {
          .login-card {
            background: rgba(20, 20, 30, 0.98);
          }
        }

        /* Dark mode support for input autofill */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(20, 20, 30, 0.95) inset !important;
          -webkit-text-fill-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}

export default Login;