// frontend/src/components/EmotionTracker.js
import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import './EmotionTracker.css';

function EmotionTracker({ isActive = true, onEmotionUpdate }) {
  const [currentEmotion, setCurrentEmotion] = useState('Neutral');
  const [confidence, setConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startEmotionTracking();
    } else {
      stopEmotionTracking();
    }
    return () => stopEmotionTracking();
  }, [isActive]);

  const startEmotionTracking = () => {
    setIsTracking(true);
    setError(null);
    
    // Track emotion every 2 seconds
    intervalRef.current = setInterval(async () => {
      try {
        await detectEmotion();
      } catch (error) {
        console.error('Emotion detection error:', error);
        // Don't stop tracking on error, just log it
      }
    }, 2000);
  };

  const stopEmotionTracking = () => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const detectEmotion = async () => {
    try {
      // Get image from video feed (if available)
      const videoElement = document.querySelector('video');
      if (!videoElement) {
        console.log('No video element found for emotion detection');
        return;
      }

      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('📡 Sending emotion detection to:', `${API_URL}/api/detect-emotion`);
      
      const response = await fetch(`${API_URL}/api/detect-emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Emotion response:', data);
      
      if (data && data.emotion) {
        setCurrentEmotion(data.emotion);
        setConfidence(data.confidence || 0);
        
        // Update history
        setEmotionHistory(prev => {
          const newHistory = [...prev, { 
            emotion: data.emotion, 
            confidence: data.confidence || 0,
            timestamp: new Date().toISOString()
          }];
          // Keep only last 50 entries
          return newHistory.slice(-50);
        });

        // Callback for parent component
        if (onEmotionUpdate) {
          onEmotionUpdate({
            emotion: data.emotion,
            confidence: data.confidence || 0,
            face_detected: data.face_detected !== false,
            eye_contact: data.eye_contact || 0,
            smile: data.smile || false
          });
        }
      }
    } catch (error) {
      console.error('❌ Emotion detection error:', error);
      setError(error.message);
      // Keep last known emotion
    }
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      'Happy': '😊',
      'Sad': '😢',
      'Angry': '😠',
      'Surprised': '😮',
      'Fearful': '😨',
      'Neutral': '😐',
      'No Face': '🚫'
    };
    return emojis[emotion] || '😐';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'Happy': '#22C55E',
      'Sad': '#3B82F6',
      'Angry': '#EF4444',
      'Surprised': '#FBBF24',
      'Fearful': '#8B5CF6',
      'Neutral': '#6B7280',
      'No Face': '#EF4444'
    };
    return colors[emotion] || '#6B7280';
  };

  const getConfidenceColor = (conf) => {
    if (conf > 70) return '#22C55E';
    if (conf > 40) return '#FBBF24';
    return '#EF4444';
  };

  // Get emotion distribution
  const getEmotionDistribution = () => {
    const distribution = {};
    emotionHistory.forEach(item => {
      distribution[item.emotion] = (distribution[item.emotion] || 0) + 1;
    });
    return distribution;
  };

  const distribution = getEmotionDistribution();
  const totalEmotions = emotionHistory.length;

  return (
    <div className="emotion-tracker">
      <div className="emotion-tracker-header">
        <span className="tracker-title">🎯 Emotion Tracking</span>
        <span className={`tracker-status ${isTracking ? 'active' : 'inactive'}`}>
          {isTracking ? '🟢 Active' : '⏸️ Paused'}
        </span>
      </div>

      <div className="emotion-display">
        <div className="current-emotion" style={{ borderColor: getEmotionColor(currentEmotion) }}>
          <div className="emotion-emoji">{getEmotionEmoji(currentEmotion)}</div>
          <div className="emotion-name">{currentEmotion}</div>
          <div className="emotion-confidence">
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ 
                  width: `${confidence}%`,
                  backgroundColor: getConfidenceColor(confidence)
                }}
              />
            </div>
            <span>{Math.round(confidence)}%</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="emotion-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {emotionHistory.length > 0 && (
        <div className="emotion-history">
          <div className="history-header">
            <span>📊 Recent Emotions</span>
            <span className="history-count">{emotionHistory.length} samples</span>
          </div>
          <div className="history-bars">
            {Object.entries(distribution).map(([emotion, count]) => {
              const percentage = (count / totalEmotions) * 100;
              return (
                <div key={emotion} className="history-bar-item">
                  <span className="history-emotion">{getEmotionEmoji(emotion)} {emotion}</span>
                  <div className="history-bar-track">
                    <div 
                      className="history-bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getEmotionColor(emotion)
                      }}
                    />
                  </div>
                  <span className="history-percentage">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="emotion-controls">
        <button 
          onClick={isTracking ? stopEmotionTracking : startEmotionTracking}
          className={`tracker-btn ${isTracking ? 'stop' : 'start'}`}
        >
          {isTracking ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
        </button>
        <button 
          onClick={() => {
            setEmotionHistory([]);
            setCurrentEmotion('Neutral');
            setConfidence(0);
          }}
          className="tracker-btn reset"
        >
          🔄 Reset
        </button>
      </div>

      <style jsx>{`
        .emotion-tracker {
          background: rgba(20, 20, 30, 0.9);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-width: 280px;
          max-width: 350px;
        }

        .emotion-tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tracker-title {
          font-size: 14px;
          font-weight: 600;
          color: #c8c8d4;
        }

        .tracker-status {
          font-size: 11px;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: 500;
        }

        .tracker-status.active {
          background: rgba(34, 197, 94, 0.2);
          color: #22C55E;
        }

        .tracker-status.inactive {
          background: rgba(107, 114, 128, 0.2);
          color: #6B7280;
        }

        .emotion-display {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .current-emotion {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px 24px;
          text-align: center;
          border: 2px solid #6B7280;
          transition: border-color 0.3s ease;
          min-width: 150px;
        }

        .emotion-emoji {
          font-size: 40px;
          margin-bottom: 4px;
        }

        .emotion-name {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .emotion-confidence {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .confidence-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .emotion-confidence span {
          font-size: 12px;
          font-weight: 600;
          color: #c8c8d4;
          min-width: 35px;
        }

        .emotion-error {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }

        .emotion-history {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #8a8a9a;
          margin-bottom: 8px;
        }

        .history-count {
          color: #5a5a6a;
        }

        .history-bars {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .history-bar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .history-emotion {
          min-width: 70px;
          color: #c8c8d4;
        }

        .history-bar-track {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .history-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .history-percentage {
          min-width: 35px;
          text-align: right;
          color: #8a8a9a;
          font-size: 11px;
        }

        .emotion-controls {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tracker-btn {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
        }

        .tracker-btn.start {
          background: rgba(34, 197, 94, 0.2);
          color: #22C55E;
        }

        .tracker-btn.start:hover {
          background: rgba(34, 197, 94, 0.3);
        }

        .tracker-btn.stop {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .tracker-btn.stop:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .tracker-btn.reset {
          background: rgba(255, 255, 255, 0.05);
          color: #8a8a9a;
          flex: 0.5;
        }

        .tracker-btn.reset:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

export default EmotionTracker;