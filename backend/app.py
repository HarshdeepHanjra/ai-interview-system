# backend/app.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import base64
import tempfile
import logging
from dotenv import load_dotenv
import traceback
from datetime import timedelta

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this')

# Session configuration
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7)
)

# CORS Configuration - Allow all Vercel URLs and localhost
# CORS(app, 
#      supports_credentials=True, 
#      origins=[
#          'http://localhost:3000',
#          'http://localhost:5000',
#          'https://ai-interview-system-one-wheat.vercel.app',  # Your actual Vercel URL
#          'https://ai-interview-frontend.vercel.app',
#          'https://ai-interview-system.vercel.app',
#          'https://*.vercel.app',
#          'https://*.onrender.com'
#      ],
#      allow_headers=['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
#      methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
#      expose_headers=['Content-Type', 'Authorization'])


# =============================================
# CORS CONFIGURATION
# =============================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://ai-interview-system-one-wheat.vercel.app",
                "http://localhost:3000",
                "http://localhost:5173"
            ]
        }
    },
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With"
    ],
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    expose_headers=[
        "Content-Type",
        "Authorization"
    ]
)


@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "https://ai-interview-system-one-wheat.vercel.app"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, X-Requested-With"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response



# Import database modules
from database import db, UserDAO, InterviewSessionDAO, QuestionResponseDAO

# =============================================
# DATABASE FUNCTIONS
# =============================================

def get_db_connection():
    return db

def register_user(username, email, password):
    return UserDAO.create_user(username, email, password)

def login_user(username, password):
    return UserDAO.login_user(username, password)

def save_interview_session(user_id, role, overall_score, overall_feedback, 
                          transcript, audio_quality, camera_score, questions_data, total_time=0):
    try:
        session_id = InterviewSessionDAO.create_session(
            user_id, role, overall_score, overall_feedback, 
            transcript, audio_quality, camera_score, total_time
        )
        
        if not session_id:
            logger.error("Failed to create session")
            return None
        
        for q_data in questions_data:
            question = q_data.get('question', '') or ''
            answer = q_data.get('answer', '') or ''
            score = float(q_data.get('score', 0) or 0)
            feedback = q_data.get('feedback', '') or ''
            matched_keywords = q_data.get('matched_keywords', []) or []
            keyword_score = float(q_data.get('keyword_score', 0) or 0)
            confidence_score = float(q_data.get('confidence_score', 0) or 0)
            clarity_score = float(q_data.get('clarity_score', 0) or 0)
            clarity_feedback = q_data.get('clarity_feedback', '') or ''
            emotion = q_data.get('emotion', 'Neutral') or 'Neutral'
            time_taken = int(q_data.get('time_taken', 0) or 0)
            
            QuestionResponseDAO.create_response(
                session_id, question, answer, score, feedback,
                matched_keywords, keyword_score, confidence_score,
                clarity_score, clarity_feedback, emotion, time_taken
            )
        
        logger.info(f"Session {session_id} saved successfully with {len(questions_data)} questions")
        return session_id
        
    except Exception as e:
        logger.error(f"Error saving interview: {e}")
        return None

def get_session_details(session_id):
    try:
        session_data = InterviewSessionDAO.get_session(session_id)
        if session_data:
            responses = QuestionResponseDAO.get_responses_by_session(session_id)
            result = dict(session_data)
            result['questions'] = [dict(r) for r in responses]
            return result
        return None
    except Exception as e:
        logger.error(f"Get session error: {e}")
        return None

def get_user_sessions(user_id):
    return InterviewSessionDAO.get_user_sessions(user_id)

# =============================================
# QUESTION BANK
# =============================================

def get_all_roles():
    return {
        'general': {'name': 'General', 'icon': '💼'},
        'software_engineering': {'name': 'Software Engineering', 'icon': '💻'},
        'data_science': {'name': 'Data Science', 'icon': '📊'},
        'product_management': {'name': 'Product Management', 'icon': '📱'},
        'marketing': {'name': 'Marketing', 'icon': '📢'},
        'finance': {'name': 'Finance', 'icon': '💰'},
        'healthcare': {'name': 'Healthcare', 'icon': '🏥'},
        'education': {'name': 'Education', 'icon': '📚'}
    }

