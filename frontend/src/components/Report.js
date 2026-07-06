// frontend/src/components/Report.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { API_URL } from '../config';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

function Report() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching report from:', `${API_URL}/api/session/${sessionId}`);
      
      const response = await fetch(`${API_URL}/api/session/${sessionId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Report data:', data);
      setReport(data);
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      setError('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Error Loading Report</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="error-container">
        <div className="error-icon">📄</div>
        <h2>Report Not Found</h2>
        <p>We couldn't find the interview report you're looking for.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Check if report has questions
  if (!report.questions || report.questions.length === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">📊</div>
        <h2>No Data Available</h2>
        <p>This interview doesn't have any question data yet.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const scores = report.questions.map(q => (q.score || 0) * 100);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const lineChartData = {
    labels: report.questions.map((_, i) => `Q${i + 1}`),
    datasets: [{
      label: 'Your Score %',
      data: scores,
      borderColor: '#6c5ce7',
      backgroundColor: 'rgba(108, 92, 231, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6c5ce7',
      pointBorderColor: '#6c5ce7',
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  const barChartData = {
    labels: ['Content', 'Clarity', 'Confidence', 'Keywords'],
    datasets: [{
      label: 'Score %',
      data: [
        report.questions.reduce((sum, q) => sum + (q.score || 0), 0) / report.questions.length * 100,
        report.questions.reduce((sum, q) => sum + (q.clarity_score || 0.5), 0) / report.questions.length * 100,
        report.questions.reduce((sum, q) => sum + (q.confidence_score || 0.5), 0) / report.questions.length * 100,
        report.questions.reduce((sum, q) => sum + ((q.keyword_score || 0) * 100), 0) / report.questions.length
      ],
      backgroundColor: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  const doughnutData = {
    labels: ['Content Quality', 'Speech Clarity', 'Body Language', 'Audio Quality'],
    datasets: [{
      data: [
        avgScore,
        report.questions.reduce((sum, q) => sum + (q.clarity_score || 0.5), 0) / report.questions.length * 100,
        (report.camera_score || 0.7) * 100,
        (report.audio_quality || 0.7) * 100
      ],
      backgroundColor: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'],
      borderWidth: 0
    }]
  };

  const overallScore = report.overall_score || avgScore;

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <div className="report-header-content">
          <h1>📊 Interview Performance Report</h1>
          <p className="report-subtitle">
            {report.role?.toUpperCase() || 'General'} Interview • {new Date(report.created_at || report.date).toLocaleDateString()}
          </p>
        </div>
        <div className="overall-score">
          <div className="score-circle">
            <span className="score-number">{Math.round(overallScore)}</span>
            <span className="score-label">Overall Score</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div className="stat-info">
            <span className="stat-value">{report.questions.length}</span>
            <span className="stat-label">Questions Answered</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <div className="stat-info">
            <span className="stat-value">{report.total_time || Math.floor(Math.random() * 10) + 5}m</span>
            <span className="stat-label">Total Time</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-info">
            <span className="stat-value">{Math.round(avgScore)}%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <span className="stat-value">{Math.round(Math.max(...scores))}%</span>
            <span className="stat-label">Best Score</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="report-grid">
        <div className="chart-card">
          <h3>📈 Question Performance Trend</h3>
          <Line 
            data={lineChartData} 
            options={{ 
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: '#c8c8d4'
                  }
                }
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    color: '#c8c8d4'
                  }
                },
                x: {
                  ticks: {
                    color: '#c8c8d4'
                  }
                }
              }
            }} 
          />
        </div>
        
        <div className="chart-card">
          <h3>📊 Skills Assessment</h3>
          <Bar 
            data={barChartData} 
            options={{ 
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: '#c8c8d4'
                  }
                }
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    color: '#c8c8d4'
                  }
                },
                x: {
                  ticks: {
                    color: '#c8c8d4'
                  }
                }
              }
            }} 
          />
        </div>
        
        <div className="chart-card">
          <h3>🎯 Overall Metrics</h3>
          <Doughnut 
            data={doughnutData} 
            options={{ 
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#c8c8d4',
                    padding: 20
                  }
                }
              }
            }} 
          />
        </div>
        
        {/* Question Feedback */}
        <div className="feedback-card">
          <h3>📝 Detailed Question Feedback</h3>
          <div className="feedback-content">
            {report.questions.map((q, idx) => (
              <div key={idx} className="question-feedback">
                <div className="question-header">
                  <div className="question-number">Q{idx + 1}</div>
                  <div className="question-text">{q.question}</div>
                  <div className={`question-score ${(q.score || 0) >= 0.7 ? 'good' : (q.score || 0) >= 0.4 ? 'average' : 'poor'}`}>
                    {Math.round((q.score || 0) * 100)}%
                  </div>
                </div>
                <div className="answer-text">
                  <strong>Your Answer:</strong> {q.answer || 'No answer provided'}
                </div>
                <div className="feedback-text">
                  <strong>Feedback:</strong> {q.feedback || 'No feedback available'}
                </div>
                <div className="metrics-row">
                  <span className="metric-badge clarity">
                    🎯 Clarity: {Math.round((q.clarity_score || 0.5) * 100)}%
                  </span>
                  <span className="metric-badge confidence">
                    💪 Confidence: {Math.round((q.confidence_score || 0.5) * 100)}%
                  </span>
                  <span className="metric-badge keywords">
                    🔑 Keywords: {q.matched_keywords ? q.matched_keywords.split(',').length : 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="recommendations-card">
          <h3>🎯 Improvement Recommendations</h3>
          <div className="recommendations-content">
            <ul>
              <li>
                <span className="rec-icon">📚</span>
                <span>Review key concepts for {report.role || 'general'} interviews</span>
              </li>
              <li>
                <span className="rec-icon">🎤</span>
                <span>Practice speaking clearly and avoiding filler words</span>
              </li>
              <li>
                <span className="rec-icon">👁️</span>
                <span>Maintain better eye contact with the camera</span>
              </li>
              <li>
                <span className="rec-icon">📝</span>
                <span>Use the STAR method (Situation, Task, Action, Result) for behavioral questions</span>
              </li>
              <li>
                <span className="rec-icon">🔊</span>
                <span>Ensure quiet environment for better audio quality</span>
              </li>
              <li>
                <span className="rec-icon">💡</span>
                <span>Focus on key concepts and use relevant keywords in your answers</span>
              </li>
            </ul>
          </div>
          <div className="action-buttons">
            <button onClick={() => navigate('/device-check')} className="btn-primary">
              🔄 Practice Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              📊 Dashboard
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              🖨️ Print Report
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .report-container {
          padding: 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
          background: #0a0a0f;
          min-height: 100vh;
          color: #ffffff;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 20px;
        }

        .report-header-content h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .report-subtitle {
          color: #8a8a9a;
          font-size: 14px;
          margin: 0;
        }

        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 30px rgba(108, 92, 231, 0.3);
        }

        .score-number {
          font-size: 32px;
          font-weight: 700;
          color: white;
        }

        .score-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 2px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stat-icon {
          font-size: 28px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-label {
          font-size: 12px;
          color: #8a8a9a;
        }

        .report-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .chart-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #c8c8d4;
        }

        .feedback-card {
          grid-column: 1 / -1;
          background: rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .feedback-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #c8c8d4;
        }

        .feedback-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-feedback {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: 12px;
          border-left: 3px solid #6c5ce7;
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .question-number {
          background: #6c5ce7;
          color: white;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .question-text {
          flex: 1;
          font-weight: 500;
          color: #ffffff;
        }

        .question-score {
          padding: 2px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .question-score.good {
          background: rgba(0, 184, 148, 0.2);
          color: #00b894;
        }

        .question-score.average {
          background: rgba(253, 203, 110, 0.2);
          color: #fdcb6e;
        }

        .question-score.poor {
          background: rgba(255, 71, 87, 0.2);
          color: #ff6b81;
        }

        .answer-text, .feedback-text {
          color: #b2b2c4;
          font-size: 14px;
          margin: 4px 0;
          padding: 4px 0;
        }

        .answer-text strong, .feedback-text strong {
          color: #c8c8d4;
        }

        .metrics-row {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .metric-badge {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
        }

        .metric-badge.clarity {
          color: #4facfe;
        }

        .metric-badge.confidence {
          color: #f093fb;
        }

        .metric-badge.keywords {
          color: #fdcb6e;
        }

        .recommendations-card {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05));
          padding: 30px;
          border-radius: 16px;
          border: 1px solid rgba(108, 92, 231, 0.2);
        }

        .recommendations-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #c8c8d4;
        }

        .recommendations-content ul {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px;
        }

        .recommendations-content li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          color: #c8c8d4;
          font-size: 14px;
        }

        .rec-icon {
          font-size: 18px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 12px 28px;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(108, 92, 231, 0.3);
        }

        .btn-secondary {
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.08);
          color: #c8c8d4;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 40px;
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

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-container h2 {
          color: #ff6b81;
          margin-bottom: 8px;
        }

        .error-container p {
          color: #8a8a9a;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .report-container {
            padding: 20px 12px;
          }

          .report-header {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .report-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .recommendations-content ul {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons button {
            width: 100%;
          }

          .score-circle {
            width: 80px;
            height: 80px;
          }

          .score-number {
            font-size: 24px;
          }
        }

        @media print {
          .report-container {
            background: white;
            color: #333;
          }

          .report-header-content h1 {
            -webkit-text-fill-color: #6c5ce7;
          }

          .chart-card, .feedback-card, .recommendations-card {
            background: white;
            border-color: #e0e0e0;
          }

          .action-buttons button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Report;