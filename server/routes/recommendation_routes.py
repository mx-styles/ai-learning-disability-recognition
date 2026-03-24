"""
Recommendation API Routes
"""

from flask import Blueprint, jsonify
from models import Recommendation

recommendation_bp = Blueprint('recommendations', __name__)


@recommendation_bp.route('/session/<int:session_id>', methods=['GET'])
def get_session_recommendations(session_id):
    """Get all recommendations for a session"""
    try:
        recommendations = Recommendation.query.filter_by(
            session_id=session_id
        ).all()
        
        return jsonify({
            'success': True,
            'recommendations': [rec.to_dict() for rec in recommendations]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@recommendation_bp.route('/session/<int:session_id>/<disability_category>', methods=['GET'])
def get_disability_recommendation(session_id, disability_category):
    """Get recommendation for a specific disability"""
    try:
        recommendation = Recommendation.query.filter_by(
            session_id=session_id,
            disability_category=disability_category
        ).first_or_404()
        
        return jsonify({
            'success': True,
            'recommendation': recommendation.to_dict()
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404
