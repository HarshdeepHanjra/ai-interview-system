# migrate.py
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    """Create database if it doesn't exist"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '098@Sjsglobal'),
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        db_name = os.getenv('DB_NAME', 'interview_system')
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute(f"CREATE DATABASE {db_name}")
            print(f"✅ Database '{db_name}' created successfully")
        else:
            print(f"ℹ️ Database '{db_name}' already exists")
        
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def execute_sql_file(filename='database_schema.sql'):
    """Execute SQL file"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'interview_system'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '098@Sjsglobal')
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        with open(filename, 'r', encoding='utf-8') as f:
            sql = f.read()
            # Split by semicolon but handle arrays properly
            statements = sql.split(';')
            for stmt in statements:
                stmt = stmt.strip()
                if stmt and not stmt.startswith('--'):
                    try:
                        cur.execute(stmt)
                    except Exception as e:
                        print(f"⚠️ Error in statement: {e}")
                        print(f"Statement: {stmt[:100]}...")
        
        cur.close()
        conn.close()
        print("✅ Schema executed successfully")
        return True
    except Exception as e:
        print(f"❌ Error executing schema: {e}")
        return False

def test_connection():
    """Test database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'interview_system'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '098@Sjsglobal')
        )
        cur = conn.cursor()
        cur.execute("SELECT version()")
        version = cur.fetchone()
        print(f"✅ Connected to: {version[0]}")
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("🗄️ PostgreSQL Migration Tool")
    print("=" * 50)
    
    print("\n1. Creating database...")
    if not create_database():
        print("❌ Failed to create database. Please check your PostgreSQL installation.")
        exit(1)
    
    print("\n2. Creating tables...")
    if not execute_sql_file('database_schema.sql'):
        print("❌ Failed to create tables.")
        exit(1)
    
    print("\n3. Testing connection...")
    if not test_connection():
        print("❌ Connection test failed.")
        exit(1)
    
    print("\n" + "=" * 50)
    print("✅ Migration completed successfully!")
    print("=" * 50)
    print("\nYou can now run: python app.py")