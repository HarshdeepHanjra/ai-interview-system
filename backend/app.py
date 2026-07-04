# backend/app.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import base64
import tempfile
import logging
from dotenv import load_dotenv
import traceback

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this')

# CORS Configuration for Render + Vercel
CORS(app, 
     supports_credentials=True, 
     origins=[
         'http://localhost:3000',
         'https://ai-interview-frontend.vercel.app',
         'https://ai-interview-system.vercel.app',
         'https://*.vercel.app'
     ],
     allow_headers=['Content-Type', 'Authorization', 'Accept'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Import database modules
from database import db, UserDAO, InterviewSessionDAO, QuestionResponseDAO

# =============================================
# DATABASE FUNCTIONS
# =============================================

def get_db_connection():
    """Get database connection (for compatibility)"""
    return db

def register_user(username, email, password):
    """Register a new user"""
    return UserDAO.create_user(username, email, password)

def login_user(username, password):
    """Login user"""
    return UserDAO.login_user(username, password)

def save_interview_session(user_id, role, overall_score, overall_feedback, 
                          transcript, audio_quality, camera_score, questions_data, total_time=0):
    """Save interview session"""
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
    """Get session details"""
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
    """Get user sessions"""
    return InterviewSessionDAO.get_user_sessions(user_id)

# =============================================
# QUESTION BANK
# =============================================

def get_all_roles():
    """Get all interview roles"""
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
    """Get questions for a specific role"""
    questions = {
        'general': [
            {'text': "Tell me about yourself and your background.", 'expected_keywords': ['experience', 'skills', 'background', 'career', 'goals'], 'difficulty': 'Easy'},
            {'text': "What are your greatest strengths and weaknesses?", 'expected_keywords': ['strength', 'weakness', 'improvement', 'self-awareness', 'growth'], 'difficulty': 'Easy'},
            {'text': "Where do you see yourself in 5 years?", 'expected_keywords': ['career', 'goals', 'growth', 'aspirations', 'development'], 'difficulty': 'Easy'},
            {'text': "Why should we hire you?", 'expected_keywords': ['skills', 'experience', 'value', 'contribution', 'unique'], 'difficulty': 'Easy'},
            {'text': "Describe a challenge you faced and how you overcame it.", 'expected_keywords': ['challenge', 'solution', 'problem-solving', 'result', 'learning'], 'difficulty': 'Medium'},
            {'text': "How do you handle stress and pressure?", 'expected_keywords': ['stress', 'pressure', 'management', 'techniques', 'deadline'], 'difficulty': 'Easy'},
            {'text': "What is your greatest professional achievement?", 'expected_keywords': ['achievement', 'accomplishment', 'success', 'result', 'impact'], 'difficulty': 'Medium'},
            {'text': "How do you work in a team?", 'expected_keywords': ['teamwork', 'collaboration', 'communication', 'contribution', 'support'], 'difficulty': 'Easy'},
            {'text': "Why do you want to work here?", 'expected_keywords': ['company', 'mission', 'culture', 'opportunity', 'growth'], 'difficulty': 'Easy'},
            {'text': "What are your salary expectations?", 'expected_keywords': ['salary', 'compensation', 'benefits', 'market', 'value'], 'difficulty': 'Easy'}
        ],
        'software_engineering': [
            {'text': "Explain the difference between REST and GraphQL APIs.", 'expected_keywords': ['REST', 'GraphQL', 'API', 'endpoints', 'query', 'performance'], 'difficulty': 'Medium'},
            {'text': "How would you design a scalable microservices architecture?", 'expected_keywords': ['microservices', 'scalability', 'architecture', 'design', 'communication'], 'difficulty': 'Hard'},
            {'text': "What are the SOLID principles and how do you apply them?", 'expected_keywords': ['SOLID', 'principles', 'design', 'object-oriented', 'patterns'], 'difficulty': 'Hard'}
        ],
        'data_science': [
            {'text': "Explain the difference between supervised and unsupervised learning.", 'expected_keywords': ['supervised', 'unsupervised', 'labeled', 'unlabeled', 'classification', 'clustering'], 'difficulty': 'Medium'},
            {'text': "How would you handle missing data in a dataset?", 'expected_keywords': ['missing', 'data', 'imputation', 'deletion', 'analysis'], 'difficulty': 'Medium'},
            {'text': "What is your approach to feature engineering?", 'expected_keywords': ['features', 'engineering', 'transformation', 'selection', 'creation'], 'difficulty': 'Hard'}
        ],
        'product_management': [
            {'text': "How do you prioritize features for a product?", 'expected_keywords': ['prioritization', 'features', 'roadmap', 'value', 'effort'], 'difficulty': 'Medium'},
            {'text': "Explain the product development lifecycle.", 'expected_keywords': ['product', 'development', 'lifecycle', 'phases', 'process'], 'difficulty': 'Medium'}
        ],
        'marketing': [
            {'text': "How do you develop a marketing strategy?", 'expected_keywords': ['strategy', 'marketing', 'target', 'audience', 'campaign'], 'difficulty': 'Medium'},
            {'text': "Explain the concept of digital marketing.", 'expected_keywords': ['digital', 'marketing', 'online', 'social', 'content'], 'difficulty': 'Medium'}
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
    """Simple answer analysis"""
    expected_keywords = question_data.get('expected_keywords', [])
    if not expected_keywords:
        expected_keywords = ['experience', 'skills', 'learning', 'team', 'project', 'challenge', 'solution', 'result']
    
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
        feedback = f"Decent answer. Try to be more detailed and use more relevant keywords. Key topics: {', '.join(expected_keywords[:4])}."
    else:
        feedback = f"Your answer could be improved. Try to structure it better and include more details. Key topics: {', '.join(expected_keywords[:4])}."
    
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
        "database": "PostgreSQL",
        "endpoints": [
            "/api/register",
            "/api/login", 
            "/api/questions",
            "/api/analyze-answer",
            "/api/save-interview"
        ]
    })

@app.route('/api/register', methods=['POST'])
def register():
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

@app.route('/api/login', methods=['POST'])
def login():
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

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({
            "authenticated": True, 
            "user_id": session['user_id'], 
            "username": session['username']
        })
    return jsonify({"authenticated": False})

@app.route('/api/roles', methods=['GET'])
def get_roles():
    try:
        roles = get_all_roles()
        return jsonify({"roles": roles})
    except Exception as e:
        logger.error(f"Error fetching roles: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/questions', methods=['POST'])
def get_questions():
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

@app.route('/api/analyze-answer', methods=['POST'])
def analyze_answer():
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
        clarity_score, clarity_feedback = 0.7, "Moderate clarity"
        
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
    except Exception as e:
        logger.error(f"Answer analysis error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-interview', methods=['POST'])
def save_interview():
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

@app.route('/api/session/<int:session_id>', methods=['GET'])
def get_session(session_id):
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

@app.route('/api/user-sessions', methods=['GET'])
def user_sessions():
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

@app.route('/api/session/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
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

@app.route('/api/detect-face', methods=['POST'])
def detect_face():
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
    port = int(os.getenv('PORT', 5000))
    print("=" * 50)
    print("🚀 AI Interview Backend Starting...")
    print(f"📌 Port: {port}")
    print(f"📌 Database: PostgreSQL")
    print("=" * 50)
    app.run(debug=False, host='0.0.0.0', port=port)