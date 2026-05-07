# import pyodbc
# import hashlib
# from datetime import datetime

# # SQL Server connection - UPDATE THESE VALUES
# DB_CONFIG = {
#     'server': 'harshdeep',  # Your SQL Server name
#     'database': 'AIInterviewDB',
#     'username': 'root',  # Leave empty for Windows auth
#     'password': '098@Hanjra',  # Leave empty for Windows auth
#     'driver': '{ODBC Driver 17 for SQL Server}'
# }

# def get_connection():
#     if DB_CONFIG['username']:
#         conn_str = f"DRIVER={DB_CONFIG['driver']};SERVER={DB_CONFIG['server']};DATABASE={DB_CONFIG['database']};UID={DB_CONFIG['username']};PWD={DB_CONFIG['password']}"
#     else:
#         conn_str = f"DRIVER={DB_CONFIG['driver']};SERVER={DB_CONFIG['server']};DATABASE={DB_CONFIG['database']};Trusted_Connection=yes"
#     return pyodbc.connect(conn_str)

# def init_database():
#     conn = get_connection()
#     cursor = conn.cursor()
    
#     # Create Users table
#     cursor.execute('''
#         IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
#         CREATE TABLE Users (
#             id INT IDENTITY(1,1) PRIMARY KEY,
#             username NVARCHAR(100) UNIQUE NOT NULL,
#             email NVARCHAR(200) UNIQUE NOT NULL,
#             password_hash NVARCHAR(255) NOT NULL,
#             created_at DATETIME DEFAULT GETDATE()
#         )
#     ''')
    
#     # Create InterviewSessions table
#     cursor.execute('''
#         IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InterviewSessions' AND xtype='U')
#         CREATE TABLE InterviewSessions (
#             id INT IDENTITY(1,1) PRIMARY KEY,
#             user_id INT FOREIGN KEY REFERENCES Users(id),
#             role NVARCHAR(100),
#             date DATETIME DEFAULT GETDATE(),
#             overall_score FLOAT,
#             feedback NVARCHAR(MAX),
#             transcript NVARCHAR(MAX),
#             audio_quality FLOAT,
#             camera_score FLOAT
#         )
#     ''')
    
#     # Create Questions table
#     cursor.execute('''
#         IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Questions' AND xtype='U')
#         CREATE TABLE Questions (
#             id INT IDENTITY(1,1) PRIMARY KEY,
#             session_id INT FOREIGN KEY REFERENCES InterviewSessions(id),
#             question_text NVARCHAR(500),
#             user_answer NVARCHAR(MAX),
#             score FLOAT,
#             feedback NVARCHAR(500),
#             confidence_score FLOAT,
#             clarity_score FLOAT
#         )
#     ''')
    
#     conn.commit()
#     conn.close()

# def hash_password(password):
#     return hashlib.sha256(password.encode()).hexdigest()

# def register_user(username, email, password):
#     conn = get_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute(
#             "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)",
#             (username, email, hash_password(password))
#         )
#         conn.commit()
#         return True
#     except Exception as e:
#         print(f"Registration error: {e}")
#         return False
#     finally:
#         conn.close()

# def login_user(username, password):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT id, username FROM Users WHERE username = ? AND password_hash = ?",
#         (username, hash_password(password))
#     )
#     user = cursor.fetchone()
#     conn.close()
#     return (user[0], user[1]) if user else None

# def save_interview_session(user_id, role, overall_score, feedback, transcript, audio_quality, camera_score, questions_data):
#     conn = get_connection()
#     cursor = conn.cursor()
    
#     cursor.execute(
#         "INSERT INTO InterviewSessions (user_id, role, overall_score, feedback, transcript, audio_quality, camera_score) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?)",
#         (user_id, role, overall_score, feedback, transcript, audio_quality, camera_score)
#     )
#     session_id = cursor.fetchone()[0]
    
#     for q in questions_data:
#         cursor.execute(
#             "INSERT INTO Questions (session_id, question_text, user_answer, score, feedback, confidence_score, clarity_score) VALUES (?, ?, ?, ?, ?, ?, ?)",
#             (session_id, q['question'], q['answer'], q['score'], q['feedback'], q.get('confidence', 0), q.get('clarity', 0))
#         )
    
