import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { 
  FaMicrophone, 
  FaVideo, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSpinner,
  FaRedoAlt,
  FaMicrophoneAlt,
  FaStepForward
} from 'react-icons/fa';

function DeviceCheck({ onComplete }) {
  const [cameraStatus, setCameraStatus] = useState('pending');
  const [microphoneStatus, setMicrophoneStatus] = useState('pending');
  const [micTestResult, setMicTestResult] = useState(null);
  const [cameraFeedback, setCameraFeedback] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);
  const [testingMic, setTestingMic] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [selectedRole, setSelectedRole] = useState('general');
  const [roles, setRoles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      const data = await response.json();
      if (data.roles) {
        setRoles(Object.entries(data.roles).map(([key, value]) => ({ id: key, ...value })));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Set default roles if API fails
      setRoles([
        { id: 'general', name: 'General', icon: '💼' },
        { id: 'software_engineering', name: 'Software Engineering', icon: '💻' },
        { id: 'data_science', name: 'Data Science', icon: '📊' },
        { id: 'product_management', name: 'Product Management', icon: '📱' },
        { id: 'marketing', name: 'Marketing', icon: '📢' }
      ]);
    }
  };

  const detectFace = useCallback(async () => {
    if (webcamRef.current && cameraStatus === 'success') {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const response = await fetch('http://localhost:5000/api/detect-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageSrc })
          });
          const data = await response.json();
          
          setFaceDetected(data.face_detected || false);
          setEyeContactScore(data.eye_contact_score || 0);
          
          if (!data.face_detected) {
            setCameraFeedback('⚠️ No face detected. Please look at the camera.');
          } else if (data.eye_contact_score < 0.5) {
            setCameraFeedback('👁️ Look directly at the camera for better eye contact.');
          } else {
            setCameraFeedback('✅ Good! Face detected with good eye contact.');
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }
  }, [cameraStatus]);

  const testCamera = useCallback(async () => {
    setCameraStatus('testing');
    setErrorMessage('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      stream.getTracks().forEach(track => track.stop());
      
      setCameraStatus('success');
      setCameraFeedback('✅ Camera working properly!');
      
    } catch (error) {
      console.error('Camera error:', error);
      setCameraStatus('error');
      
      if (error.name === 'NotAllowedError') {
        setCameraFeedback('Camera permission denied. Please allow camera access.');
        setErrorMessage('Permission denied');
      } else if (error.name === 'NotFoundError') {
        setCameraFeedback('No camera found. Please connect a camera.');
        setErrorMessage('No camera found');
      } else {
        setCameraFeedback('Camera error: ' + error.message);
        setErrorMessage(error.message);
      }
    }
  }, []);

  // Auto-test camera on mount
  useEffect(() => {
    testCamera();
  }, [testCamera]);

  // Face detection interval
  useEffect(() => {
    let interval;
    if (cameraStatus === 'success' && webcamRef.current) {
      interval = setInterval(detectFace, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameraStatus, detectFace]);

  const testMicrophone = async () => {
    setTestingMic(true);
    setMicrophoneStatus('testing');
    setMicTestResult(null);
    audioChunksRef.current = [];
    setErrorMessage('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (analyser) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const level = Math.min(1, average / 255);
          setAudioLevel(level);
          if (stream.active) {
            requestAnimationFrame(updateLevel);
          }
        }
      };
      updateLevel();
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result.split(',')[1];
            
            const response = await fetch('http://localhost:5000/api/test-mic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio_data: base64Audio })
            });
            
            const data = await response.json();
            console.log('Mic test response:', data);
            
            setMicTestResult(data);
            
            if (data.success && data.is_good) {
              setMicrophoneStatus('success');
            } else {
              setMicrophoneStatus('error');
              setErrorMessage(data.feedback || 'Microphone test failed');
            }
          } catch (error) {
            console.error('Mic test error:', error);
            setMicrophoneStatus('error');
            setMicTestResult({ 
              success: false, 
              message: 'Error testing microphone. Please try again.',
              feedback: 'Connection error'
            });
            setErrorMessage('Connection error');
          }
        };
        
        reader.readAsDataURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };
      
      mediaRecorderRef.current.start();
      
      let time = 0;
      const interval = setInterval(() => {
        time += 0.1;
        setRecordingProgress(Math.min(100, (time / 3) * 100));
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setRecordingProgress(0);
      }, 3000);
      
    } catch (error) {
      console.error('Microphone error:', error);
      setMicrophoneStatus('error');
      
      if (error.name === 'NotAllowedError') {
        setMicTestResult({ 
          success: false, 
          message: 'Microphone permission denied. Please allow microphone access.',
          feedback: 'Permission denied'
        });
        setErrorMessage('Permission denied');
      } else if (error.name === 'NotFoundError') {
        setMicTestResult({ 
          success: false, 
          message: 'No microphone found. Please connect a microphone.',
          feedback: 'No device found'
        });
        setErrorMessage('No microphone found');
      } else {
        setMicTestResult({ 
          success: false, 
          message: 'Microphone error: ' + error.message,
          feedback: 'Error'
        });
        setErrorMessage(error.message);
      }
    } finally {
      setTestingMic(false);
    }
  };

  const skipMicrophoneTest = () => {
    setMicrophoneStatus('skipped');
    setMicTestResult({
      success: true,
      is_good: true,
      quality_score: 0.7,
      volume_level: 0.5,
      feedback: 'Microphone test skipped. You can still proceed with the interview.',
      test_text: 'Microphone test skipped'
    });
    setErrorMessage('');
  };

  const handleContinue = () => {
    if (cameraStatus === 'success' && (microphoneStatus === 'success' || microphoneStatus === 'skipped')) {
      if (onComplete) {
        onComplete({
          camera: { status: cameraStatus, eyeContact: eyeContactScore },
          microphone: { 
            status: microphoneStatus, 
            quality: micTestResult?.quality_score || 0.7,
            skipped: microphoneStatus === 'skipped'
          }
        });
      }

      navigate('/interview', { 
        state: { 
          selectedRole: selectedRole,
          micSkipped: microphoneStatus === 'skipped'
        } 
      });
    }
  };

  const getCameraStatusIcon = () => {
    if (cameraStatus === 'success') return <FaCheckCircle className="status-icon success" />;
    if (cameraStatus === 'error') return <FaExclamationTriangle className="status-icon error" />;
    if (cameraStatus === 'testing') return <FaSpinner className="status-icon spin" />;
    return <FaVideo className="status-icon" />;
  };

  const getMicStatusIcon = () => {
    if (microphoneStatus === 'success') return <FaCheckCircle className="status-icon success" />;
    if (microphoneStatus === 'error') return <FaExclamationTriangle className="status-icon error" />;
    if (microphoneStatus === 'testing') return <FaSpinner className="status-icon spin" />;
    if (microphoneStatus === 'skipped') return <FaCheckCircle className="status-icon success" />;
    return <FaMicrophone className="status-icon" />;
  };

  const allReady = cameraStatus === 'success' && (microphoneStatus === 'success' || microphoneStatus === 'skipped');

  return (
    <div className="device-check-container">
      <div className="device-check-header">
        <h1>🎯 Device Check</h1>
        <p>Please test your camera before starting the interview. Microphone test is optional.</p>
      </div>

      {errorMessage && (
        <div className="error-banner">
          <FaExclamationTriangle className="error-banner-icon" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="error-banner-close">×</button>
        </div>
      )}

      <div className="device-check-grid">
        {/* Camera Card - Required */}
        <div className="device-card required">
          <div className="device-card-header">
            {getCameraStatusIcon()}
            <h3>Camera <span className="required-badge">Required</span></h3>
            {cameraStatus !== 'testing' && cameraStatus !== 'pending' && (
              <button onClick={testCamera} className="retry-button">
                <FaRedoAlt /> Retest
              </button>
            )}
          </div>
          
          <div className="camera-preview">
            {cameraStatus === 'success' ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  mirrored
                  videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                />
                <div className="camera-info">
                  <div className={`face-status ${faceDetected ? 'success' : 'warning'}`}>
                    {faceDetected ? '✅ Face Detected' : '⚠️ No Face Detected'}
                  </div>
                  <div className="eye-contact">
                    <span>Eye Contact:</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${eyeContactScore * 100}%` }}
                      />
                    </div>
                    <span>{Math.round(eyeContactScore * 100)}%</span>
                  </div>
                </div>
              </>
            ) : cameraStatus === 'testing' ? (
              <div className="device-testing">
                <FaSpinner className="spin large" />
                <p>Testing camera...</p>
              </div>
            ) : (
              <div className="device-error">
                <FaExclamationTriangle />
                <p>{cameraFeedback}</p>
                <button onClick={testCamera} className="btn-secondary">Try Again</button>
              </div>
            )}
          </div>
          
          {cameraStatus === 'success' && (
            <div className="device-feedback success-feedback">
              {cameraFeedback}
            </div>
          )}
        </div>

        {/* Microphone Card - Optional */}
        <div className="device-card optional">
          <div className="device-card-header">
            {getMicStatusIcon()}
            <h3>Microphone <span className="optional-badge">Optional</span></h3>
            {microphoneStatus !== 'testing' && microphoneStatus !== 'pending' && microphoneStatus !== 'skipped' && (
              <button onClick={testMicrophone} disabled={testingMic} className="retry-button">
                <FaRedoAlt /> {testingMic ? 'Testing...' : 'Retest'}
              </button>
            )}
          </div>
          
          <div className="mic-test-area">
            {microphoneStatus === 'pending' && !testingMic && (
              <div className="mic-options">
                <button onClick={testMicrophone} className="test-mic-button">
                  <FaMicrophoneAlt /> Test Microphone (Recommended)
                </button>
                <button onClick={skipMicrophoneTest} className="skip-mic-button">
                  <FaStepForward /> Skip Microphone Test
                </button>
                <p className="optional-note">
                  You can skip the microphone test if you're using text input or prefer to proceed directly.
                </p>
              </div>
            )}
            
            {testingMic && (
              <div className="mic-testing">
                <div className="audio-visualizer">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="audio-bar"
                      style={{ 
                        height: `${Math.max(5, audioLevel * 60)}px`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
                <div className="recording-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${recordingProgress}%` }} />
                  </div>
                  <p>Recording test audio... {Math.round(recordingProgress)}%</p>
                </div>
                <button onClick={() => {
                  if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                  }
                }} className="cancel-test-btn">
                  Cancel Test
                </button>
              </div>
            )}
            
            {microphoneStatus === 'success' && micTestResult && (
              <div className="mic-success">
                <FaCheckCircle className="success-icon" />
                <div className="mic-results">
                  <p className="test-transcript">"{micTestResult.test_text || 'Test completed successfully'}"</p>
                  <div className="metrics">
                    <div className="metric">
                      <span>Quality Score:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(micTestResult.quality_score || 0.7) * 100}%` }}
                        />
                      </div>
                      <span>{Math.round((micTestResult.quality_score || 0.7) * 100)}%</span>
                    </div>
                    <div className="metric">
                      <span>Volume Level:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(micTestResult.volume_level || 0.5) * 100}%` }}
                        />
                      </div>
                      <span>{Math.round((micTestResult.volume_level || 0.5) * 100)}%</span>
                    </div>
                  </div>
                  <p className="feedback-text">{micTestResult.feedback}</p>
                </div>
                <button onClick={testMicrophone} className="retest-button">
                  <FaRedoAlt /> Test Again
                </button>
              </div>
            )}
            
            {microphoneStatus === 'skipped' && (
              <div className="mic-skipped">
                <FaCheckCircle className="skipped-icon" />
                <div className="mic-results">
                  <p className="skipped-text">Microphone test skipped</p>
                  <p className="feedback-text">You can still proceed with the interview. You'll have the option to type your answers.</p>
                </div>
                <button onClick={testMicrophone} className="test-now-button">
                  <FaMicrophoneAlt /> Test Now
                </button>
              </div>
            )}
            
            {microphoneStatus === 'error' && micTestResult && (
              <div className="mic-error">
                <FaExclamationTriangle className="error-icon" />
                <p>{micTestResult.message || 'Microphone test failed'}</p>
                <div className="error-actions">
                  <button onClick={testMicrophone} className="btn-secondary">Try Again</button>
                  <button onClick={skipMicrophoneTest} className="skip-button">Skip & Continue</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="role-selection">
        <h3>Select Interview Role</h3>
        <div className="role-buttons">
          {roles.map(role => (
            <button
              key={role.id}
              className={`role-button ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <span className="role-icon">{role.icon}</span>
              <span>{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tips-section">
        <h4>💡 Tips for Best Results</h4>
        <ul>
          <li>Ensure good lighting on your face</li>
          <li>Position camera at eye level</li>
          <li>Find a quiet environment for better audio quality</li>
          <li>Maintain eye contact with the camera</li>
          <li>Microphone test is optional - you can use text input instead</li>
        </ul>
      </div>

      <div className="continue-section">
        <button 
          onClick={handleContinue}
          disabled={!allReady || !selectedRole}
          className={`continue-button ${allReady && selectedRole ? 'ready' : 'disabled'}`}
        >
          {allReady && selectedRole ? '✓ Start Interview' : '⏳ Complete Setup'}
        </button>
        {!allReady && cameraStatus !== 'success' && (
          <p className="warning-text">
            Please ensure your camera is working to continue
          </p>
        )}
        {cameraStatus === 'success' && !selectedRole && (
          <p className="warning-text">
            Please select an interview role
          </p>
        )}
        {cameraStatus === 'success' && !allReady && microphoneStatus === 'pending' && selectedRole && (
          <p className="info-text">
            You can test your microphone or skip to continue
          </p>
        )}
      </div>

      <style jsx>{`
        .device-check-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #F8FAFC;
          min-height: 100vh;
          border-radius: 0;
        }
        
        .device-check-header {
          text-align: center;
          margin-bottom: 2rem;
          color: #0F172A;
        }
        
        .device-check-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .device-check-header p {
          font-size: 1.1rem;
          color: #64748B;
        }

        .error-banner {
          background: #FEE2E2;
          color: #DC2626;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid #FECACA;
        }

        .error-banner-icon {
          font-size: 1.2rem;
        }

        .error-banner-close {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #DC2626;
          padding: 0 0.5rem;
        }
        
        .device-check-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .device-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .device-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        
        .device-card.required {
          border-top: 4px solid #EF4444;
        }
        
        .device-card.optional {
          border-top: 4px solid #06B6D4;
        }
        
        .device-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #F1F5F9;
        }
        
        .device-card-header h3 {
          margin: 0;
          flex: 1;
          color: #0F172A;
          font-weight: 600;
        }
        
        .required-badge {
          background: #EF4444;
          color: white;
          font-size: 0.65rem;
          padding: 3px 10px;
          border-radius: 12px;
          margin-left: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .optional-badge {
          background: #06B6D4;
          color: white;
          font-size: 0.65rem;
          padding: 3px 10px;
          border-radius: 12px;
          margin-left: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-icon {
          font-size: 1.5rem;
        }
        
        .status-icon.success {
          color: #22C55E;
        }
        
        .status-icon.error {
          color: #EF4444;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .retry-button {
          background: #F1F5F9;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #0F172A;
          transition: all 0.3s;
          font-weight: 500;
        }
        
        .retry-button:hover {
          background: #E2E8F0;
          transform: scale(1.05);
        }
        
        .camera-preview {
          position: relative;
          background: #0F172A;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .camera-preview video {
          width: 100%;
          border-radius: 12px;
          display: block;
        }
        
        .camera-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          padding: 1rem;
          color: white;
        }
        
        .face-status {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .face-status.success {
          color: #22C55E;
        }
        
        .face-status.warning {
          color: #FBBF24;
        }
        
        .eye-contact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        
        .eye-contact span:first-child {
          min-width: 85px;
        }
        
        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22C55E, #16A34A);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        .device-feedback {
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        
        .success-feedback {
          background: #DCFCE7;
          color: #16A34A;
          font-weight: 500;
          border: 1px solid #BBF7D0;
        }
        
        .device-testing, .device-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
          color: white;
          min-height: 300px;
        }
        
        .device-testing .spin.large {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #06B6D4;
        }
        
        .device-error {
          color: #EF4444;
        }
        
        .device-error p {
          margin: 1rem 0;
          color: #F1F5F9;
        }
        
        .mic-options {
          text-align: center;
          padding: 0.5rem 0;
        }
        
        .test-mic-button, .skip-mic-button {
          display: block;
          width: 100%;
          padding: 1rem;
          margin-bottom: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }
        
        .test-mic-button {
          background: #0F172A;
          color: white;
        }
        
        .test-mic-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
        }
        
        .skip-mic-button {
          background: #F1F5F9;
          color: #64748B;
        }
        
        .skip-mic-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.05);
        }
        
        .optional-note {
          font-size: 0.8rem;
          color: #94A3B8;
          margin-top: 0.5rem;
          line-height: 1.4;
        }
        
        .mic-testing {
          text-align: center;
          padding: 0.5rem 0;
        }
        
        .audio-visualizer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 80px;
          margin-bottom: 1.5rem;
        }
        
        .audio-bar {
          width: 6px;
          background: linear-gradient(135deg, #06B6D4, #0891B2);
          border-radius: 3px;
          animation: pulse 0.5s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
        
        .recording-progress {
          margin-top: 1rem;
        }
        
        .recording-progress p {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #64748B;
        }
        
        .cancel-test-btn {
          margin-top: 1rem;
          background: none;
          border: none;
          color: #EF4444;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .cancel-test-btn:hover {
          background: rgba(239, 68, 68, 0.05);
        }
        
        .mic-success {
          text-align: center;
          padding: 0.5rem 0;
        }
        
        .success-icon {
          font-size: 3rem;
          color: #22C55E;
          margin-bottom: 1rem;
        }
        
        .test-transcript {
          background: #F8FAFC;
          padding: 1rem;
          border-radius: 10px;
          font-style: italic;
          margin-bottom: 1rem;
          color: #0F172A;
          border-left: 4px solid #06B6D4;
        }
        
        .metrics {
          text-align: left;
          margin-bottom: 1rem;
        }
        
        .metric {
          margin-bottom: 0.75rem;
        }
        
        .metric span:first-child {
          display: block;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
          color: #64748B;
          font-weight: 500;
        }
        
        .feedback-text {
          font-size: 0.85rem;
          color: #64748B;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #F8FAFC;
          border-radius: 8px;
        }
        
        .retest-button {
          background: #F1F5F9;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
          font-weight: 500;
          color: #0F172A;
          transition: all 0.3s;
        }
        
        .retest-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        
        .mic-skipped {
          text-align: center;
          padding: 0.5rem 0;
        }
        
        .skipped-icon {
          font-size: 3rem;
          color: #FBBF24;
          margin-bottom: 1rem;
        }
        
        .skipped-text {
          font-size: 1.1rem;
          color: #FBBF24;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .test-now-button {
          background: #0F172A;
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .test-now-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
        }
        
        .mic-error {
          text-align: center;
          padding: 0.5rem 0;
        }
        
        .error-icon {
          font-size: 3rem;
          color: #EF4444;
          margin-bottom: 1rem;
        }
        
        .mic-error p {
          color: #0F172A;
          margin-bottom: 1rem;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        
        .btn-secondary {
          background: #0F172A;
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
        }
        
        .skip-button {
          background: #F1F5F9;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #64748B;
          transition: all 0.3s;
        }
        
        .skip-button:hover {
          transform: translateY(-2px);
          background: #E2E8F0;
        }
        
        .role-selection {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
        }
        
        .role-selection h3 {
          margin-bottom: 1rem;
          color: #0F172A;
          text-align: center;
          font-weight: 600;
          font-size: 1.2rem;
        }
        
        .role-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }
        
        .role-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: 2px solid #E2E8F0;
          border-radius: 50px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          color: #0F172A;
        }
        
        .role-button:hover {
          border-color: #06B6D4;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.1);
        }
        
        .role-button.selected {
          background: #0F172A;
          border-color: #0F172A;
          color: white;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.2);
        }
        
        .role-icon {
          font-size: 1.2rem;
        }
        
        .tips-section {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
        }
        
        .tips-section h4 {
          margin-bottom: 1rem;
          color: #0F172A;
          font-weight: 600;
        }
        
        .tips-section ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .tips-section li {
          margin: 0.5rem 0;
          color: #64748B;
          line-height: 1.6;
        }
        
        .continue-section {
          text-align: center;
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
        }
        
        .continue-button {
          padding: 1rem 3rem;
          font-size: 1.2rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
        }
        
        .continue-button.ready {
          background: #06B6D4;
          color: white;
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
        }
        
        .continue-button.ready:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(6, 182, 212, 0.4);
          background: #0891B2;
        }
        
        .continue-button.disabled {
          background: #E2E8F0;
          color: #94A3B8;
          cursor: not-allowed;
        }
        
        .warning-text {
          margin-top: 1rem;
          color: #EF4444;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .info-text {
          margin-top: 1rem;
          color: #06B6D4;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        @media (max-width: 1024px) {
          .device-check-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .device-check-container {
            padding: 1rem;
          }
          
          .device-check-header h1 {
            font-size: 1.8rem;
          }
          
          .error-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .role-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .role-button {
            width: 100%;
            justify-content: center;
          }
          
          .continue-button {
            padding: 0.8rem 2rem;
            font-size: 1rem;
            width: 100%;
          }

          .device-card {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .device-check-header h1 {
            font-size: 1.5rem;
          }

          .device-check-header p {
            font-size: 0.9rem;
          }

          .test-mic-button, .skip-mic-button {
            font-size: 0.9rem;
            padding: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default DeviceCheck;