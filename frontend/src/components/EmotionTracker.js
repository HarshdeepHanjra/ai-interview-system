// frontend/src/components/EmotionTracker.js
import React, { useState, useEffect, useRef } from 'react';
import { FaSmile, FaFrown, FaMeh, FaAngry, FaSurprise, FaTired, FaChartLine } from 'react-icons/fa';

function EmotionTracker({ isActive, onEmotionUpdate }) {
  const [currentEmotion, setCurrentEmotion] = useState('Neutral');
  const [confidence, setConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [emotionStats, setEmotionStats] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startEmotionTracking();
      fetchEmotionStats();
    } else {
      stopEmotionTracking();
    }
    
    return () => {
      stopEmotionTracking();
    };
  }, [isActive]);

  const startEmotionTracking = () => {
    // Track emotion every 2 seconds
    intervalRef.current = setInterval(() => {
      captureAndDetectEmotion();
    }, 2000);
  };

  const stopEmotionTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureAndDetectEmotion = async () => {
    // Get the main webcam element
    const webcamElement = document.querySelector('video');
    if (webcamElement && webcamElement.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = webcamElement.videoWidth;
      canvas.height = webcamElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      
      try {
        const response = await fetch('http://localhost:5000/api/detect-emotion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        const data = await response.json();
        
        setCurrentEmotion(data.emotion);
        setConfidence(data.confidence);
        
        // Update history
        setEmotionHistory(prev => {
          const newHistory = [...prev, { emotion: data.emotion, confidence: data.confidence, time: new Date() }];
          return newHistory.slice(-20); // Keep last 20
        });
        
        if (onEmotionUpdate) {
          onEmotionUpdate(data);
        }
      } catch (error) {
        console.error('Emotion detection error:', error);
      }
    }
  };

  const fetchEmotionStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emotion-analysis');
      const data = await response.json();
      setEmotionStats(data);
    } catch (error) {
      console.error('Error fetching emotion stats:', error);
    }
  };

  const getEmotionIcon = (emotion) => {
    switch(emotion.toLowerCase()) {
      case 'happy': return <FaSmile className="emotion-icon happy" />;
      case 'sad': return <FaFrown className="emotion-icon sad" />;
      case 'angry': return <FaAngry className="emotion-icon angry" />;
      case 'surprised': return <FaSurprise className="emotion-icon surprised" />;
      case 'fearful': return <FaTired className="emotion-icon fearful" />;
      case 'disgusted': return <FaFrown className="emotion-icon disgusted" />;
      default: return <FaMeh className="emotion-icon neutral" />;
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf > 70) return '#2ecc71';
    if (conf > 40) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="emotion-tracker">
      <div className="emotion-main" onClick={() => setShowDetails(!showDetails)}>
        <div className="emotion-icon-large">
          {getEmotionIcon(currentEmotion)}
        </div>
        <div className="emotion-info">
          <div className="current-emotion">{currentEmotion}</div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${confidence}%`, backgroundColor: getConfidenceColor(confidence) }}
            />
          </div>
          <div className="confidence-text">{Math.round(confidence)}% confidence</div>
        </div>
        <FaChartLine className="expand-icon" />
      </div>

      {showDetails && emotionStats && (
        <div className="emotion-details">
          <h4>Session Emotion Analysis</h4>
          
          <div className="emotion-stats">
            <div className="stat-item">
              <span>Overall Emotion:</span>
              <strong className={`emotion-${emotionStats.overall_emotion?.toLowerCase()}`}>
                {emotionStats.overall_emotion}
              </strong>
            </div>
            <div className="stat-item">
              <span>Avg Confidence:</span>
              <strong>{emotionStats.average_confidence}%</strong>
            </div>
            <div className="stat-item">
              <span>Status:</span>
              <strong className="status-text">{emotionStats.status}</strong>
            </div>
          </div>

          <div className="emotion-ratios">
            <div className="ratio-bar">
              <div className="ratio-label">Positive</div>
              <div className="ratio-bar-bg">
                <div className="ratio-fill positive" style={{ width: `${emotionStats.positive_ratio}%` }} />
              </div>
              <div className="ratio-value">{emotionStats.positive_ratio}%</div>
            </div>
            <div className="ratio-bar">
              <div className="ratio-label">Neutral</div>
              <div className="ratio-bar-bg">
                <div className="ratio-fill neutral" style={{ width: `${emotionStats.neutral_ratio}%` }} />
              </div>
              <div className="ratio-value">{emotionStats.neutral_ratio}%</div>
            </div>
            <div className="ratio-bar">
              <div className="ratio-label">Negative</div>
              <div className="ratio-bar-bg">
                <div className="ratio-fill negative" style={{ width: `${emotionStats.negative_ratio}%` }} />
              </div>
              <div className="ratio-value">{emotionStats.negative_ratio}%</div>
            </div>
          </div>

          {emotionStats.emotion_distribution && (
            <div className="emotion-distribution">
              <h5>Emotion Distribution</h5>
              <div className="distribution-bars">
                {Object.entries(emotionStats.emotion_distribution).map(([emotion, count]) => (
                  <div key={emotion} className="dist-item">
                    <span>{emotion}</span>
                    <div className="dist-bar-bg">
                      <div 
                        className="dist-fill" 
                        style={{ width: `${(count / emotionStats.total_frames) * 100}%` }}
                      />
                    </div>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="emotion-tips">
            <h5>💡 Tips to Improve:</h5>
            <ul>
              {emotionStats.negative_ratio > 30 && (
                <li>Practice relaxation techniques before interviews to reduce stress</li>
              )}
              {emotionStats.positive_ratio < 20 && (
                <li>Try to maintain a positive and confident demeanor</li>
              )}
              {emotionStats.average_confidence < 60 && (
                <li>Practice more to build confidence in your answers</li>
              )}
              {emotionStats.overall_emotion === 'Fearful' && (
                <li>Take deep breaths and remember your preparation</li>
              )}
              <li>Maintain good eye contact with the camera</li>
              <li>Smile naturally to project confidence</li>
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .emotion-tracker {
          background: white;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .emotion-tracker:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .emotion-main {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .emotion-icon-large {
          font-size: 2rem;
        }
        
        .emotion-icon.happy { color: #f1c40f; }
        .emotion-icon.sad { color: #3498db; }
        .emotion-icon.angry { color: #e74c3c; }
        .emotion-icon.surprised { color: #e67e22; }
        .emotion-icon.fearful { color: #9b59b6; }
        .emotion-icon.neutral { color: #95a5a6; }
        
        .emotion-info {
          flex: 1;
        }
        
        .current-emotion {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        
        .confidence-bar {
          height: 6px;
          background: #ecf0f1;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        
        .confidence-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s;
        }
        
        .confidence-text {
          font-size: 0.75rem;
          color: #7f8c8d;
        }
        
        .expand-icon {
          color: #95a5a6;
          font-size: 0.9rem;
        }
        
        .emotion-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ecf0f1;
        }
        
        .emotion-details h4 {
          margin-bottom: 10px;
          color: #2c3e50;
        }
        
        .emotion-stats {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }
        
        .stat-item:last-child {
          margin-bottom: 0;
        }
        
        .emotion-happy { color: #f1c40f; }
        .emotion-sad { color: #3498db; }
        .emotion-angry { color: #e74c3c; }
        .emotion-neutral { color: #95a5a6; }
        
        .status-text {
          color: #667eea;
        }
        
        .emotion-ratios {
          margin-bottom: 15px;
        }
        
        .ratio-bar {
          margin-bottom: 10px;
        }
        
        .ratio-label {
          font-size: 0.75rem;
          margin-bottom: 3px;
          color: #7f8c8d;
        }
        
        .ratio-bar-bg {
          height: 8px;
          background: #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 3px;
        }
        
        .ratio-fill {
          height: 100%;
          border-radius: 4px;
        }
        
        .ratio-fill.positive { background: #2ecc71; }
        .ratio-fill.neutral { background: #95a5a6; }
        .ratio-fill.negative { background: #e74c3c; }
        
        .ratio-value {
          font-size: 0.7rem;
          text-align: right;
          color: #7f8c8d;
        }
        
        .emotion-distribution {
          margin-bottom: 15px;
        }
        
        .emotion-distribution h5 {
          font-size: 0.85rem;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .dist-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
          font-size: 0.8rem;
        }
        
        .dist-bar-bg {
          flex: 1;
          height: 6px;
          background: #ecf0f1;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .dist-fill {
          height: 100%;
          background: #667eea;
          border-radius: 3px;
        }
        
        .emotion-tips {
          background: #e8f4f8;
          padding: 10px;
          border-radius: 8px;
        }
        
        .emotion-tips h5 {
          font-size: 0.85rem;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .emotion-tips ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .emotion-tips li {
          font-size: 0.8rem;
          margin-bottom: 4px;
          color: #555;
        }
      `}</style>
    </div>
  );
}

export default EmotionTracker;