#     conn.commit()
#     conn.close()
#     return session_id

# def get_session_details(session_id):
#     conn = get_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("SELECT role, overall_score, feedback, transcript, audio_quality, camera_score, date FROM InterviewSessions WHERE id = ?", (session_id,))
#     session = cursor.fetchone()
    
#     cursor.execute("SELECT question_text, user_answer, score, feedback, confidence_score, clarity_score FROM Questions WHERE session_id = ?", (session_id,))
#     questions = cursor.fetchall()
    
#     conn.close()
    
#     return {
#         'role': session[0],
#         'overall_score': session[1],
#         'feedback': session[2],
#         'transcript': session[3],
#         'audio_quality': session[4],
#         'camera_score': session[5],
#         'date': str(session[6]),
#         'questions': [{'question': q[0], 'answer': q[1], 'score': q[2], 'feedback': q[3], 'confidence': q[4], 'clarity': q[5]} for q in questions]
#     }

# def get_user_sessions(user_id):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute(
#         "SELECT id, date, overall_score, role FROM InterviewSessions WHERE user_id = ? ORDER BY date DESC",
#         (user_id,)
#     )
#     sessions = cursor.fetchall()
#     conn.close()
#     return sessions


import mysql.connector
import hashlib
from datetime import datetime

# MySQL connection config
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '098@Hanjra',
    'database': 'AIInterviewDB'
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def init_database():
    conn = get_connection()
    cursor = conn.cursor()

    # Create Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(200) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create InterviewSessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS InterviewSessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            role VARCHAR(100),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            overall_score FLOAT,
            feedback TEXT,
            transcript TEXT,
            audio_quality FLOAT,
            camera_score FLOAT,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )
    ''')

    # Create Questions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT,
            question_text VARCHAR(500),
            user_answer TEXT,
            score FLOAT,
            feedback VARCHAR(500),
            confidence_score FLOAT,
            clarity_score FLOAT,
            FOREIGN KEY (session_id) REFERENCES InterviewSessions(id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def register_user(username, email, password):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO Users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, hash_password(password))
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Registration error: {e}")
        return False
    finally:
        conn.close()


def login_user(username, password):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, username FROM Users WHERE username = %s AND password_hash = %s",
        (username, hash_password(password))
    )

    user = cursor.fetchone()
    conn.close()

    return (user[0], user[1]) if user else None


def save_interview_session(user_id, role, overall_score, feedback, transcript, audio_quality, camera_score, questions_data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO InterviewSessions (user_id, role, overall_score, feedback, transcript, audio_quality, camera_score) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (user_id, role, overall_score, feedback, transcript, audio_quality, camera_score)
    )

    session_id = cursor.lastrowid

    for q in questions_data:
        cursor.execute(
            "INSERT INTO Questions (session_id, question_text, user_answer, score, feedback, confidence_score, clarity_score) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (
                session_id,
                q['question'],
                q['answer'],
                q['score'],
                q['feedback'],
                q.get('confidence', 0),
                q.get('clarity', 0)
            )
        )

    conn.commit()
    conn.close()

    return session_id


def get_session_details(session_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT role, overall_score, feedback, transcript, audio_quality, camera_score, date FROM InterviewSessions WHERE id = %s",
        (session_id,)
    )
    session = cursor.fetchone()

    cursor.execute(
        "SELECT question_text, user_answer, score, feedback, confidence_score, clarity_score FROM Questions WHERE session_id = %s",
        (session_id,)
    )
    questions = cursor.fetchall()

    conn.close()

    return {
        'role': session[0],
        'overall_score': session[1],
        'feedback': session[2],
        'transcript': session[3],
        'audio_quality': session[4],
        'camera_score': session[5],
        'date': str(session[6]),
        'questions': [
            {
                'question': q[0],
                'answer': q[1],
                'score': q[2],
                'feedback': q[3],
                'confidence': q[4],
                'clarity': q[5]
            } for q in questions
        ]
    }


def get_user_sessions(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, date, overall_score, role FROM InterviewSessions WHERE user_id = %s ORDER BY date DESC",
        (user_id,)
    )

    sessions = cursor.fetchall()
    conn.close()

    return sessions