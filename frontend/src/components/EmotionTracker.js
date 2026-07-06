// frontend/src/components/EmotionTracker.js
import React, { useState, useEffect, useRef } from 'react';
import { FaSmile, FaFrown, FaMeh, FaAngry, FaSurprise, FaTired, FaChartLine } from 'react-icons/fa';
import './EmotionTracker.css'; // Import external CSS

function EmotionTracker({ isActive, onEmotionUpdate }) {
  const [currentEmotion, setCurrentEmotion] = useState('Neutral');
  const [confidence, setConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [emotionStats, setEmotionStats] = useState(null);
  const [error, setError] = useState(null);
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
    try {
      const webcamElement = document.querySelector('video');
      if (webcamElement && webcamElement.videoWidth > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = webcamElement.videoWidth;
        canvas.height = webcamElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        
        const response = await fetch('http://localhost:5000/api/detect-emotion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const emotion = data.emotion || 'Neutral';
        const conf = data.confidence || 0;
        
        setCurrentEmotion(emotion);
        setConfidence(conf);
        
        setEmotionHistory(prev => {
          const newHistory = [...prev, { emotion: emotion, confidence: conf, time: new Date() }];
          return newHistory.slice(-20);
        });
        
        if (onEmotionUpdate) {
          onEmotionUpdate(data);
        }
        setError(null);
      }
    } catch (error) {
      console.error('Emotion detection error:', error);
      setError('Failed to detect emotion');
    }
  };

  const fetchEmotionStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emotion-analysis');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmotionStats(data);
    } catch (error) {
      console.error('Error fetching emotion stats:', error);
    }
  };

  const getEmotionIcon = (emotion) => {
    if (!emotion) {
      return <FaMeh className="emotion-icon neutral" />;
    }

    let emotionStr = '';
    if (typeof emotion === 'string') {
      emotionStr = emotion;
    } else if (typeof emotion === 'object') {
      emotionStr = emotion.emotion || emotion.name || '';
    }

    if (!emotionStr || emotionStr.trim() === '') {
      return <FaMeh className="emotion-icon neutral" />;
    }

    const emotionLower = emotionStr.toLowerCase().trim();

    const iconMap = {
      'happy': <FaSmile className="emotion-icon happy" />,
      'joy': <FaSmile className="emotion-icon happy" />,
      'surprised': <FaSurprise className="emotion-icon surprised" />,
      'surprise': <FaSurprise className="emotion-icon surprised" />,
      'sad': <FaFrown className="emotion-icon sad" />,
      'sadness': <FaFrown className="emotion-icon sad" />,
      'angry': <FaAngry className="emotion-icon angry" />,
      'anger': <FaAngry className="emotion-icon angry" />,
      'fearful': <FaTired className="emotion-icon fearful" />,
      'fear': <FaTired className="emotion-icon fearful" />,
      'disgusted': <FaFrown className="emotion-icon disgusted" />,
      'disgust': <FaFrown className="emotion-icon disgusted" />,
      'neutral': <FaMeh className="emotion-icon neutral" />,
      'no face': <FaMeh className="emotion-icon neutral" />,
      'unknown': <FaMeh className="emotion-icon neutral" />
    };

    return iconMap[emotionLower] || <FaMeh className="emotion-icon neutral" />;
  };

  const getEmotionColor = (emotion) => {
    if (!emotion) return '#95a5a6';
    
    let emotionStr = '';
    if (typeof emotion === 'string') {
      emotionStr = emotion;
    } else if (typeof emotion === 'object') {
      emotionStr = emotion.emotion || emotion.name || '';
    }
    
    const emotionLower = emotionStr.toLowerCase().trim();
    
    const colorMap = {
      'happy': '#f1c40f',
      'joy': '#f1c40f',
      'surprised': '#e67e22',
      'surprise': '#e67e22',
      'sad': '#3498db',
      'sadness': '#3498db',
      'angry': '#e74c3c',
      'anger': '#e74c3c',
      'fearful': '#9b59b6',
      'fear': '#9b59b6',
      'disgusted': '#27ae60',
      'disgust': '#27ae60',
      'neutral': '#95a5a6'
    };
    
    return colorMap[emotionLower] || '#95a5a6';
  };

  const getConfidenceColor = (conf) => {
    if (conf > 70) return '#2ecc71';
    if (conf > 40) return '#f39c12';
    return '#e74c3c';
  };

  const getStatusColor = (status) => {
    if (!status) return '#95a5a6';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('excellent') || statusLower.includes('good')) return '#2ecc71';
    if (statusLower.includes('moderate')) return '#f39c12';
    if (statusLower.includes('improvement')) return '#e74c3c';
    return '#95a5a6';
  };

  return (
    <div className="emotion-tracker">
      <div className="emotion-main" onClick={() => setShowDetails(!showDetails)}>
        <div className="emotion-icon-large">
          {getEmotionIcon(currentEmotion)}
        </div>
        <div className="emotion-info">
          <div className="current-emotion" style={{ color: getEmotionColor(currentEmotion) }}>
            {currentEmotion || 'Neutral'}
          </div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${Math.min(100, confidence)}%`, backgroundColor: getConfidenceColor(confidence) }}
            />
          </div>
          <div className="confidence-text">{Math.round(confidence)}% confidence</div>
        </div>
        <FaChartLine className="expand-icon" />
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {showDetails && emotionStats && (
        <div className="emotion-details">
          <h4>Session Emotion Analysis</h4>
          
          <div className="emotion-stats">
            <div className="stat-item">
              <span>Overall Emotion:</span>
              <strong style={{ color: getEmotionColor(emotionStats.overall_emotion) }}>
                {emotionStats.overall_emotion || 'Neutral'}
              </strong>
            </div>
            <div className="stat-item">
              <span>Avg Confidence:</span>
              <strong>{emotionStats.average_confidence || 0}%</strong>
            </div>
            <div className="stat-item">
              <span>Status:</span>
              <strong style={{ color: getStatusColor(emotionStats.status) }} className="status-text">
                {emotionStats.status || 'No Data'}
              </strong>
            </div>
          </div>

          <div className="emotion-ratios">
            <div className="ratio-bar">
              <div className="ratio-label">Positive</div>
              <div className="ratio-bar-bg">
                <div className="ratio-fill positive" style={{ width: `${Math.min(100, emotionStats.positive_ratio || 0)}%` }} />
              </div>
              <div className="ratio-value">{emotionStats.positive_ratio || 0}%</div>
            </div>
            <div className="ratio-bar">
              <div className="ratio-label">Neutral</div>
              <div className="ratio-bar-bg">
                <div className="ratio-fill neutral" style={{ width: `${Math.min(100, emotionStats.neutral_ratio || 0)}%` }} />
              </div>
              <div className="ratio-value">{emotionStats.neutral_ratio || 0}%</div>
            </div>
            <div className="ratio-bar">
              <div className="ratio-label">Negative</div>
              <div className="ratio-bar-bg">
                <div className="ratio-fill negative" style={{ width: `${Math.min(100, emotionStats.negative_ratio || 0)}%` }} />
              </div>
              <div className="ratio-value">{emotionStats.negative_ratio || 0}%</div>
            </div>
          </div>

          {emotionStats.emotion_distribution && Object.keys(emotionStats.emotion_distribution).length > 0 && (
            <div className="emotion-distribution">
              <h5>Emotion Distribution</h5>
              <div className="distribution-bars">
                {Object.entries(emotionStats.emotion_distribution).map(([emotion, count]) => (
                  <div key={emotion} className="dist-item">
                    <span>{emotion}</span>
                    <div className="dist-bar-bg">
                      <div 
                        className="dist-fill" 
                        style={{ 
                          width: `${Math.min(100, (count / (emotionStats.total_frames || 1)) * 100)}%`,
                          backgroundColor: getEmotionColor(emotion)
                        }}
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
              {(emotionStats.negative_ratio || 0) > 30 && (
                <li>Practice relaxation techniques before interviews to reduce stress</li>
              )}
              {(emotionStats.positive_ratio || 0) < 20 && (
                <li>Try to maintain a positive and confident demeanor</li>
              )}
              {(emotionStats.average_confidence || 0) < 60 && (
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
    </div>
  );
}

export default EmotionTracker;