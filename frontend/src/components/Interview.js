// frontend/src/components/Interview.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import EmotionTracker from './EmotionTracker';
import { 
  FaMicrophone, 
  FaKeyboard, 
  FaStop, 
  FaPlay, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner,
  FaClock,
  FaChartLine,
  FaLightbulb,
  FaPause,
  FaRedoAlt,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import './Interview.css'; // Import external CSS

function Interview({ user }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faceScore, setFaceScore] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioQuality, setAudioQuality] = useState(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionReport, setEmotionReport] = useState(null);
  const [showTips, setShowTips] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedRole = location.state?.selectedRole || 'general';
  const micSkipped = location.state?.micSkipped || false;

  // Load questions when component mounts
  useEffect(() => {
    loadQuestions();
    const interval = setInterval(detectFace, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer for total interview time
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, questions]);

  // Question timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setError(null);
    try {
      console.log('Loading questions for role:', selectedRole);
      const response = await fetch('http://localhost:5000/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Questions loaded:', data);
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setError('No questions available for this role');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoadingQuestions(false);
      setLoading(false);
    }
  };

  const detectFace = async () => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const response = await fetch('http://localhost:5000/api/detect-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageSrc })
          });
          const data = await response.json();
          setFaceScore(data.eye_contact_score || 0);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }
  };

  const handleEmotionUpdate = (emotionData) => {
    setCurrentEmotion(emotionData);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          await analyzeAnswer(base64Audio);
        };
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions or switch to text input.');
      setUseTextInput(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const analyzeAnswer = async (audioData) => {
    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    try {
      const response = await fetch('http://localhost:5000/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_data: currentQuestion,
          audio_data: audioData
        })
      });
      const result = await response.json();
      
      setAudioQuality(result.audio_quality);
      setAnswers([...answers, { 
        question: currentQuestion.text, 
        answer: result.transcript, 
        score: result.score
      }]);
      setAnalysisResults([...analysisResults, result]);
      
      if (currentQuestionIndex + 1 < questions.length) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setAudioQuality(null);
          setIsSubmitting(false);
        }, 2000);
      } else {
        await finishInterview();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsSubmitting(false);
      alert('Error analyzing answer. Please try again.');
    }
  };

  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) {
      alert('Please enter your answer before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_data: currentQuestion,
          answer_text: textAnswer
        })
      });
      const result = await response.json();
      
      setAnswers([...answers, { 
        question: currentQuestion.text, 
        answer: textAnswer, 
        score: result.score
      }]);
      setAnalysisResults([...analysisResults, result]);
      
      setTextAnswer('');
      
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsSubmitting(false);
      } else {
        await finishInterview();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsSubmitting(false);
      alert('Error analyzing answer. Please try again.');
    }
  };

  const toggleInputMode = () => {
    setUseTextInput(!useTextInput);
  };

  const finishInterview = async () => {
    const overallScore = analysisResults.reduce((sum, r) => sum + (r.score || 0), 0) / analysisResults.length * 100;
    const overallFeedback = analysisResults.map(r => r.feedback || '').join('\n\n');
    const transcript = analysisResults.map((r, idx) => `Q${idx + 1}: ${answers[idx]?.answer || ''}\nScore: ${r.score}`).join('\n\n');
    
    const questionsData = answers.map((ans, idx) => ({
      question: ans.question,
      answer: ans.answer,
      score: ans.score,
      feedback: analysisResults[idx]?.feedback || '',
      confidence_score: analysisResults[idx]?.confidence_score || 0,
      clarity_score: analysisResults[idx]?.clarity_score || 0,
      keyword_score: analysisResults[idx]?.keyword_score || 0,
      matched_keywords: analysisResults[idx]?.matched_keywords || [],
      emotion: ans.emotion?.emotion || 'Neutral',
      time_taken: ans.timeTaken || 0
    }));
    
    const avgAudioQuality = analysisResults.reduce((sum, r) => sum + (r.audio_quality?.quality_score || 0.8), 0) / analysisResults.length;
    
    try {
      const response = await fetch('http://localhost:5000/api/save-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: selectedRole,
          overall_score: overallScore,
          overall_feedback: overallFeedback,
          transcript: transcript,
          audio_quality: useTextInput ? 0.8 : avgAudioQuality,
          camera_score: faceScore,
          questions_data: questionsData,
          total_time: elapsedTime
        })
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/report/${data.session_id}`);
      } else {
        alert('Error saving interview: ' + data.message);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving interview. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loadingQuestions) {
    return (
      <div className="loading-container">
        <FaSpinner className="spin large" />
        <h3>Loading Questions...</h3>
        <p>Please wait while we prepare your interview</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <h3>Error Loading Questions</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/device-check')} className="btn-primary">
          Go Back
        </button>
        <button onClick={loadQuestions} className="btn-secondary" style={{ marginLeft: '1rem' }}>
          <FaRedoAlt /> Try Again
        </button>
      </div>
    );
  }

  // No questions state
  if (!questions || questions.length === 0) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <h3>No Questions Available</h3>
        <p>No questions found for the selected role. Please try another role.</p>
        <button onClick={() => navigate('/device-check')} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="interview-container">
      <div className="interview-header">
        <div className="progress-section">
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <FaClock className="stat-icon" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="header-stat">
            <FaChartLine className="stat-icon" />
            <span>{Math.round(faceScore * 100)}% Eye Contact</span>
          </div>
          <div className="header-stat input-mode">
            {!useTextInput ? (
              <><FaMicrophone /> Voice</>
            ) : (
              <><FaKeyboard /> Text</>
            )}
          </div>
        </div>
      </div>
      
      <div className="interview-main">
        <div className="camera-feed">
          <Webcam 
            ref={webcamRef} 
            screenshotFormat="image/jpeg" 
            mirrored 
            className="webcam-preview"
          />
          <EmotionTracker isActive={true} onEmotionUpdate={handleEmotionUpdate} />
          {isRecording && (
            <div className={`recording-indicator ${isPaused ? 'paused' : ''}`}>
              <span className="recording-dot"></span>
              {isPaused ? '⏸️ Paused' : '🔴 Recording...'} {recordingTime}s
            </div>
          )}
          <div className="camera-overlay-stats">
            <div className="overlay-stat">
              <span>Eye Contact</span>
              <div className="overlay-progress">
                <div className="overlay-fill" style={{ width: `${faceScore * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="question-area">
          <div className="current-question">
            <div className="question-header">
              <div className="question-meta">
                <span className="difficulty-badge">{currentQuestion.difficulty || 'Medium'}</span>
                <span className="time-badge">⏱️ {formatTime(questionTimer)}</span>
              </div>
              <div className="question-actions">
                <button onClick={toggleInputMode} className="switch-mode-btn">
                  {!useTextInput ? <FaKeyboard /> : <FaMicrophone />}
                  {!useTextInput ? ' Text' : ' Voice'}
                </button>
                <button 
                  onClick={() => setShowTips(!showTips)} 
                  className="tips-toggle-btn"
                  title="Toggle Tips"
                >
                  <FaLightbulb />
                </button>
              </div>
            </div>
            <h3>{currentQuestion.text}</h3>
            {currentQuestion.expected_keywords && (
              <div className="expected-keywords">
                <strong>Key topics to cover:</strong>
                <div className="keywords-list">
                  {currentQuestion.expected_keywords.slice(0, 5).map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {!useTextInput ? (
            <div className="recording-controls">
              <div className="recording-buttons">
                {!isRecording ? (
                  <button onClick={startRecording} disabled={isSubmitting} className="btn-record">
                    <FaPlay /> Start Answering
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button onClick={pauseRecording} className="btn-pause">
                        <FaPause /> Pause
                      </button>
                    ) : (
                      <button onClick={resumeRecording} className="btn-resume">
                        <FaPlay /> Resume
                      </button>
                    )}
                    <button onClick={stopRecording} className="btn-stop">
                      <FaStop /> Stop
                    </button>
                  </>
                )}
              </div>
              
              {audioQuality && !isRecording && (
                <div className={`audio-quality ${audioQuality.is_good ? 'good' : 'poor'}`}>
                  <strong>Audio Quality:</strong> {audioQuality.feedback}
                </div>
              )}
            </div>
          ) : (
            <div className="text-input-controls">
              <div className="text-input-area">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="answer-textarea"
                  disabled={isSubmitting}
                />
                <div className="text-input-stats">
                  <span>Words: {textAnswer.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                  <span>Characters: {textAnswer.length}</span>
                </div>
              </div>
              <button 
                onClick={handleTextSubmit} 
                disabled={isSubmitting || !textAnswer.trim()}
                className="btn-submit-text"
              >
                {isSubmitting ? <FaSpinner className="spin" /> : <FaCheckCircle />}
                {isSubmitting ? 'Analyzing...' : 'Submit Answer'}
              </button>
            </div>
          )}
          
          {isSubmitting && (
            <div className="analyzing-indicator">
              <FaSpinner className="spin" />
              <p>Analyzing your answer...</p>
            </div>
          )}
          
          {analysisResults[currentQuestionIndex - 1] && currentQuestionIndex > 0 && !isSubmitting && (
            <div className="previous-feedback">
              <h4>📊 Previous Answer Feedback</h4>
              <div className="feedback-content">
                <p>{analysisResults[currentQuestionIndex - 1].feedback}</p>
                <div className="score-details">
                  <div className="score-item">
                    <span>Score</span>
                    <div className="score-circle small">
                      {Math.round(analysisResults[currentQuestionIndex - 1].score * 100)}%
                    </div>
                  </div>
                  <div className="score-item">
                    <span>Clarity</span>
                    <div className="score-circle small">
                      {Math.round(analysisResults[currentQuestionIndex - 1].clarity_score * 100)}%
                    </div>
                  </div>
                  {analysisResults[currentQuestionIndex - 1].matched_keywords && (
                    <div className="score-item">
                      <span>Keywords</span>
                      <div className="keywords-matched">
                        {analysisResults[currentQuestionIndex - 1].matched_keywords.length} matched
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showTips && (
            <div className="tips-box">
              <h4>💡 Tips for This Question</h4>
              <ul>
                <li>Speak clearly and at a moderate pace</li>
                <li>Use specific examples from your experience</li>
                <li>Structure your answer: Situation, Task, Action, Result</li>
                <li>Include the key topics shown above</li>
                <li>Maintain eye contact with the camera</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;