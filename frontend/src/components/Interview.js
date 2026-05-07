// frontend/src/components/Interview.js - Add emotion tracking integration

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import EmotionTracker from './EmotionTracker';
import { FaMicrophone, FaKeyboard, FaStop, FaPlay, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

function Interview({ user }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faceScore, setFaceScore] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioQuality, setAudioQuality] = useState(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionReport, setEmotionReport] = useState(null);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedRole = location.state?.selectedRole || 'general';
  const micSkipped = location.state?.micSkipped || false;

  useEffect(() => {
    if (micSkipped) {
      setUseTextInput(true);
      setShowTextInput(true);
    }
  }, [micSkipped]);

  useEffect(() => {
    loadQuestions();
    const interval = setInterval(detectFace, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const loadQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
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
          setFaceScore(data.eye_contact_score);
        } catch (error) {
          console.error('Face detection error:', error);
        }
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
        audioChunksRef.current.push(event.data);
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
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions or switch to text input.');
      setUseTextInput(true);
      setShowTextInput(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
        score: result.score,
        emotion: currentEmotion
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
        score: result.score,
        emotion: currentEmotion
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
    if (useTextInput) {
      setUseTextInput(false);
      setShowTextInput(false);
    } else {
      setUseTextInput(true);
      setShowTextInput(true);
    }
  };

  const finishInterview = async () => {
    // Get emotion analysis report
    let emotionAnalysis = {};
    try {
      const emotionResponse = await fetch('http://localhost:5000/api/emotion-analysis');
      emotionAnalysis = await emotionResponse.json();
      setEmotionReport(emotionAnalysis);
    } catch (error) {
      console.error('Error fetching emotion analysis:', error);
    }
    
    const overallScore = analysisResults.reduce((sum, r) => sum + r.score, 0) / analysisResults.length * 100;
    const overallFeedback = analysisResults.map(r => r.feedback).join('\n\n');
    const transcript = analysisResults.map((r, idx) => `Q${idx + 1}: ${answers[idx]?.answer || ''}\nScore: ${r.score}`).join('\n\n');
    
    const questionsData = answers.map((ans, idx) => ({
      question: ans.question,
      answer: ans.answer,
      score: ans.score,
      feedback: analysisResults[idx]?.feedback || '',
      confidence: analysisResults[idx]?.confidence_score || 0,
      clarity: analysisResults[idx]?.clarity_score || 0,
      emotion: ans.emotion?.emotion || 'Neutral'
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
          emotion_analysis: emotionAnalysis
        })
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/report/${data.session_id}`, { state: { emotionAnalysis } });
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving interview. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spin large" />
        <p>Loading questions...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="error-container">
        <FaExclamationTriangle />
        <p>No questions available for this role.</p>
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
          <div className="eye-contact-score">
            <span>👁️ Eye Contact</span>
            <div className="score-value">{Math.round(faceScore * 100)}%</div>
          </div>
          {!useTextInput && (
            <div className="input-mode-indicator">
              <FaMicrophone /> Voice Mode
            </div>
          )}
          {useTextInput && (
            <div className="input-mode-indicator text-mode">
              <FaKeyboard /> Text Mode
            </div>
          )}
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
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              Recording... {recordingTime}s
            </div>
          )}
        </div>
        
        <div className="question-area">
          <div className="current-question">
            <div className="question-header">
              <span className="difficulty-badge">{currentQuestion.difficulty || 'Medium'}</span>
              {!useTextInput && !micSkipped && (
                <button onClick={toggleInputMode} className="switch-mode-btn">
                  <FaKeyboard /> Switch to Text
                </button>
              )}
              {useTextInput && (
                <button onClick={toggleInputMode} className="switch-mode-btn">
                  <FaMicrophone /> Switch to Voice
                </button>
              )}
            </div>
            <h3>{currentQuestion.text}</h3>
            {currentQuestion.expected_keywords && (
              <div className="expected-keywords">
                <strong>Key topics to cover:</strong>
                <div className="keywords-list">
                  {currentQuestion.expected_keywords.slice(0, 5).map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {!useTextInput ? (
            <div className="recording-controls">
              {!isRecording ? (
                <button onClick={startRecording} disabled={isSubmitting} className="btn-record">
                  <FaPlay /> Start Answering
                </button>
              ) : (
                <button onClick={stopRecording} className="btn-stop">
                  <FaStop /> Stop Recording
                </button>
              )}
              
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
                <div className="word-count">
                  Words: {textAnswer.trim().split(/\s+/).filter(w => w.length > 0).length}
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;