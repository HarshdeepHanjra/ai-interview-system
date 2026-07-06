# backend/emotion_detector.py
import os
import logging
import base64
from collections import Counter
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import OpenCV, but don't fail if not available
try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
    logger.info("✅ OpenCV loaded successfully")
except ImportError:
    OPENCV_AVAILABLE = False
    logger.warning("⚠️ OpenCV not available. Emotion detection will be limited.")

class EmotionDetector:
    def __init__(self):
        """Initialize EmotionDetector with or without OpenCV"""
        self.emotion_dict = {
            0: "Neutral", 1: "Happy", 2: "Sad", 
            3: "Surprised", 4: "Angry", 5: "Fearful"
        }
        
        # Store session data
        self.session_emotions = []
        self.session_confidences = []
        self.face_detected_count = 0
        self.face_not_detected_count = 0
        self.emotion_history = []
        self.model_loaded = False
        self.model = None
        
        # Initialize OpenCV components if available
        if OPENCV_AVAILABLE:
            self._init_opencv()
        else:
            logger.info("Running in limited mode - no OpenCV")

    def _init_opencv(self):
        """Initialize OpenCV components"""
        try:
            # Face detector
            face_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            if os.path.exists(face_path):
                self.face_detector = cv2.CascadeClassifier(face_path)
                logger.info("✅ Face detector loaded successfully")
            else:
                self.face_detector = None
                
            # Eye detector
            eye_path = cv2.data.haarcascades + "haarcascade_eye.xml"
            if os.path.exists(eye_path):
                self.eye_detector = cv2.CascadeClassifier(eye_path)
            else:
                self.eye_detector = None
                
            # Mouth detector
            mouth_path = cv2.data.haarcascades + "haarcascade_smile.xml"
            if os.path.exists(mouth_path):
                self.mouth_cascade = cv2.CascadeClassifier(mouth_path)
            else:
                self.mouth_cascade = None
                
        except Exception as e:
            logger.error(f"Error initializing OpenCV: {e}")
            self.face_detector = None
            self.eye_detector = None
            self.mouth_cascade = None

    def detect_emotion_from_image(self, image_data):
        """Detect emotion from base64 image"""
        if not OPENCV_AVAILABLE:
            return self._get_fallback_emotion()
        
        try:
            # Clean and decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            try:
                image_bytes = base64.b64decode(image_data)
                np_arr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            except Exception as e:
                logger.error(f"Image decoding error: {e}")
                return self._get_fallback_emotion()
            
            if frame is None or frame.size == 0:
                return self._get_fallback_emotion()
            
            # Convert to grayscale
            try:
                gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            except Exception:
                return self._get_fallback_emotion()
            
            # Detect faces
            faces = []
            if hasattr(self, 'face_detector') and self.face_detector is not None:
                try:
                    faces = self.face_detector.detectMultiScale(
                        gray_frame, 
                        scaleFactor=1.3, 
                        minNeighbors=5,
                        minSize=(50, 50)
                    )
                except Exception:
                    faces = []
            
            if len(faces) == 0:
                self.face_not_detected_count += 1
                return self._get_fallback_emotion(no_face=True)
            
            self.face_detected_count += 1
            
            # Analyze the best face (largest)
            face = max(faces, key=lambda f: f[2] * f[3])
            
            # Detect emotion using facial features
            emotion_data = self._analyze_facial_features(frame, gray_frame, face)
            
            # Store for session analysis
            self.session_emotions.append(emotion_data['emotion'])
            self.session_confidences.append(emotion_data['confidence'])
            
            if len(self.session_emotions) > 1000:
                self.session_emotions = self.session_emotions[-1000:]
                self.session_confidences = self.session_confidences[-1000:]
            
            return {
                'emotion': emotion_data['emotion'],
                'confidence': round(emotion_data['confidence'], 2),
                'all_emotions': self.session_emotions[-10:],
                'face_detected': True,
                'face_count': len(faces),
                'eye_contact': emotion_data.get('eye_contact', 0),
                'smile': emotion_data.get('smile', False),
                'emotion_scores': emotion_data.get('scores', {}),
                'model_loaded': False,
                'message': 'Using OpenCV-based emotion detection'
            }
            
        except Exception as e:
            logger.error(f"Emotion detection error: {e}")
            return self._get_fallback_emotion()

    def _analyze_facial_features(self, frame, gray_frame, face):
        """Analyze facial features to detect emotion using OpenCV"""
        if not OPENCV_AVAILABLE:
            return {
                'emotion': 'Neutral',
                'confidence': 50,
                'eye_contact': 0.5,
                'smile': False,
                'scores': {'neutral': 1.0}
            }
            
        try:
            (x, y, w, h) = face
            
            # Initialize emotion scores
            scores = {
                'happy': 0,
                'sad': 0,
                'angry': 0,
                'surprised': 0,
                'neutral': 0,
                'fearful': 0
            }
            
            # Analyze smile
            smile_detected = False
            if hasattr(self, 'mouth_cascade') and self.mouth_cascade is not None:
                try:
                    mouth_roi = gray_frame[y+int(h*0.6):y+h, x+int(w*0.2):x+int(w*0.8)]
                    if mouth_roi.size > 0:
                        smiles = self.mouth_cascade.detectMultiScale(
                            mouth_roi, 
                            scaleFactor=1.8, 
                            minNeighbors=20,
                            minSize=(25, 25)
                        )
                        if len(smiles) > 0:
                            smile_detected = True
                            scores['happy'] += 0.4
                except Exception:
                    pass
            
            # Detect eyes
            eyes = []
            if hasattr(self, 'eye_detector') and self.eye_detector is not None:
                try:
                    eyes = self.eye_detector.detectMultiScale(
                        gray_frame[y:y+h, x:x+w], 
                        scaleFactor=1.1, 
                        minNeighbors=5,
                        minSize=(20, 20)
                    )
                except Exception:
                    pass
            
            eye_contact_score = 0.5
            if len(eyes) >= 2:
                # Basic eye contact estimation
                eye_contact_score = 0.7
            
            # Determine emotion (simplified)
            if smile_detected:
                emotion = 'Happy'
                confidence = 70
            elif len(eyes) >= 2:
                emotion = 'Neutral'
                confidence = 60
            else:
                emotion = 'Neutral'
                confidence = 50
            
            scores['happy'] = 0.4 if smile_detected else 0.1
            scores['neutral'] = 0.3
            scores['sad'] = 0.1
            scores['angry'] = 0.1
            scores['surprised'] = 0.1
            
            return {
                'emotion': emotion,
                'confidence': confidence,
                'scores': scores,
                'eye_contact': eye_contact_score,
                'smile': smile_detected
            }
            
        except Exception as e:
            logger.error(f"Facial feature analysis error: {e}")
            return {
                'emotion': 'Neutral',
                'confidence': 50,
                'eye_contact': 0.5,
                'smile': False,
                'scores': {'neutral': 1.0}
            }

    def _get_fallback_emotion(self, no_face=False):
        """Return fallback emotion data"""
        if no_face:
            return {
                'emotion': 'No Face',
                'confidence': 0,
                'all_emotions': self.session_emotions[-10:] if self.session_emotions else [],
                'face_detected': False,
                'face_count': 0,
                'eye_contact': 0,
                'smile': False,
                'model_loaded': False,
                'message': 'No face detected in frame'
            }
        
        if self.session_emotions:
            return {
                'emotion': self.session_emotions[-1],
                'confidence': 50.0,
                'all_emotions': self.session_emotions[-10:],
                'face_detected': True,
                'face_count': 1,
                'eye_contact': 0.5,
                'smile': False,
                'model_loaded': False,
                'message': 'Using cached emotion'
            }
        
        return {
            'emotion': 'Neutral',
            'confidence': 50,
            'all_emotions': [],
            'face_detected': True,
            'face_count': 1,
            'eye_contact': 0.5,
            'smile': False,
            'model_loaded': False,
            'message': 'Using default emotion'
        }

    def get_session_analysis(self):
        """Get overall emotion analysis for the session"""
        if len(self.session_emotions) == 0:
            return {
                'overall_emotion': 'Unknown',
                'average_confidence': 0,
                'status': 'No Data',
                'emotion_distribution': {},
                'positive_ratio': 0,
                'negative_ratio': 0,
                'neutral_ratio': 0,
                'total_frames': 0,
                'face_detected_count': self.face_detected_count,
                'face_not_detected_count': self.face_not_detected_count,
                'detection_rate': 0,
                'model_loaded': False,
                'method': 'OpenCV' if OPENCV_AVAILABLE else 'Limited'
            }
        
        emotion_counts = Counter(self.session_emotions)
        total = len(self.session_emotions)
        
        positive_emotions = ['Happy', 'Surprised']
        negative_emotions = ['Angry', 'Fearful', 'Sad']
        neutral_emotions = ['Neutral']
        
        positive_count = sum(emotion_counts.get(e, 0) for e in positive_emotions)
        negative_count = sum(emotion_counts.get(e, 0) for e in negative_emotions)
        neutral_count = sum(emotion_counts.get(e, 0) for e in neutral_emotions)
        
        most_common_emotion = emotion_counts.most_common(1)[0][0]
        avg_confidence = np.mean(self.session_confidences) if self.session_confidences and self.session_confidences else 0
        
        total_frames = self.face_detected_count + self.face_not_detected_count
        detection_rate = (self.face_detected_count / total_frames * 100) if total_frames > 0 else 0
        
        if most_common_emotion in positive_emotions and avg_confidence > 60:
            status = "Excellent - Positive & Confident"
        elif most_common_emotion in positive_emotions:
            status = "Good - Positive"
        elif most_common_emotion in negative_emotions:
            status = "Needs Improvement - Showing Stress/Anxiety"
        else:
            status = "Moderate - Room for Improvement"
        
        return {
            'overall_emotion': most_common_emotion,
            'average_confidence': round(avg_confidence, 2),
            'status': status,
            'emotion_distribution': dict(emotion_counts),
            'positive_ratio': round(positive_count / total * 100, 2) if total > 0 else 0,
            'negative_ratio': round(negative_count / total * 100, 2) if total > 0 else 0,
            'neutral_ratio': round(neutral_count / total * 100, 2) if total > 0 else 0,
            'total_frames': total,
            'face_detected_count': self.face_detected_count,
            'face_not_detected_count': self.face_not_detected_count,
            'detection_rate': round(detection_rate, 2),
            'recent_emotions': self.session_emotions[-20:],
            'model_loaded': False,
            'method': 'OpenCV' if OPENCV_AVAILABLE else 'Limited',
            'status_code': 'GOOD' if most_common_emotion in positive_emotions else 'NEEDS_IMPROVEMENT'
        }
    
    def reset_session(self):
        """Reset session data for new interview"""
        self.session_emotions = []
        self.session_confidences = []
        self.face_detected_count = 0
        self.face_not_detected_count = 0
        self.emotion_history = []
        logger.info("Emotion session reset")
        return {'success': True, 'message': 'Session reset successfully'}

# For testing
if __name__ == "__main__":
    print("=" * 50)
    print("Testing EmotionDetector")
    print("=" * 50)
    detector = EmotionDetector()
    print(f"✅ OpenCV available: {OPENCV_AVAILABLE}")
    print(f"✅ Method: {'OpenCV' if OPENCV_AVAILABLE else 'Limited mode'}")
    print("\n✅ EmotionDetector ready!")
    print("=" * 50)