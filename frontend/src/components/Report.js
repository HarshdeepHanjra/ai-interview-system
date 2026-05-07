import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

function Report() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading report...</div>;
  if (!report) return <div className="error">Report not found</div>;

  const scores = report.questions.map(q => q.score * 100);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const lineChartData = {
    labels: report.questions.map((_, i) => `Q${i + 1}`),
    datasets: [{
      label: 'Your Score %',
      data: scores,
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const barChartData = {
    labels: ['Content', 'Clarity', 'Confidence', 'Keywords'],
    datasets: [{
      label: 'Score %',
      data: [
        report.questions.reduce((sum, q) => sum + q.score, 0) / report.questions.length * 100,
        report.questions.reduce((sum, q) => sum + (q.clarity || 0.5), 0) / report.questions.length * 100,
        report.questions.reduce((sum, q) => sum + (q.confidence || 0.5), 0) / report.questions.length * 100,
        report.questions.reduce((sum, q) => sum + ((q.score || 0) * 0.8 + 0.2), 0) / report.questions.length * 100
      ],
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
    }]
  };

  const doughnutData = {
    labels: ['Content Quality', 'Speech Clarity', 'Body Language', 'Audio Quality'],
    datasets: [{
      data: [
        avgScore,
        (report.questions.reduce((sum, q) => sum + (q.clarity || 0.5), 0) / report.questions.length * 100),
        (report.camera_score || 0.7) * 100,
        (report.audio_quality || 0.7) * 100
      ],
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
    }]
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>📊 Interview Performance Report</h1>
        <p>{report.role?.toUpperCase()} Interview • {new Date(report.date).toLocaleDateString()}</p>
        <div className="overall-score">
          <div className="score-circle">
            <span className="score-number">{Math.round(report.overall_score)}</span>
            <span className="score-label">Overall Score</span>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="chart-card">
          <h3>Question Performance Trend</h3>
          <Line data={lineChartData} options={{ responsive: true }} />
        </div>
        
        <div className="chart-card">
          <h3>Skills Assessment</h3>
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>
        
        <div className="chart-card">
          <h3>Overall Metrics</h3>
          <Doughnut data={doughnutData} options={{ responsive: true }} />
        </div>
        
        <div className="feedback-card">
          <h3>📝 Detailed Question Feedback</h3>
          <div className="feedback-content">
            {report.questions.map((q, idx) => (
              <div key={idx} className="question-feedback">
                <div className="question-header">
                  <strong>Q{idx + 1}:</strong> {q.question}
                  <span className="question-score">Score: {Math.round(q.score * 100)}%</span>
                </div>
                <div className="answer-text">
                  <strong>Your Answer:</strong> {q.answer}
                </div>
                <div className="feedback-text">
                  <strong>Feedback:</strong> {q.feedback}
                </div>
                <div className="metrics-row">
                  <span>🎯 Clarity: {Math.round((q.clarity || 0.5) * 100)}%</span>
                  <span>💪 Confidence: {Math.round((q.confidence || 0.5) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="recommendations-card">
          <h3>🎯 Improvement Recommendations</h3>
          <ul>
            <li>📚 Review key concepts for {report.role} interviews</li>
            <li>🎤 Practice speaking clearly and avoiding filler words</li>
            <li>👁️ Maintain better eye contact with the camera</li>
            <li>📝 Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
            <li>🔊 Ensure quiet environment for better audio quality</li>
          </ul>
          <div className="action-buttons">
            <button onClick={() => navigate('/device-check')} className="btn-primary">
              Practice Again
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;