# backend/app.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import base64
import tempfile
import logging
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this')

# =============================================
# SESSION CONFIGURATION - FIXED
# =============================================
app.config.update(
    SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    SESSION_COOKIE_DOMAIN=None,
    SESSION_COOKIE_PATH='/',
    SESSION_TYPE='filesystem'  # This helps persist sessions
)

# =============================================
# CORS CONFIGURATION - FIXED
# =============================================
CORS(app, 
     supports_credentials=True, 
     origins=[
         'http://localhost:3000',
         'http://localhost:5000',
         'https://ai-interview-system-one-wheat.vercel.app',
         'https://ai-interview-frontend.vercel.app',
         'https://ai-interview-system.vercel.app',
         'https://*.vercel.app',
         'https://*.onrender.com'
     ],
     allow_headers=['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     expose_headers=['Content-Type', 'Authorization'])

# =============================================
# MANUAL CORS HEADERS - FIXED
# =============================================
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    allowed_origins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://ai-interview-system-one-wheat.vercel.app',
        'https://ai-interview-frontend.vercel.app',
        'https://ai-interview-system.vercel.app'
    ]
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle preflight requests
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'message': 'OK'})
    origin = request.headers.get('Origin')
    allowed_origins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://ai-interview-system-one-wheat.vercel.app',
        'https://ai-interview-frontend.vercel.app',
        'https://ai-interview-system.vercel.app'
    ]
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

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
            # Set session
            session['user_id'] = user['id']
            session['username'] = user['username']
            session.permanent = True
            
            logger.info(f"User logged in: {username} (ID: {user['id']})")
            logger.info(f"Session contents: {dict(session)}")
            
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
    
    logger.info(f"Session contents: {dict(session)}")
    
    if 'user_id' in session:
        return jsonify({
            "authenticated": True, 
            "user_id": session['user_id'], 
            "username": session['username']
        })
    return jsonify({"authenticated": False})

# ... rest of your routes (keep them same)

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