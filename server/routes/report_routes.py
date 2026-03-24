"""
Report Generation Routes
Handles PDF report generation and download
"""

from flask import Blueprint, send_file, jsonify
from reports.report_generator import generate_assessment_report, generate_student_progress_report
import os

report_routes = Blueprint('reports', __name__)


@report_routes.route('/session/<int:session_id>/pdf', methods=['GET'])
def generate_session_report(session_id):
    """
    Generate and download PDF report for an assessment session
    
    GET /api/reports/session/<session_id>/pdf
    
    Returns:
        PDF file download
    """
    try:
        # Generate report
        pdf_path = generate_assessment_report(session_id)
        
        # Send file
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'assessment_report_{session_id}.pdf'
        )
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Failed to generate report: {str(e)}'}), 500


@report_routes.route('/student/<int:student_id>/progress-pdf', methods=['GET'])
def generate_progress_report(student_id):
    """
    Generate and download progress report for a student
    
    GET /api/reports/student/<student_id>/progress-pdf
    
    Returns:
        PDF file download
    """
    try:
        # Generate report
        pdf_path = generate_student_progress_report(student_id)
        
        # Send file
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'progress_report_{student_id}.pdf'
        )
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Failed to generate report: {str(e)}'}), 500


@report_routes.route('/session/<int:session_id>/export', methods=['GET'])
def export_session_data(session_id):
    """
    Export raw assessment data as JSON
    
    GET /api/reports/session/<session_id>/export
    
    Returns:
        JSON file download with complete session data
    """
    try:
        from models import AssessmentSession, TaskResult, ExtractedFeatures, RiskScore, Explanation
        from database import db
        import json
        from datetime import datetime
        
        # Fetch session data
        session = AssessmentSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        task_results = TaskResult.query.filter_by(session_id=session_id).all()
        features = ExtractedFeatures.query.filter_by(session_id=session_id).all()
        risk_scores = RiskScore.query.filter_by(session_id=session_id).all()
        explanations = Explanation.query.filter_by(session_id=session_id).all()
        
        # Build export data
        export_data = {
            'session': {
                'session_id': session.session_id,
                'student_id': session.student_id,
                'created_at': session.created_at.isoformat(),
                'completed_at': session.completed_at.isoformat() if session.completed_at else None,
                'status': session.status,
                'disability_categories': session.disability_categories
            },
            'task_results': [
                {
                    'task_id': tr.task_id,
                    'category': tr.category,
                    'task_type': tr.task_type,
                    'data': tr.data,
                    'timestamp': tr.timestamp.isoformat()
                }
                for tr in task_results
            ],
            'extracted_features': [
                {
                    'disability_category': ef.disability_category,
                    'feature_vector': ef.feature_vector,
                    'feature_names': ef.feature_names
                }
                for ef in features
            ],
            'risk_scores': [
                {
                    'disability_category': rs.disability_category,
                    'ml_score': rs.ml_score,
                    'rule_score': rs.rule_score,
                    'final_score': rs.final_score,
                    'risk_level': rs.risk_level,
                    'confidence': rs.confidence
                }
                for rs in risk_scores
            ],
            'explanations': [
                {
                    'disability_category': ex.disability_category,
                    'key_features': ex.key_features,
                    'plain_text_explanation': ex.plain_text_explanation
                }
                for ex in explanations
            ],
            'export_metadata': {
                'export_date': datetime.now().isoformat(),
                'format_version': '1.0'
            }
        }
        
        # Create JSON file
        from io import BytesIO
        json_data = json.dumps(export_data, indent=2)
        buffer = BytesIO(json_data.encode('utf-8'))
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/json',
            as_attachment=True,
            download_name=f'assessment_data_{session_id}.json'
        )
    
    except Exception as e:
        return jsonify({'error': f'Failed to export data: {str(e)}'}), 500
