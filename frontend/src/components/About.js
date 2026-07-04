// frontend/src/components/About.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMicrophone, 
  FaVideo, 
  FaChartLine, 
  FaBrain, 
  FaShieldAlt, 
  FaUsers, 
  FaCheckCircle,
  FaRocket,
  FaStar,
  FaClock,
  FaAward,
  FaLightbulb,
  FaRobot,
  FaHeadset,
  FaLock,
  FaMobile,
  FaDesktop,
  FaCloud,
  FaDatabase,
  FaCode,
  FaPalette,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarker,
  FaArrowRight,
  FaPlay,
  FaServer,
  FaGlobe,
  FaHeart,
  FaGraduationCap,
  FaTrophy,
  FaMedal,
  FaHandshake,
  FaBuilding,
  FaRocket as FaLaunch,
  FaComments
} from 'react-icons/fa';

function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaMicrophone />,
      title: 'Speech Analysis',
      description: 'Advanced AI-powered speech recognition that analyzes your answers in real-time, providing instant feedback on clarity, tone, and content quality.',
      color: '#06B6D4'
    },
    {
      icon: <FaVideo />,
      title: 'Camera & Eye Contact Tracking',
      description: 'State-of-the-art computer vision technology tracks your eye contact, facial expressions, and body language to help you improve your non-verbal communication.',
      color: '#0891B2'
    },
    {
      icon: <FaChartLine />,
      title: 'Detailed Performance Reports',
      description: 'Comprehensive analytics and insights after each interview session, including scores, improvement areas, and personalized recommendations.',
      color: '#22C55E'
    },
    {
      icon: <FaBrain />,
      title: 'AI-Powered Feedback',
      description: 'Intelligent feedback system that evaluates your answers against industry standards and provides actionable suggestions for improvement.',
      color: '#8B5CF6'
    },
    {
      icon: <FaDatabase />,
      title: 'Role-Specific Questions',
      description: 'Tailored question banks for various roles including Data Science, Software Engineering, Product Management, Marketing, and more.',
      color: '#F59E0B'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Privacy & Security',
      description: 'Your data is encrypted and protected. We never share your personal information or interview recordings with third parties.',
      color: '#EF4444'
    }
  ];

  const stats = [
    { value: '10+', label: 'Interview Roles', icon: <FaBuilding /> },
    { value: '100+', label: 'Practice Questions', icon: <FaBrain /> },
    { value: '95%', label: 'User Satisfaction', icon: <FaStar /> },
    { value: '50K+', label: 'Interviews Conducted', icon: <FaUsers /> }
  ];

  const techStack = [
    { name: 'React.js', icon: <FaCode />, color: '#61DAFB' },
    { name: 'Node.js', icon: <FaServer />, color: '#68A063' },
    { name: 'Python', icon: <FaCode />, color: '#3776AB' },
    { name: 'Machine Learning', icon: <FaBrain />, color: '#FF6F00' },
    { name: 'Computer Vision', icon: <FaVideo />, color: '#2196F3' },
    { name: 'Cloud Services', icon: <FaCloud />, color: '#FF9900' }
  ];

  const team = [
    {
      name: 'AI Interview Team',
      role: 'Core Development',
      image: 'https://ui-avatars.com/api/?name=AI+Team&background=06B6D4&color=fff&size=100',
      description: 'Passionate team of developers, data scientists, and UX designers'
    }
  ];

  const timeline = [
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'AI Interview platform launched with core features',
      icon: <FaLaunch />
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Integrated advanced AI models for speech and emotion analysis',
      icon: <FaRobot />
    },
    {
      year: '2025',
      title: 'Role Expansion',
      description: 'Added 10+ interview roles with 100+ practice questions',
      icon: <FaDatabase />
    },
    {
      year: '2025',
      title: 'Global Reach',
      description: 'Reached 50,000+ interviews conducted worldwide',
      icon: <FaGlobe />
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <FaRocket className="badge-icon" />
            <span>About AI Interview</span>
          </div>
          <h1>
            Revolutionizing Interview<br />
            <span className="gradient-text">Preparation with AI</span>
          </h1>
          <p className="about-hero-description">
            We're on a mission to help candidates ace their interviews through AI-powered 
            practice, real-time feedback, and personalized coaching.
          </p>
          <div className="about-hero-actions">
            <button onClick={() => navigate('/register')} className="btn-primary btn-large">
              Get Started
              <FaArrowRight className="btn-icon" />
            </button>
            <button onClick={() => navigate('/device-check')} className="btn-secondary btn-large">
              <FaPlay className="btn-icon" />
              Try Demo
            </button>
          </div>
        </div>
        <div className="about-hero-illustration">
          <div className="floating-card card-1">
            <FaRobot className="float-icon" />
            <span>AI Powered</span>
          </div>
          <div className="floating-card card-2">
            <FaVideo className="float-icon" />
            <span>Real-time Feedback</span>
          </div>
          <div className="floating-card card-3">
            <FaChartLine className="float-icon" />
            <span>Detailed Analytics</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              To democratize interview preparation by providing everyone with access to 
              AI-powered coaching that was previously only available to a select few.
            </p>
            <div className="mission-values">
              <div className="value-item">
                <FaHeart className="value-icon" />
                <h4>Accessibility</h4>
                <p>Free practice for everyone</p>
              </div>
              <div className="value-item">
                <FaGraduationCap className="value-icon" />
                <h4>Learning</h4>
                <p>Continuous improvement</p>
              </div>
              <div className="value-item">
                <FaHandshake className="value-icon" />
                <h4>Trust</h4>
                <p>Privacy first approach</p>
              </div>
            </div>
          </div>
          <div className="mission-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon-large">{stat.icon}</div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Powerful Features for Interview Success</h2>
          <p>Everything you need to prepare, practice, and perfect your interview skills</p>
        </div>
        <div className="features-grid-about">
          {features.map((feature, index) => (
            <div key={index} className="feature-card-about" style={{ borderTopColor: feature.color }}>
              <div className="feature-icon-about" style={{ backgroundColor: `${feature.color}20`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-tag" style={{ backgroundColor: `${feature.color}20`, color: feature.color }}>
                Learn More
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <div className="section-header">
          <h2>Built with Cutting-Edge Technology</h2>
          <p>Leveraging the latest AI and machine learning technologies</p>
        </div>
        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="tech-item" style={{ borderColor: tech.color }}>
              <div className="tech-icon" style={{ color: tech.color }}>
                {tech.icon}
              </div>
              <h4>{tech.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="section-header">
          <h2>Our Journey</h2>
          <p>How we've evolved to help you succeed</p>
        </div>
        <div className="timeline">
          {timeline.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-icon">{item.icon}</div>
              <div className="timeline-content">
                <span className="timeline-year">{item.year}</span>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <div className="section-header">
          <h2>Why Choose AI Interview?</h2>
          <p>What sets us apart from traditional interview preparation</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <FaRobot className="why-icon" />
            <h3>AI-Powered Coaching</h3>
            <p>Get instant, personalized feedback on every answer</p>
          </div>
          <div className="why-card">
            <FaClock className="why-icon" />
            <h3>Practice Anytime, Anywhere</h3>
            <p>24/7 access to practice sessions and feedback</p>
          </div>
          <div className="why-card">
            <FaChartLine className="why-icon" />
            <h3>Track Your Progress</h3>
            <p>Monitor improvement with detailed analytics</p>
          </div>
          <div className="why-card">
            <FaUsers className="why-icon" />
            <h3>Community Driven</h3>
            <p>Learn from thousands of successful candidates</p>
          </div>
          <div className="why-card">
            <FaLock className="why-icon" />
            <h3>Privacy First</h3>
            <p>Your data is secure and never shared</p>
          </div>
          <div className="why-card">
            <FaTrophy className="why-icon" />
            <h3>Proven Results</h3>
            <p>95% of users report improved interview performance</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-about">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Real stories from successful candidates</p>
        </div>
        <div className="testimonials-grid-about">
          <div className="testimonial-card-about">
            <div className="testimonial-avatar">
              <img src="https://ui-avatars.com/api/?name=Sarah+J&background=06B6D4&color=fff&size=80" alt="Sarah" />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text-about">
                "This platform helped me land my dream job at Google. The AI feedback was incredibly accurate and helpful."
              </p>
              <div className="testimonial-author-about">
                <h4>Sarah Johnson</h4>
                <span>Software Engineer at Google</span>
                <div className="testimonial-stars">
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card-about">
            <div className="testimonial-avatar">
              <img src="https://ui-avatars.com/api/?name=Michael+C&background=0F172A&color=fff&size=80" alt="Michael" />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text-about">
                "The mock interviews felt so real. I was able to practice and improve my answers until I was fully prepared."
              </p>
              <div className="testimonial-author-about">
                <h4>Michael Chen</h4>
                <span>Data Scientist at Amazon</span>
                <div className="testimonial-stars">
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card-about">
            <div className="testimonial-avatar">
              <img src="https://ui-avatars.com/api/?name=Emily+R&background=06B6D4&color=fff&size=80" alt="Emily" />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-text-about">
                "The detailed reports and speech analysis gave me the confidence I needed to ace my interviews."
              </p>
              <div className="testimonial-author-about">
                <h4>Emily Rodriguez</h4>
                <span>Product Manager at Microsoft</span>
                <div className="testimonial-stars">
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                  <FaStar className="star" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-about">
        <div className="cta-content-about">
          <h2>Ready to Ace Your Interview?</h2>
          <p>Join thousands of successful candidates who landed their dream jobs</p>
          <div className="cta-buttons-about">
            <button onClick={() => navigate('/register')} className="btn-primary btn-large">
              Get Started Now
              <FaArrowRight className="btn-icon" />
            </button>
            <button onClick={() => navigate('/device-check')} className="btn-outline btn-large">
              <FaPlay className="btn-icon" />
              Try Free Demo
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-container {
          min-height: 100vh;
          background: #F8FAFC;
          overflow-x: hidden;
        }

        /* Hero Section */
        .about-hero {
          position: relative;
          padding: 6rem 6rem 4rem;
          min-height: 80vh;
          background: #0F172A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        }

        .about-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .about-hero-content {
          position: relative;
          z-index: 2;
          flex: 1;
          max-width: 600px;
          color: white;
        }

        .about-hero-badge {
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

        .about-hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #F8FAFC;
        }

        .gradient-text {
          background: linear-gradient(135deg, #06B6D4, #0891B2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-hero-description {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
          color: #94A3B8;
        }

        .about-hero-actions {
          display: flex;
          gap: 1rem;
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

        .about-hero-illustration {
          position: relative;
          z-index: 2;
          flex: 1;
          min-height: 300px;
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

        /* Mission Section */
        .mission-section {
          padding: 4rem 6rem;
          background: white;
        }

        .mission-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .mission-text h2 {
          font-size: 2.5rem;
          color: #0F172A;
          margin-bottom: 1rem;
        }

        .mission-text p {
          font-size: 1.1rem;
          color: #64748B;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .mission-values {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .value-item {
          text-align: center;
          padding: 1rem;
          background: #F8FAFC;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .value-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .value-icon {
          font-size: 2rem;
          color: #06B6D4;
          margin-bottom: 0.5rem;
        }

        .value-item h4 {
          color: #0F172A;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .value-item p {
          font-size: 0.85rem;
          color: #94A3B8;
        }

        .mission-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .stat-card {
          background: #F8FAFC;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          border: 1px solid #E2E8F0;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-color: #06B6D4;
        }

        .stat-icon-large {
          font-size: 2.5rem;
          color: #06B6D4;
          margin-bottom: 0.5rem;
        }

        .stat-card h3 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 0.25rem;
        }

        .stat-card p {
          color: #64748B;
          font-size: 0.9rem;
        }

        /* Features Section */
        .features-section {
          padding: 4rem 6rem;
          background: #F8FAFC;
        }

        .features-grid-about {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card-about {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          border-top: 4px solid;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .feature-card-about:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .feature-icon-about {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .feature-card-about h3 {
          color: #0F172A;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .feature-card-about p {
          color: #64748B;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .feature-tag {
          display: inline-block;
          padding: 0.25rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .feature-tag:hover {
          transform: scale(1.05);
        }

        /* Tech Section */
        .tech-section {
          padding: 4rem 6rem;
          background: white;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .tech-item {
          background: #F8FAFC;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          border: 2px solid;
          transition: all 0.3s;
        }

        .tech-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .tech-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .tech-item h4 {
          color: #0F172A;
          font-size: 1rem;
        }

        /* Timeline Section */
        .timeline-section {
          padding: 4rem 6rem;
          background: #F8FAFC;
        }

        .timeline {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: #E2E8F0;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
        }

        .timeline-item:nth-child(odd) {
          flex-direction: row;
        }

        .timeline-item:nth-child(even) {
          flex-direction: row-reverse;
        }

        .timeline-icon {
          width: 50px;
          height: 50px;
          background: #06B6D4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          z-index: 2;
          flex-shrink: 0;
        }

        .timeline-content {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          margin: 0 2rem;
          flex: 1;
        }

        .timeline-content .timeline-year {
          display: inline-block;
          background: rgba(6, 182, 212, 0.1);
          color: #06B6D4;
          padding: 0.2rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .timeline-content h4 {
          color: #0F172A;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .timeline-content p {
          color: #64748B;
          font-size: 0.9rem;
        }

        /* Why Choose Us */
        .why-section {
          padding: 4rem 6rem;
          background: white;
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .why-card {
          background: #F8FAFC;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s;
          border: 1px solid #E2E8F0;
        }

        .why-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-color: #06B6D4;
        }

        .why-icon {
          font-size: 2.5rem;
          color: #06B6D4;
          margin-bottom: 1rem;
        }

        .why-card h3 {
          color: #0F172A;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .why-card p {
          color: #64748B;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Testimonials */
        .testimonials-about {
          padding: 4rem 6rem;
          background: #F8FAFC;
        }

        .testimonials-grid-about {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .testimonial-card-about {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          display: flex;
          gap: 1.5rem;
          border: 1px solid #E2E8F0;
          transition: all 0.3s;
        }

        .testimonial-card-about:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-color: #06B6D4;
        }

        .testimonial-avatar img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }

        .testimonial-content {
          flex: 1;
        }

        .testimonial-text-about {
          color: #1E293B;
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .testimonial-author-about h4 {
          color: #0F172A;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }

        .testimonial-author-about span {
          color: #64748B;
          font-size: 0.85rem;
        }

        .testimonial-stars {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }

        .testimonial-stars .star {
          color: #FBBF24;
        }

        /* CTA Section */
        .cta-section-about {
          padding: 4rem 6rem;
          background: #0F172A;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cta-content-about {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .cta-content-about h2 {
          font-size: 2.5rem;
          color: #F8FAFC;
          margin-bottom: 1rem;
        }

        .cta-content-about p {
          font-size: 1.1rem;
          color: #94A3B8;
          margin-bottom: 2rem;
        }

        .cta-buttons-about {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .about-hero {
            flex-direction: column;
            padding: 4rem 2rem;
            text-align: center;
            min-height: auto;
          }

          .about-hero-content {
            max-width: 100%;
          }

          .about-hero h1 {
            font-size: 2.5rem;
          }

          .about-hero-actions {
            justify-content: center;
          }

          .about-hero-illustration {
            min-height: 200px;
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

          .mission-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .mission-values {
            grid-template-columns: repeat(3, 1fr);
          }

          .features-section,
          .tech-section,
          .timeline-section,
          .why-section,
          .testimonials-about,
          .cta-section-about {
            padding: 3rem 2rem;
          }

          .features-grid-about,
          .testimonials-grid-about {
            grid-template-columns: 1fr;
          }

          .timeline::before {
            display: none;
          }

          .timeline-item {
            flex-direction: column !important;
            align-items: flex-start;
          }

          .timeline-content {
            margin: 0.5rem 0;
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .about-hero h1 {
            font-size: 2rem;
          }

          .about-hero {
            padding: 3rem 1rem;
          }

          .about-hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn-primary,
          .btn-secondary,
          .btn-outline {
            width: 100%;
            justify-content: center;
          }

          .mission-values {
            grid-template-columns: 1fr;
          }

          .mission-stats {
            grid-template-columns: 1fr;
          }

          .section-header h2 {
            font-size: 2rem;
          }

          .cta-buttons-about {
            flex-direction: column;
            align-items: center;
          }

          .testimonial-card-about {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .testimonial-stars {
            justify-content: center;
          }

          .features-section,
          .tech-section,
          .timeline-section,
          .why-section,
          .testimonials-about,
          .cta-section-about {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default About;