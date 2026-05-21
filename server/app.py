"""
Main Flask Application for Learning Disability Screening System
Fully offline INTELLIGENT LEARNING DISABILITY RECOGNITION SYSTEM
"""

from flask import Flask, jsonify, g, request
from flask_cors import CORS
import os

from config import Config
from models import db
from auth_utils import get_user_from_request
from routes.auth_routes import auth_bp, ensure_default_admin

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend development hosts and expose download headers.
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
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
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
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

    @app.before_request
    def enforce_api_auth():
        if request.method == 'OPTIONS' or not request.path.startswith('/api/'):
            return None

        if request.path.startswith('/api/health') or request.path.startswith('/api/auth/login'):
            return None

        if request.path.startswith('/api/auth'):
            if request.path.startswith('/api/auth/logout') or request.path.startswith('/api/auth/me') or request.path.startswith('/api/auth/profile'):
                user = get_user_from_request()
                if not user:
                    return jsonify({'success': False, 'error': 'Authentication required'}), 401
                g.current_user = user
            return None

        user = get_user_from_request()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        g.current_user = user

    with app.app_context():
        db.create_all()
        seed_info = ensure_default_admin()
        if seed_info:
            print(f"✓ Default admin created: {seed_info['username']} / {seed_info['password']}")
    
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
    
    print("\n" + "="*50)
    print("Learning Disability Screening System - Backend")
    print("="*50)
    print("Status: Running")
    print("Mode: Fully Offline")
    print("Server: http://localhost:5000")
    print("API: http://localhost:5000/api")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
