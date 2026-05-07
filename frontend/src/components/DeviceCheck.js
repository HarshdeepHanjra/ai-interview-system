import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FaMicrophone, FaVideo, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function DeviceCheck() {
  const [cameraStatus, setCameraStatus] = useState(null);
  const [microphoneStatus, setMicrophoneStatus] = useState(null);
  const [micTestText, setMicTestText] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [cameraScore, setCameraScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [testing, setTesting] = useState(false);
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  useEffect(() => {
    fetchRoles();
    testCamera();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles');
      const data = await response.json();
      setRoles(Object.entries(data.roles).map(([key, value]) => ({ id: key, ...value })));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const testCamera = async () => {
    setCameraStatus('testing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraStatus('success');
      
      // Start face detection after camera is working
      const interval = setInterval(detectFace, 1000);
      setTimeout(() => clearInterval(interval), 5000);
    } catch (error) {
      setCameraStatus('error');
    }
  };

  const detectFace = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const response = await fetch('http://localhost:5000/api/detect-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageSrc })
          });
          const data = await response.json();
          setFaceDetected(data.face_detected);
          setCameraScore(data.eye_contact_score);
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }
  };

  const testMicrophone = async () => {
    setTesting(true);
    setMicrophoneStatus('testing');
    try {
      const response = await fetch('http://localhost:5000/api/test-microphone');
      const data = await response.json();
      setMicrophoneStatus(data.success ? 'success' : 'error');
      setMicTestText(data.test_text);
    } catch (error) {
      setMicrophoneStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const startInterview = () => {
    if (selectedRole && cameraStatus === 'success' && microphoneStatus === 'success') {
      navigate('/interview', { state: { selectedRole } });
    }
  };

  return (
    <div className="device-check-container">
      <h1>Device Check</h1>
      <p>Please ensure your camera and microphone are working properly before starting</p>

      <div className="device-grid">
        <div className="device-card">
          <div className="device-header">
            <FaVideo className="device-icon" />
            <h3>Camera Check</h3>
            {cameraStatus === 'success' && <FaCheckCircle className="status-success" />}
            {cameraStatus === 'error' && <FaExclamationTriangle className="status-error" />}
          </div>
          <div className="camera-preview">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" mirrored />
          </div>
          {cameraStatus === 'success' && (
            <div className="camera-feedback">
              <p>✅ Camera detected</p>
              <p>{faceDetected ? '✅ Face detected' : '⚠️ No face detected - please look at camera'}</p>
              <p>Eye Contact Score: {Math.round(cameraScore * 100)}%</p>
            </div>
          )}
          {cameraStatus === 'error' && (
            <p className="error-text">Camera not accessible. Please check permissions.</p>
          )}
        </div>

        <div className="device-card">
          <div className="device-header">
            <FaMicrophone className="device-icon" />
            <h3>Microphone Check</h3>
            {microphoneStatus === 'success' && <FaCheckCircle className="status-success" />}
            {microphoneStatus === 'error' && <FaExclamationTriangle className="status-error" />}
          </div>
          <button onClick={testMicrophone} disabled={testing} className="btn-secondary">
            {testing ? 'Testing...' : 'Test Microphone'}
          </button>
          {micTestText && (
            <div className="mic-feedback">
              <p>Test transcript: "{micTestText}"</p>
              <p>✅ Microphone working properly</p>
            </div>
          )}
          {microphoneStatus === 'error' && (
            <p className="error-text">Microphone not accessible. Please check permissions.</p>
          )}
        </div>

        <div className="device-card">
          <h3>Select Interview Role</h3>
          <div className="role-selector">
            {roles.map(role => (
              <button
                key={role.id}
                className={`role-option ${selectedRole === role.id ? 'selected' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <span className="role-icon">{role.icon}</span>
                <span>{role.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={startInterview}
        disabled={!selectedRole || cameraStatus !== 'success' || microphoneStatus !== 'success'}
        className="btn-primary btn-large start-btn"
      >
        Start Interview
      </button>
    </div>
  );
}

export default DeviceCheck;