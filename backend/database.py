# backend/database.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from dotenv import load_dotenv
import hashlib
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.pool = None
        self.init_pool()
    
    def init_pool(self):
        """Initialize connection pool with Supabase"""
        try:
            # Try DATABASE_URL first (with proper encoding)
            database_url = os.getenv('DATABASE_URL')
            
            if database_url:
                # URL encode the password if it contains special characters
                # The URL should already be encoded in the environment variable
                self.pool = SimpleConnectionPool(
                    1, 20,
                    dsn=database_url,
                    sslmode='require'
                )
            else:
                # Use individual parameters
                self.pool = SimpleConnectionPool(
                    1, 20,
                    host=os.getenv('DB_HOST', 'localhost'),
                    port=os.getenv('DB_PORT', '5432'),
                    database=os.getenv('DB_NAME', 'postgres'),
                    user=os.getenv('DB_USER', 'postgres'),
                    password=os.getenv('DB_PASSWORD', ''),
                    sslmode='require'
                )
            logger.info("Supabase database connection pool created successfully")
        except Exception as e:
            logger.error(f"Failed to create database connection pool: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """Get connection from pool"""
        conn = self.pool.getconn()
        try:
            yield conn
        finally:
            self.pool.putconn(conn)
    
    @contextmanager
    def get_cursor(self, cursor_factory=RealDictCursor):
        """Get cursor with connection"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=cursor_factory) as cur:
                yield cur
                conn.commit()
    
    def execute_query(self, query, params=None):
        """Execute query and return results"""
        with self.get_cursor() as cur:
            cur.execute(query, params)
            if cur.description:
                return cur.fetchall()
            return None
    
    def execute_one(self, query, params=None):
        """Execute query and return one result"""
        with self.get_cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()
    
    def execute_insert(self, query, params=None):
        """Execute insert query and return last inserted id"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, params)
                    conn.commit()
                    
                    if cur.description:
                        result = cur.fetchone()
                        if result:
                            return result[0]
                    return cur.lastrowid
        except Exception as e:
            logger.error(f"Insert error: {e}")
            return None

# Singleton instance
db = Database()

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# =============================================
# DAO (Data Access Objects)
# =============================================

class UserDAO:
    @staticmethod
    def create_user(username, email, password):
        """Register new user"""
        hashed_password = hash_password(password)
        query = """
            INSERT INTO users (username, email, password)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        try:
            result = db.execute_insert(query, (username, email, hashed_password))
            if result:
                logger.info(f"User created with ID: {result}")
                return result
            return None
        except psycopg2.IntegrityError as e:
            logger.error(f"Username or email already exists: {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    @staticmethod
    def get_user_by_username(username):
        query = "SELECT * FROM users WHERE username = %s"
        return db.execute_one(query, (username,))
    
    @staticmethod
    def get_user_by_email(email):
        query = "SELECT * FROM users WHERE email = %s"
        return db.execute_one(query, (email,))
    
    @staticmethod
    def login_user(username, password):
        """Login user"""
        hashed_password = hash_password(password)
        query = """
            SELECT id, username FROM users 
            WHERE username = %s AND password = %s
        """
        return db.execute_one(query, (username, hashed_password))

class InterviewSessionDAO:
    @staticmethod
    def create_session(user_id, role, overall_score=None, overall_feedback=None, 
                       transcript=None, audio_quality=None, camera_score=None, total_time=0):
        query = """
            INSERT INTO interview_sessions 
            (user_id, role, overall_score, overall_feedback, transcript, 
             audio_quality, camera_score, total_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        try:
            result = db.execute_insert(query, (user_id, role, overall_score, overall_feedback, 
                                              transcript, audio_quality, camera_score, total_time))
            if result:
                logger.info(f"Interview session created with ID: {result}")
                return result
            return None
        except Exception as e:
            logger.error(f"Error creating interview session: {e}")
            return None
    
    @staticmethod
    def get_session(session_id):
        query = "SELECT * FROM interview_sessions WHERE id = %s"
        return db.execute_one(query, (session_id,))
    
    @staticmethod
    def get_user_sessions(user_id):
        query = """
            SELECT id, created_at, overall_score, role 
            FROM interview_sessions 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """
        return db.execute_query(query, (user_id,))
    
    @staticmethod
    def update_session_score(session_id, overall_score, overall_feedback):
        query = """
            UPDATE interview_sessions 
            SET overall_score = %s, overall_feedback = %s
            WHERE id = %s
        """
        return db.execute_query(query, (overall_score, overall_feedback, session_id))
    
    @staticmethod
    def delete_session(session_id):
        query = "DELETE FROM interview_sessions WHERE id = %s"
        return db.execute_query(query, (session_id,))

class QuestionResponseDAO:
    @staticmethod
    def create_response(session_id, question, answer=None, score=None, feedback=None,
                        matched_keywords=None, keyword_score=None, confidence_score=None,
                        clarity_score=None, clarity_feedback=None, emotion='Neutral', time_taken=0):
        matched_keywords_str = ','.join(matched_keywords) if matched_keywords else None
        
        query = """
            INSERT INTO question_responses 
            (session_id, question, answer, score, feedback, matched_keywords, 
             keyword_score, confidence_score, clarity_score, clarity_feedback, 
             emotion, time_taken)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        try:
            result = db.execute_insert(query, (session_id, question, answer, score, feedback,
                                              matched_keywords_str, keyword_score, confidence_score,
                                              clarity_score, clarity_feedback, emotion, time_taken))
            return result
        except Exception as e:
            logger.error(f"Error creating question response: {e}")
            return None
    
    @staticmethod
    def get_responses_by_session(session_id):
        query = """
            SELECT * FROM question_responses 
            WHERE session_id = %s 
            ORDER BY created_at
        """
        return db.execute_query(query, (session_id,))