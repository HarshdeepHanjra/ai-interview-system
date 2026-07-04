import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMicrophone, 
  FaVideo, 
  FaChartLine, 
  FaBrain, 
  FaDatabase, 
  FaMobile, 
  FaBullhorn,
  FaRocket,
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
  FaPlay,
  FaClock,
  FaGithub,
  FaLinkedin,
  FaTwitter
} from 'react-icons/fa';

function Home({ isAuthenticated }) {
  const navigate = useNavigate();
  const [animatedStats, setAnimatedStats] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.querySelector('.stats');
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && !animatedStats) {
          setAnimatedStats(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animatedStats]);

  const roles = [
    { 
      icon: <FaDatabase />, 
      name: 'Data Science', 
      description: 'ML, Analytics & AI',
      questions: 45,
      difficulty: 'Advanced',
      roleKey: 'data_science'
    },
    { 
      icon: <FaBrain />, 
      name: 'Software Engineering', 
      description: 'Full Stack & Cloud',
      questions: 60,
      difficulty: 'Intermediate',
      roleKey: 'software_engineering'
    },
    { 
      icon: <FaMobile />, 
      name: 'Product Management', 
      description: 'Strategy & Roadmaps',
      questions: 35,
      difficulty: 'Advanced',
      roleKey: 'product_management'
    },
    { 
      icon: <FaBullhorn />, 
      name: 'Marketing', 
      description: 'Digital & Growth',
      questions: 40,
      difficulty: 'Intermediate',
      roleKey: 'marketing'
    }
  ];

  const features = [
    {
      icon: <FaMicrophone />,
      title: 'Speech Analysis',
      description: 'Real-time transcription and clarity scoring of your answers with advanced AI',
      stats: '95% Accuracy'
    },
    {
      icon: <FaVideo />,
      title: 'Camera & Eye Contact',
      description: 'Track your eye contact and body language during interviews with precision',
      stats: 'Real-time'
    },
    {
      icon: <FaChartLine />,
      title: 'Detailed Reports',
      description: 'Comprehensive feedback and performance metrics after each session',
      stats: 'Instant Feedback'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=06B6D4&color=fff&size=60',
      text: 'This platform helped me land my dream job at Google. The AI feedback was incredibly accurate and helpful.'
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist at Amazon',
      image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0F172A&color=fff&size=60',
      text: 'The mock interviews felt so real. I was able to practice and improve my answers until I was fully prepared.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager at Microsoft',
      image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=06B6D4&color=fff&size=60',
      text: 'The detailed reports and speech analysis gave me the confidence I needed to ace my interviews.'
    }
  ];

  const stats = [
    { value: '10+', label: 'Interview Roles', icon: <FaUsers /> },
    { value: '100+', label: 'Practice Questions', icon: <FaBrain /> },
    { value: '95%', label: 'User Satisfaction', icon: <FaCheckCircle /> }
  ];

  // Handle role practice click
  const handleRolePractice = (roleKey, roleName) => {
    if (isAuthenticated) {
      navigate('/device-check', { state: { selectedRole: roleKey } });
    } else {
      navigate('/register');
    }
  };

  // Handle learn more
  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="home-container">
      {/* Hero Section - Full Screen */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <FaRocket className="badge-icon" />
            <span>AI-Powered Interview Training</span>
          </div>
          <h1>
            Master Your<br />
            Interviews with<br />
            <span className="gradient-text">AI</span>
          </h1>
          <p className="hero-description">
            Practice with realistic mock interviews tailored to your role. 
            Get instant feedback on your answers, speech clarity, and body language.
          </p>
          <div className="hero-actions">
            {!isAuthenticated ? (
              <button onClick={() => navigate('/register')} className="btn-primary btn-large">
                Start Free Practice
                <FaArrowRight className="btn-icon" />
              </button>
            ) : (
              <button onClick={() => navigate('/device-check')} className="btn-primary btn-large">
                Begin Interview
                <FaArrowRight className="btn-icon" />
              </button>
            )}
            {/* <button onClick={handleWatchDemo} className="btn-secondary btn-large">
              <FaPlay className="btn-icon" />
              Watch Demo
            </button> */}
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <FaShieldAlt />
              <span>Privacy Protected</span>
            </div>
            <div className="trust-item">
              <FaUsers />
              <span>10K+ Users</span>
            </div>
            <div className="trust-item">
              <FaStar />
              <span>4.9/5 Rating</span>
            </div>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon">
                <FaClock />
              </div>
              <div>
                <strong>24/7 Access</strong>
                <span>Practice anytime</span>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">
                <FaCheckCircle />
              </div>
              <div>
                <strong>AI Feedback</strong>
                <span>Instant results</span>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">
                <FaBrain />
              </div>
              <div>
                <strong>Smart Learning</strong>
                <span>Adaptive questions</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="floating-card card-1">
            <FaMicrophone className="float-icon" />
            <span>Speech Analysis</span>
          </div>
          <div className="floating-card card-2">
            <FaVideo className="float-icon" />
            <span>Eye Tracking</span>
          </div>
          <div className="floating-card card-3">
            <FaChartLine className="float-icon" />
            <span>AI Feedback</span>
          </div>
          <div className="hero-circle circle-1"></div>
          <div className="hero-circle circle-2"></div>
          <div className="hero-circle circle-3"></div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="section-header">
          <h2>Interview for Any Role</h2>
          <p>Choose from a wide range of roles and get tailored questions</p>
        </div>
        <div className="roles-grid">
          {roles.map((role, index) => (
            <div 
              key={index} 
              className={`role-card ${activeRole === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveRole(index)}
              onMouseLeave={() => setActiveRole(null)}
            >
              <div className="role-icon-wrapper">
                {role.icon}
              </div>
              <h3>{role.name}</h3>
              <p>{role.description}</p>
              <div className="role-meta">
                <span className="role-tag">
                  <FaBrain className="tag-icon" />
                  {role.questions} Questions
                </span>
                <span className={`role-difficulty ${role.difficulty.toLowerCase()}`}>
                  {role.difficulty}
                </span>
              </div>
              <button 
                onClick={() => handleRolePractice(role.roleKey, role.name)}
                className="role-button"
              >
                Practice Now
                <FaArrowRight className="role-arrow" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose Our Platform?</h2>
          <p>Everything you need to ace your interviews in one place</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-stats">
                <span className="feature-stat">{feature.stats}</span>
              </div>
              <div className="feature-link" onClick={handleLearnMore}>
                <span>Learn more</span>
                <FaArrowRight className="feature-arrow" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="stats">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-icon">{stat.icon}</div>
              <h3 className={`stat-value ${animatedStats ? 'animate' : ''}`}>
                {stat.value}
              </h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join thousands of successful candidates who landed their dream jobs</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <img src={testimonial.image} alt={testimonial.name} />
                <div className="testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-rating">
                <FaStar className="star" />
                <FaStar className="star" />
                <FaStar className="star" />
                <FaStar className="star" />
                <FaStar className="star" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Ace Your Interview?</h2>
          <p>Join thousands of successful candidates who landed their dream jobs</p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <button onClick={() => navigate('/register')} className="btn-primary btn-large">
                Get Started Now
                <FaArrowRight className="btn-icon" />
              </button>
            ) : (
              <button onClick={() => navigate('/device-check')} className="btn-primary btn-large">
                Start Practicing
                <FaArrowRight className="btn-icon" />
              </button>
            )}
            {/* <button onClick={handleWatchDemo} className="btn-outline btn-large">
              <FaPlay className="btn-icon" />
              View Demo
            </button> */}
          </div>
          <div className="cta-social">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
            </a>
          </div>
        </div>
      </section>

      {/* Styles - Full Screen */}
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .home-container {
          min-height: 100vh;
          width: 100%;
          background: #F8FAFC;
          overflow-x: hidden;
        }

        /* Hero Section - Full Screen */
        .hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4rem 6rem;
          min-height: 100vh;
          width: 100%;
          background: #0F172A;
          overflow: hidden;
          margin: 0;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.03) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          flex: 1;
          max-width: 600px;
          color: white;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(6, 182, 212, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(6, 182, 212, 0.15);
          color: #06B6D4;
        }

        .badge-icon {
          color: #06B6D4;
        }

        .hero h1 {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #F8FAFC;
        }

        .gradient-text {
          background: linear-gradient(135deg, #06B6D4, #0891B2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
          color: #94A3B8;
          max-width: 550px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 2rem;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: #06B6D4;
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
          background: #0891B2;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 2rem;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-3px);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 2rem;
          border: 2px solid #06B6D4;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: transparent;
          color: #06B6D4;
        }

        .btn-outline:hover {
          background: #06B6D4;
          color: white;
          transform: translateY(-3px);
        }

        .btn-large {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
        }

        .btn-icon {
          transition: transform 0.3s;
        }

        .btn-primary:hover .btn-icon,
        .btn-outline:hover .btn-icon {
          transform: translateX(5px);
        }

        .hero-trust {
          display: flex;
          gap: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
          color: #94A3B8;
        }

        .trust-item svg {
          color: #06B6D4;
        }

        .hero-features {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          flex-wrap: wrap;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .hero-feature-icon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 8px;
          color: #06B6D4;
        }

        .hero-feature div {
          display: flex;
          flex-direction: column;
        }

        .hero-feature strong {
          font-size: 0.9rem;
          color: #F8FAFC;
        }

        .hero-feature span {
          font-size: 0.8rem;
          color: #94A3B8;
        }

        .hero-illustration {
          position: relative;
          z-index: 2;
          flex: 1;
          min-height: 400px;
        }

        .floating-card {
          position: absolute;
          background: #1E293B;
          backdrop-filter: blur(10px);
          padding: 1rem 1.5rem;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: floatCard 6s ease-in-out infinite;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .floating-card .float-icon {
          font-size: 1.5rem;
          color: #06B6D4;
        }

        .floating-card span {
          font-weight: 600;
          color: #F8FAFC;
        }

        .card-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .card-2 {
          top: 50%;
          right: 10%;
          animation-delay: 2s;
        }

        .card-3 {
          bottom: 10%;
          left: 30%;
          animation-delay: 4s;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .hero-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.03);
          animation: pulseCircle 8s ease-in-out infinite;
          border: 1px solid rgba(6, 182, 212, 0.05);
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          right: 20%;
        }

        .circle-2 {
          width: 200px;
          height: 200px;
          bottom: 10%;
          right: 40%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 150px;
          height: 150px;
          top: 30%;
          right: 50%;
          animation-delay: 4s;
        }

        @keyframes pulseCircle {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }

        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #64748B;
        }

        /* Roles Section */
        .roles-section {
          padding: 4rem 6rem;
          background: #F8FAFC;
          width: 100%;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .role-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
          text-align: center;
          border: 1px solid #E2E8F0;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #06B6D4, #0891B2);
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .role-card:hover::before,
        .role-card.active::before {
          transform: scaleX(1);
        }

        .role-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border-color: #06B6D4;
        }

        .role-card.active {
          border-color: #06B6D4;
          box-shadow: 0 10px 40px rgba(6, 182, 212, 0.08);
        }

        .role-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.1);
          color: #06B6D4;
          font-size: 1.8rem;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .role-card:hover .role-icon-wrapper {
          transform: scale(1.1);
          background: rgba(6, 182, 212, 0.15);
        }

        .role-card h3 {
          color: #0F172A;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .role-card p {
          color: #64748B;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .role-meta {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .role-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.8rem;
          background: #F1F5F9;
          color: #0F172A;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tag-icon {
          font-size: 0.7rem;
        }

        .role-difficulty {
          display: inline-flex;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .role-difficulty.advanced {
          background: #FEE2E2;
          color: #DC2626;
        }

        .role-difficulty.intermediate {
          background: #FEF3C7;
          color: #D97706;
        }

        .role-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.5rem;
          background: #0F172A;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .role-button:hover {
          background: #06B6D4;
          transform: translateY(-2px);
        }

        .role-arrow {
          transition: transform 0.3s;
        }

        .role-button:hover .role-arrow {
          transform: translateX(3px);
        }

        /* Features Section */
        .features {
          padding: 4rem 6rem;
          background: white;
          width: 100%;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: #F8FAFC;
          padding: 2.5rem;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border-color: #06B6D4;
        }

        .feature-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: rgba(6, 182, 212, 0.1);
          color: #06B6D4;
          font-size: 1.8rem;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .feature-card:hover .feature-icon-wrapper {
          transform: scale(1.1);
        }

        .feature-card h3 {
          color: #0F172A;
          font-size: 1.3rem;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: #64748B;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .feature-stats {
          margin-bottom: 1rem;
        }

        .feature-stat {
          display: inline-block;
          padding: 0.2rem 0.8rem;
          background: rgba(6, 182, 212, 0.1);
          color: #06B6D4;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .feature-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #06B6D4;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .feature-link:hover {
          gap: 0.75rem;
        }

        .feature-arrow {
          transition: transform 0.3s;
        }

        .feature-link:hover .feature-arrow {
          transform: translateX(5px);
        }

        /* Stats Section */
        .stats {
          padding: 4rem 6rem;
          background: #0F172A;
          width: 100%;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 3rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .stat-item {
          text-align: center;
          color: white;
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #06B6D4;
        }

        .stat-value {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: #F8FAFC;
          transform: scale(0.5);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stat-value.animate {
          transform: scale(1);
          opacity: 1;
        }

        .stat-label {
          font-size: 1rem;
          color: #94A3B8;
        }

        /* Testimonials Section */
        .testimonials {
          padding: 4rem 6rem;
          background: #F8FAFC;
          width: 100%;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border-color: #06B6D4;
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .testimonial-header img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }

        .testimonial-author h4 {
          color: #0F172A;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }

        .testimonial-author p {
          color: #64748B;
          font-size: 0.85rem;
        }

        .testimonial-text {
          color: #1E293B;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-style: italic;
        }

        .testimonial-rating {
          display: flex;
          gap: 0.25rem;
        }

        .testimonial-rating .star {
          color: #FBBF24;
        }

        /* CTA Section */
        .cta-section {
          padding: 4rem 6rem;
          background: #0F172A;
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          color: #F8FAFC;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.1rem;
          color: #94A3B8;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .cta-social {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          color: #94A3B8;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .social-link:hover {
          background: rgba(6, 182, 212, 0.1);
          color: #06B6D4;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero {
            flex-direction: column;
            padding: 3rem 2rem;
            text-align: center;
            min-height: auto;
            padding-top: 6rem;
          }

          .hero-content {
            max-width: 100%;
          }

          .hero h1 {
            font-size: 3rem;
          }

          .hero-description {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-trust {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero-features {
            justify-content: center;
          }

          .hero-illustration {
            min-height: 300px;
            width: 100%;
            margin-top: 2rem;
          }

          .floating-card {
            position: relative;
            display: inline-flex;
            margin: 0.5rem;
            animation: none;
          }

          .card-1, .card-2, .card-3 {
            position: relative;
            top: auto;
            left: auto;
            right: auto;
            bottom: auto;
          }

          .roles-section,
          .features,
          .testimonials,
          .stats,
          .cta-section {
            padding: 3rem 2rem;
          }

          .roles-grid,
          .features-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .stats-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .hero-circle {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero h1 {
            font-size: 2.2rem;
          }

          .hero {
            padding: 2rem 1rem;
            padding-top: 5rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-trust {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-primary,
          .btn-secondary,
          .btn-outline {
            width: 100%;
            justify-content: center;
          }

          .section-header h2 {
            font-size: 1.8rem;
          }

          .stat-value {
            font-size: 2.5rem;
          }

          .role-meta {
            flex-direction: column;
            align-items: center;
          }

          .hero-features {
            flex-direction: column;
            align-items: center;
          }

          .roles-section,
          .features,
          .testimonials,
          .stats,
          .cta-section {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;