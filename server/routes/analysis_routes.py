"""
Analysis API Routes
Processes assessment results and generates risk scores
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, AssessmentSession, Student, ExtractedFeatures, RiskScore, Explanation, ProgressHistory, Recommendation
from ml_models.feature_extraction.feature_extractor import extract_features, calculate_age
from ml_models.rule_engine.rule_engine import screen_features, screen_task_scores
from ml_models.classifiers.ml_classifier import DisabilityClassifier
from ml_models.hybrid_engine.hybrid_engine import HybridDecisionEngine, explain_decision
from recommendations.recommendation_engine import RecommendationEngine
import os

analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/dashboard-overview', methods=['GET'])
def get_dashboard_overview():
    """Aggregate dashboard data for teacher overview screen."""
    try:
        students = Student.query.all()
        total_students = len(students)

        completed_sessions = AssessmentSession.query.filter_by(status='completed').order_by(
            AssessmentSession.start_time.desc()
        ).all()

        assessed_student_ids = {session.student_id for session in completed_sessions}

        all_risk_scores = RiskScore.query.order_by(RiskScore.calculated_at.desc()).all()
        high_risk_cases = [score for score in all_risk_scores if score.risk_level == 'high']
        high_risk_student_ids = {
            score.session.student_id for score in high_risk_cases if score.session is not None
        }

        domains = ['dyslexia', 'dysgraphia', 'dyscalculia', 'dyspraxia']
        risk_by_domain = {
            domain: {'low': 0, 'moderate': 0, 'high': 0, 'total': 0}
            for domain in domains
        }

        for score in all_risk_scores:
            domain = score.disability_category
            if domain not in risk_by_domain:
                risk_by_domain[domain] = {'low': 0, 'moderate': 0, 'high': 0, 'total': 0}
            level = score.risk_level if score.risk_level in {'low', 'moderate', 'high'} else 'low'
            risk_by_domain[domain][level] += 1
            risk_by_domain[domain]['total'] += 1

        recent_assessments = []
        for session in completed_sessions[:10]:
            student = session.student
            session_scores = session.risk_scores.all()
            domain_risks = [
                {
                    'domain': s.disability_category,
                    'risk_level': s.risk_level,
                    'final_score': round(float(s.final_score or 0), 4),
                }
                for s in session_scores
            ]

            risk_rank = {'low': 0, 'moderate': 1, 'high': 2}
            overall = 'low'
            for dr in domain_risks:
                if risk_rank.get(dr['risk_level'], 0) > risk_rank.get(overall, 0):
                    overall = dr['risk_level']

            recent_assessments.append({
                'id': session.id,
                'session_id': session.session_id,
                'assessment_type': session.assessment_type,
                'start_time': session.start_time.isoformat() if session.start_time else None,
                'end_time': session.end_time.isoformat() if session.end_time else None,
                'overall_risk': overall,
                'domain_risks': domain_risks,
                'student': {
                    'id': student.id if student else None,
                    'student_id': student.student_id if student else None,
                    'name': f"{student.first_name} {student.last_name}".strip() if student else 'Unknown',
                    'grade': student.grade if student else None,
                },
            })

        interventions = []
        recommendations = Recommendation.query.order_by(Recommendation.generated_at.desc()).all()
        for rec in recommendations:
            if rec.risk_level not in {'moderate', 'high'}:
                continue

            session = AssessmentSession.query.get(rec.session_id)
            student = session.student if session else None
            first_accommodation = (rec.classroom_accommodations or [None])[0]
            first_practice = (rec.practice_exercises or [None])[0]

            interventions.append({
                'session_id': rec.session_id,
                'disability_category': rec.disability_category,
                'risk_level': rec.risk_level,
                'student_name': f"{student.first_name} {student.last_name}".strip() if student else 'Unknown',
                'student_id': student.student_id if student else None,
                'generated_at': rec.generated_at.isoformat() if rec.generated_at else None,
                'priority_actions': [item for item in [first_accommodation, first_practice] if item],
            })

            if len(interventions) >= 8:
                break

        return jsonify({
            'success': True,
            'stats': {
                'total_students': total_students,
                'assessed_students': len(assessed_student_ids),
                'completed_assessments': len(completed_sessions),
                'high_risk_cases': len(high_risk_cases),
                'high_risk_students': len(high_risk_student_ids),
            },
            'risk_by_domain': risk_by_domain,
            'recent_assessments': recent_assessments,
            'intervention_queue': interventions,
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@analysis_bp.route('/rule-screen', methods=['POST'])
def rule_screen_domains():
    """
    Rule-based screening endpoint that determines disability presence per domain
    using individual domain task scores and returns intervention recommendations.

    Expected payload:
    {
      "domains": {
        "dyslexia": {
          "task_scores": {"word_reading_accuracy": 0.82, ...}
        },
        ...
      }
    }
    """
    try:
        data = request.get_json() or {}
        domains = data.get('domains', {})

        if not isinstance(domains, dict) or not domains:
            return jsonify({
                'success': False,
                'error': 'Payload must include a non-empty domains object'
            }), 400

        results = {}

        for domain_name, domain_payload in domains.items():
            if not isinstance(domain_payload, dict):
                domain_payload = {}

            task_scores = domain_payload.get('task_scores', {})
            if not isinstance(task_scores, dict):
                task_scores = {}

            # Convert score map into a shape consumable by screen_task_scores.
            synthetic_task = {
                'task_type': domain_name,
                'task_data': {
                    'task_scores': task_scores,
                    'computed': domain_payload.get('computed', {}),
                },
                'score': domain_payload.get('domain_score'),
            }

            task_rule_results = screen_task_scores([synthetic_task], str(domain_name).lower())

            recommendations = RecommendationEngine.generate_recommendations(
                str(domain_name).lower(),
                task_rule_results['risk_level'],
                domain_payload.get('computed', {}),
                weak_tasks=task_rule_results.get('weak_tasks', []),
                critical_tasks=task_rule_results.get('critical_tasks', []),
            )

            if task_rule_results.get('weak_tasks'):
                recommendations.setdefault('personalized_notes', []).append(
                    'Weak task areas: ' + ', '.join(task_rule_results['weak_tasks'])
                )
            if task_rule_results.get('critical_tasks'):
                recommendations.setdefault('personalized_notes', []).append(
                    'Critical intervention priority tasks: ' + ', '.join(task_rule_results['critical_tasks'])
                )

            results[str(domain_name).lower()] = {
                'decision': {
                    'has_learning_disability': task_rule_results['has_learning_disability'],
                    'risk_level': task_rule_results['risk_level'],
                    'risk_score': task_rule_results['risk_score'],
                },
                'rule_results': task_rule_results,
                'recommendations': recommendations,
            }

        return jsonify({
            'success': True,
            'results': results,
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@analysis_bp.route('/process/<int:session_id>', methods=['POST'])
def process_assessment(session_id):
    """
    Process a completed assessment session
    - Extract features
    - Run rule-based screening
    - Run ML classification (if models available)
    - Generate hybrid decision
    - Create explanations
    - Generate recommendations
    """
    try:
        session = AssessmentSession.query.get_or_404(session_id)
        student = session.student
        
        if session.status != 'completed':
            return jsonify({
                'success': False,
                'error': 'Assessment must be completed before analysis'
            }), 400
        
        # Calculate student age at assessment
        age = calculate_age(student.date_of_birth, session.start_time)
        grade = student.grade
        
        # Get all task results
        task_results = session.task_results.all()
        
        # Group task results by disability category
        disability_tasks = {}
        for task in task_results:
            category = task.disability_category
            if category not in disability_tasks:
                disability_tasks[category] = []
            disability_tasks[category].append(task.to_dict())
        
        results = {}
        
        # Process each disability category
        for disability_category, tasks in disability_tasks.items():
            # 1. Extract features
            features = extract_features(tasks, disability_category, age, grade)
            
            # Save extracted features
            extracted = ExtractedFeatures(
                session_id=session.id,
                disability_category=disability_category,
                feature_vector=features,
                age_at_assessment=age,
                grade_at_assessment=grade
            )
            db.session.add(extracted)
            
            # 2. Rule-based screening
            # 2a) Feature-based rules (legacy)
            feature_rule_results = screen_features(features, disability_category)

            # 2b) Task-score rules (primary domain decision)
            task_rule_results = screen_task_scores(tasks, disability_category)
            
            # 3. ML classification (if model exists)
            ml_probability = 0.5  # Default
            ml_model_type = 'none'
            
            try:
                # Try to load trained model
                from config import Config
                classifier = DisabilityClassifier(disability_category, 'random_forest')
                model_path = os.path.join(
                    Config.ML_MODELS_DIR,
                    f"{disability_category}_random_forest_model.pkl"
                )
                
                if os.path.exists(model_path):
                    classifier.load_model(model_path)
                    _, ml_probability = classifier.predict(features)
                    ml_model_type = 'random_forest'
            except Exception as e:
                # If no model, use rule-based score as ML probability
                ml_probability = task_rule_results['risk_score']
                ml_model_type = 'rule_based_fallback'
            
            # 4. Hybrid decision
            hybrid_engine = HybridDecisionEngine()
            decision = hybrid_engine.make_decision(
                ml_probability,
                task_rule_results['risk_score'],
                task_rule_results['rules_triggered_count']
            )

            # Add explicit rule-based disability presence classification.
            decision['has_learning_disability'] = task_rule_results['has_learning_disability']
            decision['task_rule_risk_level'] = task_rule_results['risk_level']
            
            # Save risk score
            risk_score = RiskScore(
                session_id=session.id,
                disability_category=disability_category,
                ml_probability=ml_probability,
                ml_model_type=ml_model_type,
                rule_score=task_rule_results['risk_score'],
                triggered_rules=task_rule_results['triggered_rules'],
                final_score=decision['final_score'],
                # Keep displayed risk level aligned with the combined score.
                risk_level=decision['risk_level'],
                confidence=decision['confidence']
            )
            db.session.add(risk_score)
            
            # 5. Generate explanation
            explanation_text = explain_decision(decision, disability_category, features)
            
            # Get top 3 features
            sorted_features = sorted(features.items(), key=lambda x: abs(x[1] - 0.5), reverse=True)[:3]
            key_features = [
                {
                    'feature': fname,
                    'value': round(fval, 4),
                    'importance': 1.0 / (i + 1)  # Simple importance ranking
                }
                for i, (fname, fval) in enumerate(sorted_features)
            ]
            
            explanation = Explanation(
                session_id=session.id,
                disability_category=disability_category,
                key_features=key_features,
                explanation_text=explanation_text,
                contributing_tasks=[task['task_type'] for task in tasks]
            )
            db.session.add(explanation)
            
            # 6. Generate recommendations
            recommendations = RecommendationEngine.generate_recommendations(
                disability_category,
                task_rule_results['risk_level'],
                features,
                weak_tasks=task_rule_results.get('weak_tasks', []),
                critical_tasks=task_rule_results.get('critical_tasks', []),
            )

            if task_rule_results.get('weak_tasks'):
                recommendations.setdefault('personalized_notes', []).append(
                    'Weak task areas: ' + ', '.join(task_rule_results['weak_tasks'])
                )
            if task_rule_results.get('critical_tasks'):
                recommendations.setdefault('personalized_notes', []).append(
                    'Critical intervention priority tasks: ' + ', '.join(task_rule_results['critical_tasks'])
                )
            
            recommendation_record = Recommendation(
                session_id=session.id,
                disability_category=disability_category,
                risk_level=task_rule_results['risk_level'],
                classroom_accommodations=recommendations['classroom_accommodations'],
                practice_exercises=recommendations['practice_exercises'],
                assistive_strategies=recommendations['assistive_strategies'],
                teacher_action_plan=recommendations['teacher_action_plan'],
                notes='\n'.join(recommendations.get('personalized_notes', []))
            )
            db.session.add(recommendation_record)
            
            # 7. Update progress history
            # Get previous assessment for this student and disability
            previous_sessions = AssessmentSession.query.filter_by(
                student_id=student.id,
                status='completed'
            ).filter(
                AssessmentSession.id < session.id
            ).order_by(
                AssessmentSession.start_time.desc()
            ).all()
            
            previous_score = None
            for prev_session in previous_sessions:
                prev_risk = RiskScore.query.filter_by(
                    session_id=prev_session.id,
                    disability_category=disability_category
                ).first()
                if prev_risk:
                    previous_score = prev_risk.final_score
                    break
            
            score_change = None
            trend = None
            if previous_score is not None:
                score_change = decision['final_score'] - previous_score
                if score_change < -0.1:
                    trend = 'improving'
                elif score_change > 0.1:
                    trend = 'declining'
                else:
                    trend = 'stable'
            
            progress = ProgressHistory(
                student_id=student.id,
                session_id=session.id,
                disability_category=disability_category,
                risk_level=task_rule_results['risk_level'],
                risk_score=decision['final_score'],
                assessment_date=session.start_time,
                previous_risk_score=previous_score,
                score_change=score_change,
                trend=trend
            )
            db.session.add(progress)
            
            # Compile results for this disability
            results[disability_category] = {
                'features': features,
                'rule_results': task_rule_results,
                'feature_rule_results': feature_rule_results,
                'ml_probability': round(ml_probability, 4),
                'ml_model_type': ml_model_type,
                'decision': decision,
                'explanation': explanation_text,
                'recommendations': recommendations,
                'progress': {
                    'previous_score': previous_score,
                    'current_score': decision['final_score'],
                    'change': score_change,
                    'trend': trend
                }
            }
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Assessment processed successfully',
            'session_id': session_id,
            'results': results
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@analysis_bp.route('/session/<int:session_id>/results', methods=['GET'])
def get_analysis_results(session_id):
    """Get analysis results for a completed assessment"""
    try:
        session = AssessmentSession.query.get_or_404(session_id)
        
        # Get all related data
        risk_scores = session.risk_scores.all()
        explanations = session.explanations.all()
        features = session.extracted_features.all()
        
        results = {}
        
        for risk in risk_scores:
            category = risk.disability_category
            
            # Find matching explanation and features
            explanation = next((e for e in explanations if e.disability_category == category), None)
            feature_data = next((f for f in features if f.disability_category == category), None)
            
            # Get recommendations
            recommendation = Recommendation.query.filter_by(
                session_id=session_id,
                disability_category=category
            ).first()
            
            results[category] = {
                'risk_score': risk.to_dict(),
                'explanation': explanation.to_dict() if explanation else None,
                'features': feature_data.to_dict() if feature_data else None,
                'recommendations': recommendation.to_dict() if recommendation else None
            }
        
        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'results': results
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404


@analysis_bp.route('/student/<int:student_id>/progress', methods=['GET'])
def get_student_progress(student_id):
    """Get progress history for a student"""
    try:
        student = Student.query.get_or_404(student_id)
        
        # Get progress history
        history = ProgressHistory.query.filter_by(
            student_id=student_id
        ).order_by(
            ProgressHistory.assessment_date.desc()
        ).all()
        
        # Group by disability
        progress_by_disability = {}
        for record in history:
            category = record.disability_category
            if category not in progress_by_disability:
                progress_by_disability[category] = []
            progress_by_disability[category].append(record.to_dict())
        
        return jsonify({
            'success': True,
            'student': student.to_dict(),
            'progress': progress_by_disability
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404
