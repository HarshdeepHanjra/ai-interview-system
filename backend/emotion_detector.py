# backend/emotion_detector.py - No TensorFlow required!
import cv2
import numpy as np
import base64
from collections import Counter
import os
import logging
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionDetector:
    def __init__(self):
        """Initialize EmotionDetector without TensorFlow"""
        self.emotion_dict = {
            0: "Neutral", 1: "Happy", 2: "Sad", 
            3: "Surprised", 4: "Angry", 5: "Fearful"
        }
        
        # Face detector
        try:
            face_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            if os.path.exists(face_path):
                self.face_detector = cv2.CascadeClassifier(face_path)
                logger.info("✅ Face detector loaded successfully")
            else:
                self.face_detector = None
                logger.warning("Face detector not found")
        except Exception as e:
            logger.error(f"Error loading face detector: {e}")
            self.face_detector = None
        
        # Eye detector for better emotion analysis
        try:
            eye_path = cv2.data.haarcascades + "haarcascade_eye.xml"
            if os.path.exists(eye_path):
                self.eye_detector = cv2.CascadeClassifier(eye_path)
            else:
                self.eye_detector = None
        except Exception:
            self.eye_detector = None
        
        # Mouth detector for smile detection
        self.mouth_cascade = None
        try:
            # Try to load mouth cascade if available
            mouth_path = cv2.data.haarcascades + "haarcascade_smile.xml"
            if os.path.exists(mouth_path):
                self.mouth_cascade = cv2.CascadeClassifier(mouth_path)
        except Exception:
            self.mouth_cascade = None
        
        # Store session data
        self.session_emotions = []
        self.session_confidences = []
        self.face_detected_count = 0
        self.face_not_detected_count = 0
        self.emotion_history = []
        
        # No TensorFlow model
        self.model_loaded = False
        self.model = None
        logger.info("EmotionDetector initialized (No TensorFlow required)")

    def detect_emotion_from_image(self, image_data):
        """Detect emotion from base64 image using OpenCV only"""
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
            if self.face_detector is not None:
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
            
            # Keep only last 1000 entries to prevent memory issues
            if len(self.session_emotions) > 1000:
                self.session_emotions = self.session_emotions[-1000:]
                self.session_confidences = self.session_confidences[-1000:]
            
            return {
                'emotion': emotion_data['emotion'],
                'confidence': round(emotion_data['confidence'], 2),
                'all_emotions': self.session_emotions[-10:],
                'face_detected': False,
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
        try:
            (x, y, w, h) = face
            
            # Extract face ROI
            face_roi = gray_frame[y:y+h, x:x+w]
            face_color = frame[y:y+h, x:x+w]
            
            # Initialize emotion scores
            scores = {
                'happy': 0,
                'sad': 0,
                'angry': 0,
                'surprised': 0,
                'neutral': 0,
                'fearful': 0
            }
            
            # 1. Check for smile using mouth analysis
            smile_detected = False
            if self.mouth_cascade is not None:
                try:
                    mouth_roi = gray_frame[y+int(h*0.6):y+h, x+int(w*0.2):x+int(w*0.8)]
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
            
            # 2. Analyze mouth shape using contours
            try:
                mouth_roi = gray_frame[y+int(h*0.6):y+h, x+int(w*0.2):x+int(w*0.8)]
                if mouth_roi.size > 0:
                    # Threshold for mouth detection
                    _, thresh = cv2.threshold(mouth_roi, 50, 255, cv2.THRESH_BINARY_INV)
                    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    
                    if contours:
                        # Find largest contour (mouth)
                        mouth_contour = max(contours, key=cv2.contourArea)
                        area = cv2.contourArea(mouth_contour)
                        perimeter = cv2.arcLength(mouth_contour, True)
                        
                        if perimeter > 0:
                            # Mouth opening ratio
                            mouth_open_ratio = area / (perimeter * perimeter)
                            
                            if mouth_open_ratio > 0.15:
                                scores['surprised'] += 0.3
                                scores['happy'] += 0.2
                            elif mouth_open_ratio > 0.08:
                                scores['neutral'] += 0.2
                            else:
                                # Closed mouth could be sad or angry
                                scores['sad'] += 0.2
                                scores['angry'] += 0.1
            except Exception:
                pass
            
            # 3. Analyze eyebrow position (simple estimation)
            try:
                # Detect eyes
                eyes = []
                if self.eye_detector is not None:
                    eyes = self.eye_detector.detectMultiScale(
                        gray_frame[y:y+h, x:x+w], 
                        scaleFactor=1.1, 
                        minNeighbors=5,
                        minSize=(20, 20)
                    )
                
                if len(eyes) >= 2:
                    # Sort eyes by x position
                    eyes = sorted(eyes, key=lambda e: e[0])
                    eye1_y = eyes[0][1]
                    eye2_y = eyes[1][1]
                    avg_eye_y = (eye1_y + eye2_y) / 2
                    
                    # Check if eyes are wide open (surprise)
                    eye_height_avg = (eyes[0][3] + eyes[1][3]) / 2
                    if eye_height_avg > 20:  # Large eyes might indicate surprise
                        scores['surprised'] += 0.2
                    
                    # Check for squinting (anger or concentration)
                    if eye_height_avg < 12:
                        scores['angry'] += 0.2
                        scores['neutral'] += 0.1
                    
                    # Eye position relative to face (for emotion detection)
                    eye_y_ratio = avg_eye_y / h
                    if eye_y_ratio < 0.3:  # High eyebrows - surprise or fear
                        scores['surprised'] += 0.2
                        scores['fearful'] += 0.1
            except Exception:
                pass
            
            # 4. Analyze head tilt (rough estimation)
            try:
                # Simple head tilt detection using face boundaries
                # This is a very basic approximation
                face_center_x = x + w/2
                if face_center_x < frame.shape[1] * 0.4:
                    scores['neutral'] += 0.1
                elif face_center_x > frame.shape[1] * 0.6:
                    scores['neutral'] += 0.1
            except Exception:
                pass
            
            # 5. Eye contact score
            eye_contact_score = 0
            if len(eyes) >= 2:
                # Basic eye contact - looking straight at camera
                eye_center_x = (eyes[0][0] + eyes[1][0] + eyes[0][2] + eyes[1][2]) / 4
                face_center_x = w / 2
                eye_contact_score = max(0, 1 - abs(eye_center_x - face_center_x) / (w/2))
                eye_contact_score = min(1, eye_contact_score)
            
            # 6. Combine scores to determine emotion
            # Apply weights based on detected features
            scores['happy'] += 0.1 if smile_detected else 0
            
            # Normalize scores
            total_score = sum(scores.values())
            if total_score > 0:
                scores = {k: v/total_score for k, v in scores.items()}
            else:
                scores = {'neutral': 1.0}
            
            # Determine dominant emotion
            emotion = max(scores, key=scores.get)
            confidence = scores[emotion] * 70 + 30  # Scale to 30-100%
            
            # Map to emotion dictionary
            emotion_map = {
                'happy': 'Happy',
                'sad': 'Sad',
                'angry': 'Angry',
                'surprised': 'Surprised',
                'neutral': 'Neutral',
                'fearful': 'Fearful'
            }
            
            return {
                'emotion': emotion_map.get(emotion, 'Neutral'),
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
        
        # Use most recent emotion if available
        if self.session_emotions:
            emotion = self.session_emotions[-1]
            confidence = 50.0
            return {
                'emotion': emotion,
                'confidence': confidence,
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
                'method': 'OpenCV'
            }
        
        # Count emotions
        emotion_counts = Counter(self.session_emotions)
        total = len(self.session_emotions)
        
        # Calculate ratios
        positive_emotions = ['Happy', 'Surprised']
        negative_emotions = ['Angry', 'Fearful', 'Sad']
        neutral_emotions = ['Neutral']
        
        positive_count = sum(emotion_counts.get(e, 0) for e in positive_emotions)
        negative_count = sum(emotion_counts.get(e, 0) for e in negative_emotions)
        neutral_count = sum(emotion_counts.get(e, 0) for e in neutral_emotions)
        
        most_common_emotion = emotion_counts.most_common(1)[0][0]
        avg_confidence = np.mean(self.session_confidences) if self.session_confidences else 0
        
        # Calculate detection rate
        total_frames = self.face_detected_count + self.face_not_detected_count
        detection_rate = (self.face_detected_count / total_frames * 100) if total_frames > 0 else 0
        
        # Determine status
        if most_common_emotion in positive_emotions and avg_confidence > 60:
            status = "Excellent - Positive & Confident"
        elif most_common_emotion in positive_emotions:
            status = "Good - Positive"
        elif most_common_emotion in negative_emotions:
            status = "Needs Improvement - Showing Stress/Anxiety"
        elif avg_confidence < 40:
            status = "Low Confidence - Need More Preparation"
        elif detection_rate < 50:
            status = "Poor Face Detection - Please face the camera"
        else:
            status = "Moderate - Room for Improvement"
        
        return {
            'overall_emotion': most_common_emotion,
            'average_confidence': round(avg_confidence, 2),
            'status': status,
            'emotion_distribution': dict(emotion_counts),
            'positive_ratio': round(positive_count / total * 100, 2),
            'negative_ratio': round(negative_count / total * 100, 2),
            'neutral_ratio': round(neutral_count / total * 100, 2),
            'total_frames': total,
            'face_detected_count': self.face_detected_count,
            'face_not_detected_count': self.face_not_detected_count,
            'detection_rate': round(detection_rate, 2),
            'recent_emotions': self.session_emotions[-20:],
            'model_loaded': False,
            'method': 'OpenCV-based emotion detection',
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
    
    def get_current_emotion(self):
        """Get the most recent emotion"""
        if self.session_emotions:
            return {
                'emotion': self.session_emotions[-1],
                'confidence': self.session_confidences[-1] if self.session_confidences else 50,
                'recent': self.session_emotions[-10:] if len(self.session_emotions) >= 10 else self.session_emotions
            }
        return {
            'emotion': 'Unknown',
            'confidence': 0,
            'recent': []
        }
    
    def get_emotion_timeline(self):
        """Get emotion timeline for visualization"""
        if len(self.session_emotions) == 0:
            return []
        
        timeline = []
        step = max(1, len(self.session_emotions) // 20)  # Max 20 points
        
        for i in range(0, len(self.session_emotions), step):
            timeline.append({
                'index': i,
                'emotion': self.session_emotions[i],
                'confidence': self.session_confidences[i] if i < len(self.session_confidences) else 50
            })
        
        return timeline

# For testing
if __name__ == "__main__":
    print("=" * 50)
    print("Testing EmotionDetector (No TensorFlow)")
    print("=" * 50)
    
    # Test initialization
    detector = EmotionDetector()
    print(f"✅ Model loaded: {detector.model_loaded}")
    print(f"✅ Face detector: {detector.face_detector is not None}")
    print(f"✅ Eye detector: {detector.eye_detector is not None}")
    print(f"✅ Method: OpenCV-based emotion detection")
    
    # Test session analysis
    analysis = detector.get_session_analysis()
    print(f"\n📊 Session Analysis: {analysis}")
    
    print("\n✅ EmotionDetector ready! No TensorFlow required!")
    print("=" * 50)