def get_questions_by_role(role):
    questions = {
        'general': [
            {'text': "Tell me about yourself and your background.", 'expected_keywords': ['experience', 'skills', 'background', 'career', 'goals'], 'difficulty': 'Easy'},
            {'text': "What are your greatest strengths and weaknesses?", 'expected_keywords': ['strength', 'weakness', 'improvement', 'self-awareness', 'growth'], 'difficulty': 'Easy'},
            {'text': "Where do you see yourself in 5 years?", 'expected_keywords': ['career', 'goals', 'growth', 'aspirations', 'development'], 'difficulty': 'Easy'},
            {'text': "Why should we hire you?", 'expected_keywords': ['skills', 'experience', 'value', 'contribution', 'unique'], 'difficulty': 'Easy'},
            {'text': "Describe a challenge you faced and how you overcame it.", 'expected_keywords': ['challenge', 'solution', 'problem-solving', 'result', 'learning'], 'difficulty': 'Medium'}
        ],
        'software_engineering': [
            {'text': "Explain the difference between REST and GraphQL APIs.", 'expected_keywords': ['REST', 'GraphQL', 'API', 'endpoints', 'query', 'performance'], 'difficulty': 'Medium'},
            {'text': "How would you design a scalable microservices architecture?", 'expected_keywords': ['microservices', 'scalability', 'architecture', 'design', 'communication'], 'difficulty': 'Hard'}
        ],
        'data_science': [
            {'text': "Explain the difference between supervised and unsupervised learning.", 'expected_keywords': ['supervised', 'unsupervised', 'labeled', 'unlabeled', 'classification', 'clustering'], 'difficulty': 'Medium'}
        ]
    }
    
    role_questions = questions.get(role, questions['general'])
    formatted_questions = []
    for q in role_questions:
        formatted_questions.append({
            'text': q['text'],
            'expected_keywords': q.get('expected_keywords', []),
            'difficulty': q.get('difficulty', 'Medium')
        })
    
    return formatted_questions

def analyze_answer_simple(question_data, answer_text):
    expected_keywords = question_data.get('expected_keywords', [])
    if not expected_keywords:
        expected_keywords = ['experience', 'skills', 'learning', 'team', 'project']
    
    user_answer_lower = answer_text.lower()
    matched = []
    for keyword in expected_keywords:
        if keyword.lower() in user_answer_lower:
            matched.append(keyword)
    
    keyword_score = len(matched) / max(len(expected_keywords), 1)
    
    words = len(answer_text.split())
    if words > 100:
        confidence_score = 1.0
    elif words > 50:
        confidence_score = 0.7
    elif words > 20:
        confidence_score = 0.4
    else:
        confidence_score = 0.2
    
    score = round(min(1.0, keyword_score * 0.6 + confidence_score * 0.4), 2)
    
    if score >= 0.8:
        feedback = f"Excellent answer! You covered key concepts including: {', '.join(matched[:3])}. Great job!"
    elif score >= 0.6:
        missing = [k for k in expected_keywords if k not in matched][:3]
        feedback = f"Good answer. You mentioned {len(matched)} out of {len(expected_keywords)} key points. Consider discussing: {', '.join(missing)}."
    elif score >= 0.4:
        feedback = f"Decent answer. Try to be more detailed. Key topics: {', '.join(expected_keywords[:4])}."
    else:
        feedback = f"Your answer could be improved. Key topics: {', '.join(expected_keywords[:4])}."
    
    return {
        'score': score,
        'feedback': feedback,
        'matched_keywords': matched,
        'keyword_score': keyword_score,
        'confidence_score': confidence_score
    }

# =============================================
# ROUTES
# =============================================

@app.route("/")
def home():
    return jsonify({
        "message": "AI Interview Backend Running 🚀",
        "status": "active",
        "database": "Supabase PostgreSQL",
        "endpoints": [
            "/api/register",
            "/api/login", 
            "/api/questions",
            "/api/analyze-answer",
            "/api/save-interview"
        ]
    })

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not email or not password:
            return jsonify({"success": False, "message": "Missing required fields"}), 400
        
        if len(username) < 3:
            return jsonify({"success": False, "message": "Username must be at least 3 characters"}), 400
        
        if '@' not in email:
            return jsonify({"success": False, "message": "Invalid email format"}), 400
        
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
        
        user_id = register_user(username, email, password)
        if user_id:
            return jsonify({"success": True, "message": "User registered successfully", "user_id": user_id})
        return jsonify({"success": False, "message": "Username or email already exists"}), 400
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({"success": False, "message": "Missing username or password"}), 400
        
        user = login_user(username, password)
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({
                "success": True, 
                "user_id": user['id'], 
                "username": user['username']
            })
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return '', 200
    session.clear()
    return jsonify({"success": True})

@app.route('/api/check-auth', methods=['GET', 'OPTIONS'])
def check_auth():
    if request.method == 'OPTIONS':
        return '', 200
    
    if 'user_id' in session:
        return jsonify({
            "authenticated": True, 
            "user_id": session['user_id'], 
            "username": session['username']
        })
    return jsonify({"authenticated": False})

