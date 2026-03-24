"""
Database initialization script
Run this to create the database and tables
"""

from app import create_app
from models import db

def init_database():
    """Initialize the database with all tables"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        print("✓ Database initialized successfully")
        print("✓ Database location: server/database/learning_disability.db")
        print("✓ All tables created:")
        print("  - students")
        print("  - assessment_sessions")
        print("  - task_results")
        print("  - extracted_features")
        print("  - risk_scores")
        print("  - explanations")
        print("  - progress_history")
        print("  - recommendations")

if __name__ == '__main__':
    init_database()
