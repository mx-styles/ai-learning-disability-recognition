"""
Student Management API Routes
CRUD operations for student records
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Student
from sqlalchemy.exc import IntegrityError

student_bp = Blueprint('students', __name__)


@student_bp.route('', methods=['GET'])
def get_students():
    """Get all students or filter by query parameters"""
    try:
        grade = request.args.get('grade', type=int)
        search = request.args.get('search', '')
        
        query = Student.query
        
        if grade:
            query = query.filter_by(grade=grade)
        
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    Student.first_name.like(search_pattern),
                    Student.last_name.like(search_pattern),
                    Student.student_id.like(search_pattern)
                )
            )
        
        students = query.order_by(Student.last_name, Student.first_name).all()
        
        return jsonify({
            'success': True,
            'count': len(students),
            'students': [student.to_dict() for student in students]
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """Get a specific student by ID"""
    try:
        student = Student.query.get_or_404(student_id)
        
        # Include assessment history count
        student_data = student.to_dict()
        student_data['assessment_count'] = student.assessment_sessions.count()
        
        return jsonify({
            'success': True,
            'student': student_data
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@student_bp.route('', methods=['POST'])
def create_student():
    """Create a new student record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'first_name', 'last_name', 'date_of_birth', 'grade']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Parse date of birth
        try:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create new student
        student = Student(
            student_id=data['student_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            date_of_birth=dob,
            grade=data['grade'],
            gender=data.get('gender')
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student created successfully',
            'student': student.to_dict()
        }), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Student ID already exists'}), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """Update an existing student record"""
    try:
        student = Student.query.get_or_404(student_id)
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            student.first_name = data['first_name']
        if 'last_name' in data:
            student.last_name = data['last_name']
        if 'date_of_birth' in data:
            student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        if 'grade' in data:
            student.grade = data['grade']
        if 'gender' in data:
            student.gender = data['gender']
        
        student.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student updated successfully',
            'student': student.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student record"""
    try:
        student = Student.query.get_or_404(student_id)
        
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student deleted successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@student_bp.route('/<int:student_id>/history', methods=['GET'])
def get_student_history(student_id):
    """Get assessment history for a student"""
    try:
        student = Student.query.get_or_404(student_id)
        
        # Get all assessment sessions
        sessions = student.assessment_sessions.order_by(
            db.desc('start_time')
        ).all()
        
        history = []
        for session in sessions:
            session_data = session.to_dict()
            
            # Include risk scores
            risk_scores = session.risk_scores.all()
            session_data['risk_scores'] = [score.to_dict() for score in risk_scores]
            
            history.append(session_data)
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'history': history
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