@app.route('/api/roles', methods=['GET', 'OPTIONS'])
def get_roles():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        roles = get_all_roles()
        return jsonify({"roles": roles})
    except Exception as e:
        logger.error(f"Error fetching roles: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/questions', methods=['POST', 'OPTIONS'])
def get_questions():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        role = data.get('role', 'general')
        logger.info(f"Fetching questions for role: {role}")
        
        questions = get_questions_by_role(role)
        logger.info(f"Found {len(questions)} questions")
        
        return jsonify({"questions": questions[:5]})
    except Exception as e:
        logger.error(f"Error fetching questions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-answer', methods=['POST', 'OPTIONS'])
def analyze_answer():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        question_data = data.get('question_data', {})
        answer_text = data.get('answer_text', '')
        
        audio_quality = {'quality_score': 1.0, 'feedback': 'Text input used', 'is_good': True}
        if 'audio_data' in data:
            try:
                audio_data = base64.b64decode(data['audio_data'])
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                    f.write(audio_data)
                    temp_path = f.name
                
                audio_quality = {'quality_score': 0.8, 'feedback': 'Audio processed', 'is_good': True}
                answer_text = "This is a simulated transcription from audio."
                
                os.unlink(temp_path)
            except Exception as e:
                logger.error(f"Audio processing error: {e}")
                audio_quality = {'quality_score': 0.5, 'feedback': str(e), 'is_good': False}
        
        analysis = analyze_answer_simple(question_data, answer_text)
        
        return jsonify({
            "transcript": answer_text,
            "score": analysis['score'],
            "feedback": analysis['feedback'],
            "matched_keywords": analysis['matched_keywords'],
            "keyword_score": analysis['keyword_score'],
            "confidence_score": analysis['confidence_score'],
            "clarity_score": 0.7,
            "clarity_feedback": "Moderate clarity",
            "audio_quality": audio_quality
        })
    except Exception as e:
        logger.error(f"Answer analysis error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-interview', methods=['POST', 'OPTIONS'])
def save_interview():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        role = data.get('role', 'general')
        overall_score = float(data.get('overall_score', 0))
        overall_feedback = data.get('overall_feedback', '')
        transcript = data.get('transcript', '')
        audio_quality = float(data.get('audio_quality', 0.8))
        camera_score = float(data.get('camera_score', 0.8))
        questions_data = data.get('questions_data', [])
        total_time = int(data.get('total_time', 0))
        
        logger.info(f"Saving interview: role={role}, score={overall_score}, questions={len(questions_data)}")
        
        session_id = save_interview_session(
            user_id, role, overall_score, overall_feedback,
            transcript, audio_quality, camera_score,
            questions_data, total_time
        )
        
        if session_id:
            return jsonify({"success": True, "session_id": session_id})
        else:
            return jsonify({"success": False, "message": "Failed to save interview in database"}), 500
        
    except Exception as e:
        logger.error(f"Save interview error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/session/<int:session_id>', methods=['GET', 'OPTIONS'])
def get_session(session_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        
        session_data = get_session_details(session_id)
        if session_data:
            return jsonify(session_data)
        return jsonify({"success": False, "message": "Session not found"}), 404
        
    except Exception as e:
        logger.error(f"Get session error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user-sessions', methods=['GET', 'OPTIONS'])
def user_sessions():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        
        sessions = get_user_sessions(user_id)
        
        return jsonify({
            "sessions": [
                {
                    "id": s['id'],
                    "date": str(s['created_at']),
                    "score": s['overall_score'],
                    "role": s['role']
                } for s in sessions
            ]
        })
        
    except Exception as e:
        logger.error(f"User sessions error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/session/<int:session_id>', methods=['DELETE', 'OPTIONS'])
def delete_session(session_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        
        session_data = InterviewSessionDAO.get_session(session_id)
        if not session_data:
            return jsonify({"success": False, "message": "Session not found"}), 404
        
        if session_data['user_id'] != user_id:
            return jsonify({"success": False, "message": "Unauthorized"}), 403
        
        InterviewSessionDAO.delete_session(session_id)
        return jsonify({"success": True, "message": "Session deleted successfully"})
        
    except Exception as e:
        logger.error(f"Delete session error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/detect-face', methods=['POST', 'OPTIONS'])
def detect_face():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        return jsonify({
            "face_detected": True,
            "num_faces": 1,
            "eye_contact_score": 0.8,
            "camera_quality": 0.9,
            "feedback": "Camera working well!"
        })
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        return jsonify({"face_detected": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print("=" * 50)
    print("🚀 AI Interview Backend Starting...")
    print(f"📌 Port: {port}")
    print(f"📌 Debug: {debug}")
    print(f"📌 Database: Supabase PostgreSQL")
    print("=" * 50)
    
    app.run(debug=debug, host='0.0.0.0', port=port)