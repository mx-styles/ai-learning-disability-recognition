"""
Main Flask Application for Learning Disability Screening System
Fully offline INTELLIGENT LEARNING DISABILITY RECOGNITION SYSTEM
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

from config import Config
from models import db

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend development servers and expose download headers.
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                ],
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "expose_headers": ["Content-Disposition", "Content-Type"],
            }
        },
    )
    
    # Initialize database
    db.init_app(app)
    
    # Create necessary directories
    os.makedirs(app.config['ML_MODELS_DIR'], exist_ok=True)
    os.makedirs(app.config['DATASETS_DIR'], exist_ok=True)
    os.makedirs(app.config['REPORTS_DIR'], exist_ok=True)
    os.makedirs(os.path.join(app.config['BASE_DIR'], 'database'), exist_ok=True)
    
    # Register blueprints
    from routes.student_routes import student_bp
    from routes.assessment_routes import assessment_bp
    from routes.analysis_routes import analysis_bp
    from routes.recommendation_routes import recommendation_bp
    from routes.report_routes import report_routes
    from routes.dysgraphia_image_routes import dysgraphia_image_bp
    
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessments')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
    app.register_blueprint(recommendation_bp, url_prefix='/api/recommendations')
    app.register_blueprint(report_routes, url_prefix='/api/reports')
    app.register_blueprint(dysgraphia_image_bp, url_prefix='/api/dysgraphia-image')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Learning Disability Screening System API',
            'version': '1.0.0',
            'offline': True
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    return app


if __name__ == '__main__':
    app = create_app()
    
    # Create all database tables
    with app.app_context():
        db.create_all()
        print("✓ Database initialized successfully")
        print("✓ All tables created")
    
    print("\n" + "="*50)
    print("Learning Disability Screening System - Backend")
    print("="*50)
    print("Status: Running")
    print("Mode: Fully Offline")
    print("Server: http://localhost:5000")
    print("API: http://localhost:5000/api")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
