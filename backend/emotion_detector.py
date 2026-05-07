# backend/emotion_detector.py
import cv2
import numpy as np
import base64
from collections import Counter
import os

class EmotionDetector:
    def __init__(self):
        self.emotion_dict = {
            0: "Angry", 1: "Disgusted", 2: "Fearful",
            3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"
        }
        
        # Face detector
        face_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_detector = cv2.CascadeClassifier(face_path)
        
        # Load emotion detection model
        model_path = r"C:\MY FILES\project\emotion\New folder\emotion_model.keras"
        
        # If model exists, load it
        if os.path.exists(model_path):
            try:
                from tensorflow.keras.models import load_model
                self.model = load_model(model_path)
                self.model_loaded = True
                print("✅ Emotion detection model loaded successfully!")
            except Exception as e:
                print(f"⚠️ Could not load emotion model: {e}")
                self.model_loaded = False
        else:
            print(f"⚠️ Emotion model not found at: {model_path}")
            self.model_loaded = False
        
        # Store session data
        self.session_emotions = []
        self.session_confidences = []
        
    def detect_emotion_from_image(self, image_data):
        """Detect emotion from base64 image data"""
        if not self.model_loaded:
            return self._get_fallback_emotion()
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return self._get_fallback_emotion()
            
            # Convert to grayscale
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_detector.detectMultiScale(gray_frame, 1.3, 5)
            
            if len(faces) == 0:
                return self._get_fallback_emotion(no_face=True)
            
            # Get the first face
            (x, y, w, h) = faces[0]
            roi = gray_frame[y:y+h, x:x+w]
            roi = cv2.resize(roi, (48, 48))
            roi = roi / 255.0
            roi = np.reshape(roi, (1, 48, 48, 1))
            
            # Predict emotion
            preds = self.model.predict(roi, verbose=0)
            max_index = int(np.argmax(preds))
            confidence = float(np.max(preds)) * 100
            emotion = self.emotion_dict[max_index]
            
            # Store for session analysis
            self.session_emotions.append(emotion)
            self.session_confidences.append(confidence)
            
            return {
                'emotion': emotion,
                'confidence': round(confidence, 2),
                'all_emotions': self.session_emotions[-10:],  # Last 10 for real-time
                'face_detected': True
            }
            
        except Exception as e:
            print(f"Emotion detection error: {e}")
            return self._get_fallback_emotion()
    
    def _get_fallback_emotion(self, no_face=False):
        """Return fallback emotion data"""
        if no_face:
            return {
                'emotion': 'No Face',
                'confidence': 0,
                'all_emotions': self.session_emotions[-10:],
                'face_detected': False
            }
        return {
            'emotion': 'Neutral',
            'confidence': 50,
            'all_emotions': self.session_emotions[-10:],
            'face_detected': True
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
                'total_frames': 0
            }
        
        # Count emotions
        emotion_counts = Counter(self.session_emotions)
        total = len(self.session_emotions)
        
        # Calculate ratios
        positive_emotions = ['Happy', 'Surprised']
        negative_emotions = ['Angry', 'Disgusted', 'Fearful', 'Sad']
        neutral_emotions = ['Neutral']
        
        positive_count = sum(emotion_counts.get(e, 0) for e in positive_emotions)
        negative_count = sum(emotion_counts.get(e, 0) for e in negative_emotions)
        neutral_count = sum(emotion_counts.get(e, 0) for e in neutral_emotions)
        
        most_common_emotion = emotion_counts.most_common(1)[0][0]
        avg_confidence = np.mean(self.session_confidences) if self.session_confidences else 0
        
        # Determine status
        if avg_confidence > 80 and most_common_emotion in positive_emotions:
            status = "Excellent - Highly Confident & Positive"
        elif avg_confidence > 70:
            status = "Good - Confident"
        elif most_common_emotion in negative_emotions:
            status = "Needs Improvement - Showing Stress/Anxiety"
        elif avg_confidence < 50:
            status = "Low Confidence - Need More Preparation"
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
            'recent_emotions': self.session_emotions[-20:]  # Last 20 for trend
        }
    
    def reset_session(self):
        """Reset session data for new interview"""
        self.session_emotions = []
        self.session_confidences = []