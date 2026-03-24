"""
Assessment API Routes
Handles assessment sessions and task submissions
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from models import db, AssessmentSession, TaskResult, Student
from assessment import dyslexia_tasks, dysgraphia_tasks, dyscalculia_tasks, dyspraxia_tasks

assessment_bp = Blueprint('assessments', __name__)


# Task definitions map
TASK_DEFINITIONS = {
    'dyslexia': dyslexia_tasks.DYSLEXIA_ASSESSMENT,
    'dysgraphia': dysgraphia_tasks.DYSGRAPHIA_ASSESSMENT,
    'dyscalculia': dyscalculia_tasks.DYSCALCULIA_ASSESSMENT,
    'dyspraxia': dyspraxia_tasks.DYSPRAXIA_ASSESSMENT
}


@assessment_bp.route('/start', methods=['POST'])
def start_assessment():
    """Start a new assessment session"""
    try:
        data = request.get_json()
        
        student_id = data.get('student_id')
        assessment_type = data.get('assessment_type', 'full')
        
        # Validate student exists
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        # Create new session
        session = AssessmentSession(
            session_id=str(uuid.uuid4()),
            student_id=student_id,
            assessment_type=assessment_type,
            start_time=datetime.utcnow(),
            status='in_progress'
        )
        
        db.session.add(session)
        db.session.commit()
        
        # Get task definitions for the assessment type
        task_defs = {}
        if assessment_type == 'full':
            task_defs = {k: v for k, v in TASK_DEFINITIONS.items()}
        else:
            task_defs = {assessment_type: TASK_DEFINITIONS.get(assessment_type, {})}
        
        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'task_definitions': task_defs
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@assessment_bp.route('/<int:session_id>/task', methods=['POST'])
def submit_task_result(session_id):
    """Submit a task result for an assessment session"""
    try:
        session = AssessmentSession.query.get_or_404(session_id)
        
        if session.status != 'in_progress':
            return jsonify({
                'success': False,
                'error': 'Assessment session is not in progress'
            }), 400
        
        data = request.get_json()
        
        # Create task result
        task_result = TaskResult(
            session_id=session.id,
            task_type=data.get('task_type'),
            disability_category=data.get('disability_category'),
            task_data=data.get('task_data', {}),
            score=data.get('score'),
            completion_time=data.get('completion_time'),
            completed_at=datetime.utcnow()
        )
        
        db.session.add(task_result)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'task_result': task_result.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@assessment_bp.route('/<int:session_id>/complete', methods=['POST'])
def complete_assessment(session_id):
    """Mark an assessment session as complete"""
    try:
        session = AssessmentSession.query.get_or_404(session_id)
        
        session.end_time = datetime.utcnow()
        session.status = 'completed'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Assessment completed successfully',
            'session': session.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@assessment_bp.route('/<int:session_id>', methods=['GET'])
def get_assessment_session(session_id):
    """Get details of an assessment session"""
    try:
        session = AssessmentSession.query.get_or_404(session_id)
        
        session_data = session.to_dict()
        
        # Include task results
        task_results = session.task_results.all()
        session_data['task_results'] = [task.to_dict() for task in task_results]
        
        # Include risk scores if available
        risk_scores = session.risk_scores.all()
        session_data['risk_scores'] = [score.to_dict() for score in risk_scores]
        
        return jsonify({
            'success': True,
            'session': session_data
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@assessment_bp.route('/tasks/<disability_category>', methods=['GET'])
def get_task_definitions(disability_category):
    """Get task definitions for a specific disability category"""
    try:
        if disability_category not in TASK_DEFINITIONS:
            return jsonify({
                'success': False,
                'error': f'Unknown disability category: {disability_category}'
            }), 400
        
        task_def = TASK_DEFINITIONS[disability_category]
        
        return jsonify({
            'success': True,
            'disability_category': disability_category,
            'assessment': task_def
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
