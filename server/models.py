"""
SQLAlchemy Database Models for Learning Disability Screening System
Fully offline, local SQLite database
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Student(db.Model):
    """Student demographic and profile information"""
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    grade = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assessment_sessions = db.relationship('AssessmentSession', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    progress_history = db.relationship('ProgressHistory', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Student {self.student_id}: {self.first_name} {self.last_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'grade': self.grade,
            'gender': self.gender,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class AssessmentSession(db.Model):
    """Assessment session containing multiple task results"""
    __tablename__ = 'assessment_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False, index=True)
    assessment_type = db.Column(db.String(50), nullable=False)  # 'full', 'dyslexia', 'dysgraphia', etc.
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='in_progress')  # 'in_progress', 'completed', 'abandoned'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    task_results = db.relationship('TaskResult', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    extracted_features = db.relationship('ExtractedFeatures', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    risk_scores = db.relationship('RiskScore', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    explanations = db.relationship('Explanation', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<AssessmentSession {self.session_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id,
            'assessment_type': self.assessment_type,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TaskResult(db.Model):
    """Individual task-level results (raw data)"""
    __tablename__ = 'task_results'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('assessment_sessions.id'), nullable=False, index=True)
    task_type = db.Column(db.String(50), nullable=False)  # 'word_reading', 'dictation', 'arithmetic', etc.
    disability_category = db.Column(db.String(50), nullable=False)  # 'dyslexia', 'dysgraphia', etc.
    task_data = db.Column(db.JSON, nullable=False)  # Raw task data (responses, timings, etc.)
    score = db.Column(db.Float)  # Overall task score (0-1)
    completion_time = db.Column(db.Float)  # Time in seconds
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<TaskResult {self.task_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'task_type': self.task_type,
            'disability_category': self.disability_category,
            'task_data': self.task_data,
            'score': self.score,
            'completion_time': self.completion_time,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class ExtractedFeatures(db.Model):
    """Extracted and normalized features from task results"""
    __tablename__ = 'extracted_features'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('assessment_sessions.id'), nullable=False, index=True)
    disability_category = db.Column(db.String(50), nullable=False)  # 'dyslexia', 'dysgraphia', etc.
    feature_vector = db.Column(db.JSON, nullable=False)  # Dictionary of feature name -> normalized value
    age_at_assessment = db.Column(db.Float, nullable=False)  # Age in years
    grade_at_assessment = db.Column(db.Integer, nullable=False)
    extracted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ExtractedFeatures {self.disability_category}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'disability_category': self.disability_category,
            'feature_vector': self.feature_vector,
            'age_at_assessment': self.age_at_assessment,
            'grade_at_assessment': self.grade_at_assessment,
            'extracted_at': self.extracted_at.isoformat() if self.extracted_at else None
        }


class RiskScore(db.Model):
    """Final risk scores from hybrid decision engine"""
    __tablename__ = 'risk_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('assessment_sessions.id'), nullable=False, index=True)
    disability_category = db.Column(db.String(50), nullable=False)  # 'dyslexia', 'dysgraphia', etc.
    
    # ML model scores
    ml_probability = db.Column(db.Float, nullable=False)  # 0-1 probability from ML model
    ml_model_type = db.Column(db.String(50))  # 'random_forest', 'svm', etc.
    
    # Rule-based scores
    rule_score = db.Column(db.Float, nullable=False)  # 0-1 score from rule engine
    triggered_rules = db.Column(db.JSON)  # List of triggered rule IDs
    
    # Hybrid final score
    final_score = db.Column(db.Float, nullable=False)  # Weighted combination
    risk_level = db.Column(db.String(20), nullable=False)  # 'low', 'moderate', 'high'
    confidence = db.Column(db.Float)  # Model confidence (0-1)
    
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<RiskScore {self.disability_category}: {self.risk_level}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'disability_category': self.disability_category,
            'ml_probability': self.ml_probability,
            'ml_model_type': self.ml_model_type,
            'rule_score': self.rule_score,
            'triggered_rules': self.triggered_rules,
            'final_score': self.final_score,
            'risk_level': self.risk_level,
            'confidence': self.confidence,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None
        }


class Explanation(db.Model):
    """Explainability data for risk scores"""
    __tablename__ = 'explanations'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('assessment_sessions.id'), nullable=False, index=True)
    disability_category = db.Column(db.String(50), nullable=False)
    
    # Feature importance
    key_features = db.Column(db.JSON, nullable=False)  # List of {feature, value, importance}
    
    # Plain language explanation
    explanation_text = db.Column(db.Text, nullable=False)
    
    # Supporting evidence
    contributing_tasks = db.Column(db.JSON)  # List of task types that contributed
    
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Explanation {self.disability_category}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'disability_category': self.disability_category,
            'key_features': self.key_features,
            'explanation_text': self.explanation_text,
            'contributing_tasks': self.contributing_tasks,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None
        }


class ProgressHistory(db.Model):
    """Longitudinal tracking of student progress"""
    __tablename__ = 'progress_history'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False, index=True)
    session_id = db.Column(db.Integer, db.ForeignKey('assessment_sessions.id'), nullable=False)
    disability_category = db.Column(db.String(50), nullable=False)
    
    # Snapshot data
    risk_level = db.Column(db.String(20), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    assessment_date = db.Column(db.DateTime, nullable=False)
    
    # Comparative data
    previous_risk_score = db.Column(db.Float)  # Score from previous assessment
    score_change = db.Column(db.Float)  # Change from previous assessment
    trend = db.Column(db.String(20))  # 'improving', 'stable', 'declining'
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ProgressHistory {self.disability_category}: {self.trend}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'session_id': self.session_id,
            'disability_category': self.disability_category,
            'risk_level': self.risk_level,
            'risk_score': self.risk_score,
            'assessment_date': self.assessment_date.isoformat() if self.assessment_date else None,
            'previous_risk_score': self.previous_risk_score,
            'score_change': self.score_change,
            'trend': self.trend,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Recommendation(db.Model):
    """Disability-specific recommendations and interventions"""
    __tablename__ = 'recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('assessment_sessions.id'), nullable=False, index=True)
    disability_category = db.Column(db.String(50), nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    
    # Recommendations
    classroom_accommodations = db.Column(db.JSON, nullable=False)  # List of accommodation strategies
    practice_exercises = db.Column(db.JSON, nullable=False)  # List of suggested exercises
    assistive_strategies = db.Column(db.JSON, nullable=False)  # List of assistive strategies
    teacher_action_plan = db.Column(db.JSON, nullable=False)  # List of teacher actions
    
    # Additional notes
    notes = db.Column(db.Text)
    
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Recommendation {self.disability_category}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'disability_category': self.disability_category,
            'risk_level': self.risk_level,
            'classroom_accommodations': self.classroom_accommodations,
            'practice_exercises': self.practice_exercises,
            'assistive_strategies': self.assistive_strategies,
            'teacher_action_plan': self.teacher_action_plan,
            'notes': self.notes,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None
        }
