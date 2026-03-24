import os

class Config:
    """Application configuration"""
    
    # Base directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # Database configuration (SQLite - fully offline)
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'learning_disability.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ML Models directory
    ML_MODELS_DIR = os.path.join(BASE_DIR, 'ml_models', 'saved_models')
    
    # Datasets directory
    DATASETS_DIR = os.path.join(BASE_DIR, 'ml_models', 'datasets')
    
    # Reports directory
    REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
    
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'offline-learning-disability-screening-system-2026'
    
    # Age and grade normalization parameters
    AGE_RANGE = (6, 18)  # Years
    GRADE_RANGE = (1, 12)
    
    # Risk level thresholds
    RISK_THRESHOLDS = {
        'low': 0.5,
        'moderate': 0.7,
        'high': 0.9
    }
    
    # Hybrid decision weights
    ML_WEIGHT = 0.6
    RULE_WEIGHT = 0.4
    
    # Feature normalization bounds
    FEATURE_BOUNDS = {
        'accuracy': (0, 1),
        'speed': (0, 200),  # WPM or CPM
        'error_rate': (0, 1),
        'deviation': (0, 100),
        'time': (0, 300)  # seconds
    }
