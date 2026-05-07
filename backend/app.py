from flask import Flask, request, jsonify, session
from emotion_detector import EmotionDetector
from flask_cors import CORS
import os
import base64
import tempfile
import cv2
import numpy as np
from database import *
from question_bank import get_questions_by_role, get_all_roles, analyze_answer_simple
from audio_analyzer import AudioAnalyzer
import uuid

app = Flask(__name__)
app.secret_key = "your-secret-key-change-this"
CORS(app, supports_credentials=True)

audio_analyzer = AudioAnalyzer()
emotion_detector = EmotionDetector()




# Initialize database
init_database()

@app.route("/")
def home():
    return "AI Interview Backend Running 🚀"

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    success = register_user(data['username'], data['email'], data['password'])
    if success:
        return jsonify({"success": True, "message": "User registered successfully"})
    return jsonify({"success": False, "message": "Username or email already exists"}), 400



@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = login_user(data['username'], data['password'])
    if user:
        session['user_id'] = user[0]
        session['username'] = user[1]
        return jsonify({"success": True, "user_id": user[0], "username": user[1]})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401



@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True})



@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({"authenticated": True, "user_id": session['user_id'], "username": session['username']})
    return jsonify({"authenticated": False})



@app.route('/api/roles', methods=['GET'])
def get_roles():
    return jsonify({"roles": get_all_roles()})



@app.route('/api/questions', methods=['POST'])
def get_questions():
    data = request.json
    role = data.get('role', 'general')
    questions = get_questions_by_role(role)
    # Return only first 5 questions for interview
    return jsonify({"questions": questions[:5]})



@app.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """Detect emotion from camera image"""
    data = request.json
    image_data = data.get('image', '')
    
    if not image_data:
        return jsonify({"error": "No image data"}), 400
    
    result = emotion_detector.detect_emotion_from_image(image_data)
    return jsonify(result)




@app.route('/api/emotion-analysis', methods=['GET'])
def get_emotion_analysis():
    """Get overall emotion analysis for current session"""
    analysis = emotion_detector.get_session_analysis()
    return jsonify(analysis)



@app.route('/api/reset-emotion-session', methods=['POST'])
def reset_emotion_session():
    """Reset emotion tracking for new interview"""
    emotion_detector.reset_session()
    return jsonify({"success": True, "message": "Emotion session reset"})



# backend/app.py - Update the analyze_answer function

@app.route('/api/analyze-answer', methods=['POST'])
def analyze_answer():
    data = request.json
    question_data = data['question_data']
    answer_text = data.get('answer_text', '')
    
    # If audio is provided
    if 'audio_data' in data:
        audio_data = base64.b64decode(data['audio_data'])
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            f.write(audio_data)
            temp_path = f.name
        
        # Transcribe and analyze audio quality
        answer_text, success = audio_analyzer.transcribe_audio(temp_path)
        audio_quality = audio_analyzer.analyze_audio_quality(temp_path)
        os.unlink(temp_path)
    else:
        audio_quality = {'quality_score': 1.0, 'feedback': 'Text input used', 'is_good': True}
    
    # Analyze answer content
    analysis = analyze_answer_simple(question_data, answer_text)
    
    # Calculate clarity (handle the return values properly)
    clarity_result = audio_analyzer.calculate_speech_clarity(answer_text)
    
    # Check if the result is a tuple or just a score
    if isinstance(clarity_result, tuple) and len(clarity_result) == 2:
        clarity_score, clarity_feedback = clarity_result
    else:
        clarity_score = clarity_result if isinstance(clarity_result, (int, float)) else 0.5
        clarity_feedback = "Clarity analysis completed."
    
    return jsonify({
        "transcript": answer_text,
        "score": analysis['score'],
        "feedback": analysis['feedback'],
        "matched_keywords": analysis['matched_keywords'],
        "keyword_score": analysis['keyword_score'],
        "confidence_score": analysis['confidence_score'],
        "clarity_score": clarity_score,
        "clarity_feedback": clarity_feedback,
        "audio_quality": audio_quality
    })



@app.route('/api/save-interview', methods=['POST'])
def save_interview():
    data = request.json
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    session_id = save_interview_session(
        user_id,
        data['role'],
        data['overall_score'],
        data['overall_feedback'],
        data['transcript'],
        data.get('audio_quality', 0.8),
        data.get('camera_score', 0.8),
        data['questions_data']
    )
    return jsonify({"success": True, "session_id": session_id})



@app.route('/api/session/<int:session_id>', methods=['GET'])
def get_session(session_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    session_data = get_session_details(session_id)
    return jsonify(session_data)



@app.route('/api/user-sessions', methods=['GET'])
def user_sessions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    sessions = get_user_sessions(user_id)
    return jsonify({"sessions": [{"id": s[0], "date": str(s[1]), "score": s[2], "role": s[3]} for s in sessions]})



@app.route('/api/test-mic', methods=['POST'])
def test_mic():
    """Test microphone and analyze audio quality"""
    try:
        data = request.json
        audio_data = data.get('audio_data', '')
        
        if not audio_data:
            return jsonify({"success": False, "message": "No audio data received"}), 400
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data)
        
        # Save temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name
        
        # Analyze audio quality
        audio_quality = audio_analyzer.analyze_audio_quality(temp_path)
        
        # Transcribe the audio
        transcript, success = audio_analyzer.transcribe_audio(temp_path)
        
        # Clean up
        os.unlink(temp_path)
        
        return jsonify({
            "success": success,
            "test_text": transcript if transcript and len(transcript) > 0 else "Speech detected but not clear. Please speak louder and clearer.",
            "quality_score": audio_quality['quality_score'],
            "volume_level": audio_quality['volume_level'],
            "snr": audio_quality.get('snr', 0),
            "feedback": audio_quality['feedback'],
            "is_good": audio_quality['is_good']
        })
        
    except Exception as e:
        print(f"Mic test error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/check-mic-permission', methods=['GET'])
def check_mic_permission():
    """Check if microphone is available and permissions are granted"""
    try:
        import pyaudio
        
        p = pyaudio.PyAudio()
        device_count = p.get_device_count()
        has_input_device = False
        
        for i in range(device_count):
            device_info = p.get_device_info_by_index(i)
            if device_info.get('maxInputChannels') > 0:
                has_input_device = True
                break
        
        p.terminate()
        
        if has_input_device:
            return jsonify({"available": True, "message": "Microphone device found"})
        else:
            return jsonify({"available": False, "message": "No microphone device found"}), 400
            
    except Exception as e:
        return jsonify({"available": False, "message": str(e)}), 500

@app.route('/api/detect-face', methods=['POST'])
def detect_face():
    data = request.json
    image_data = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    # Load face cascade
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    # Analyze eye contact
    eye_contact_score = 0
    if len(faces) > 0:
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 5)
            eye_contact_score = min(1.0, len(eyes) * 0.4)
    
    # Camera quality assessment
    height, width = img.shape[:2]
    camera_quality = min(1.0, (width * height) / (1920 * 1080))
    
    return jsonify({
        "face_detected": len(faces) > 0,
        "num_faces": len(faces),
        "eye_contact_score": eye_contact_score,
        "camera_quality": camera_quality,
        "feedback": "Camera working well!" if len(faces) > 0 else "No face detected. Please ensure you're looking at the camera."
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)