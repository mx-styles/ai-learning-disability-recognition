"""
Feature Extraction Pipeline
Extracts normalized features from task results
"""

import numpy as np
from datetime import date, datetime
from typing import Dict, List, Any


# Age and Grade Normalization Tables (based on research literature)
AGE_GRADE_NORMS = {
    'dyslexia': {
        'reading_speed': {  # Words per minute
            6: {'mean': 30, 'std': 10},
            7: {'mean': 45, 'std': 12},
            8: {'mean': 65, 'std': 15},
            9: {'mean': 85, 'std': 18},
            10: {'mean': 100, 'std': 20},
            11: {'mean': 115, 'std': 22},
            12: {'mean': 130, 'std': 24},
            13: {'mean': 145, 'std': 25},
            14: {'mean': 155, 'std': 26},
            15: {'mean': 165, 'std': 27}
        },
        'reading_accuracy': {  # Proportion correct
            6: {'mean': 0.75, 'std': 0.12},
            7: {'mean': 0.80, 'std': 0.11},
            8: {'mean': 0.85, 'std': 0.10},
            9: {'mean': 0.88, 'std': 0.09},
            10: {'mean': 0.90, 'std': 0.08},
            11: {'mean': 0.92, 'std': 0.07},
            12: {'mean': 0.94, 'std': 0.06},
            13: {'mean': 0.95, 'std': 0.05},
            14: {'mean': 0.96, 'std': 0.04},
            15: {'mean': 0.97, 'std': 0.04}
        },
        'phoneme_error_rate': {  # Proportion errors
            6: {'mean': 0.20, 'std': 0.08},
            7: {'mean': 0.15, 'std': 0.07},
            8: {'mean': 0.12, 'std': 0.06},
            9: {'mean': 0.10, 'std': 0.05},
            10: {'mean': 0.08, 'std': 0.04},
            11: {'mean': 0.06, 'std': 0.03},
            12: {'mean': 0.05, 'std': 0.03},
            13: {'mean': 0.04, 'std': 0.02},
            14: {'mean': 0.03, 'std': 0.02},
            15: {'mean': 0.02, 'std': 0.02}
        }
    },
    'dysgraphia': {
        'writing_speed': {  # Characters per minute
            6: {'mean': 20, 'std': 8},
            7: {'mean': 30, 'std': 10},
            8: {'mean': 40, 'std': 12},
            9: {'mean': 50, 'std': 14},
            10: {'mean': 60, 'std': 15},
            11: {'mean': 70, 'std': 16},
            12: {'mean': 80, 'std': 17},
            13: {'mean': 85, 'std': 18},
            14: {'mean': 90, 'std': 18},
            15: {'mean': 95, 'std': 19}
        },
        'spelling_error_rate': {  # Proportion errors
            6: {'mean': 0.25, 'std': 0.10},
            7: {'mean': 0.20, 'std': 0.09},
            8: {'mean': 0.15, 'std': 0.08},
            9: {'mean': 0.12, 'std': 0.07},
            10: {'mean': 0.10, 'std': 0.06},
            11: {'mean': 0.08, 'std': 0.05},
            12: {'mean': 0.06, 'std': 0.04},
            13: {'mean': 0.05, 'std': 0.03},
            14: {'mean': 0.04, 'std': 0.03},
            15: {'mean': 0.03, 'std': 0.02}
        }
    },
    'dyscalculia': {
        'arithmetic_accuracy': {  # Proportion correct
            6: {'mean': 0.65, 'std': 0.15},
            7: {'mean': 0.72, 'std': 0.14},
            8: {'mean': 0.78, 'std': 0.13},
            9: {'mean': 0.83, 'std': 0.12},
            10: {'mean': 0.87, 'std': 0.11},
            11: {'mean': 0.90, 'std': 0.10},
            12: {'mean': 0.92, 'std': 0.09},
            13: {'mean': 0.94, 'std': 0.08},
            14: {'mean': 0.95, 'std': 0.07},
            15: {'mean': 0.96, 'std': 0.06}
        },
        'counting_accuracy': {  # Proportion correct
            6: {'mean': 0.75, 'std': 0.12},
            7: {'mean': 0.82, 'std': 0.11},
            8: {'mean': 0.88, 'std': 0.10},
            9: {'mean': 0.92, 'std': 0.08},
            10: {'mean': 0.95, 'std': 0.06},
            11: {'mean': 0.97, 'std': 0.04},
            12: {'mean': 0.98, 'std': 0.03},
            13: {'mean': 0.99, 'std': 0.02},
            14: {'mean': 0.99, 'std': 0.01},
            15: {'mean': 0.99, 'std': 0.01}
        }
    },
    'dyspraxia': {
        'reaction_time': {  # Milliseconds
            6: {'mean': 450, 'std': 80},
            7: {'mean': 420, 'std': 75},
            8: {'mean': 390, 'std': 70},
            9: {'mean': 360, 'std': 65},
            10: {'mean': 340, 'std': 60},
            11: {'mean': 320, 'std': 55},
            12: {'mean': 300, 'std': 50},
            13: {'mean': 285, 'std': 45},
            14: {'mean': 270, 'std': 40},
            15: {'mean': 260, 'std': 38}
        },
        'coordination_accuracy': {  # Proportion correct
            6: {'mean': 0.60, 'std': 0.15},
            7: {'mean': 0.68, 'std': 0.14},
            8: {'mean': 0.75, 'std': 0.13},
            9: {'mean': 0.80, 'std': 0.12},
            10: {'mean': 0.84, 'std': 0.11},
            11: {'mean': 0.88, 'std': 0.10},
            12: {'mean': 0.91, 'std': 0.09},
            13: {'mean': 0.93, 'std': 0.08},
            14: {'mean': 0.95, 'std': 0.07},
            15: {'mean': 0.96, 'std': 0.06}
        }
    }
}


def calculate_age(date_of_birth: datetime, assessment_date: datetime) -> float:
    """Calculate age in years with decimal precision"""
    if isinstance(date_of_birth, date) and not isinstance(date_of_birth, datetime):
        date_of_birth = datetime.combine(date_of_birth, datetime.min.time())
    if isinstance(assessment_date, date) and not isinstance(assessment_date, datetime):
        assessment_date = datetime.combine(assessment_date, datetime.min.time())

    age_delta = assessment_date - date_of_birth
    age_years = age_delta.days / 365.25
    return round(age_years, 2)


def z_score_normalize(value: float, age: int, feature_name: str, disability_category: str) -> float:
    """
    Normalize a feature value using age-based z-score normalization
    Z-score = (value - mean) / std
    """
    # Get age-specific norms (round age to nearest year)
    age_rounded = round(age)
    age_rounded = max(6, min(15, age_rounded))  # Clip to valid range
    
    try:
        norms = AGE_GRADE_NORMS[disability_category].get(feature_name, {})
        if age_rounded not in norms:
            # Use nearest available age
            available_ages = sorted(norms.keys())
            age_rounded = min(available_ages, key=lambda x: abs(x - age_rounded))
        
        mean = norms[age_rounded]['mean']
        std = norms[age_rounded]['std']
        
        # Calculate z-score
        z_score = (value - mean) / std if std > 0 else 0
        
        # Normalize to 0-1 scale (clip at ±3 std)
        normalized = (z_score + 3) / 6
        normalized = max(0, min(1, normalized))
        
        return round(normalized, 4)
    
    except (KeyError, ZeroDivisionError):
        # Return raw value if normalization fails
        return value


def extract_dyslexia_features(task_results: List[Dict], age: float, grade: int) -> Dict[str, float]:
    """Extract and normalize features for dyslexia assessment"""
    features = {
        'phoneme_error_rate': 0.0,
        'reading_accuracy': 0.0,
        'reading_speed': 0.0,
        'letter_confusion_score': 0.0,
        'comprehension_accuracy': 0.0,
        'verbal_memory': 0.0
    }
    
    for task in task_results:
        task_type = task.get('task_type', '')
        task_data = task.get('task_data', {})
        
        if 'word_reading' in task_type:
            # Extract reading metrics
            total_words = len(task_data.get('responses', []))
            correct_words = sum(1 for r in task_data.get('responses', []) if r.get('correct', False))
            phoneme_errors = sum(r.get('phoneme_errors', 0) for r in task_data.get('responses', []))
            
            features['reading_accuracy'] = correct_words / total_words if total_words > 0 else 0
            features['phoneme_error_rate'] = phoneme_errors / (total_words * 3) if total_words > 0 else 0
            
            # Words per minute
            time_seconds = task.get('completion_time', 1)
            features['reading_speed'] = (total_words / time_seconds) * 60 if time_seconds > 0 else 0
        
        elif 'minimal_pair' in task_type:
            # Phoneme discrimination
            responses = task_data.get('responses', [])
            correct = sum(1 for r in responses if r.get('correct', False))
            features['phoneme_error_rate'] = max(features['phoneme_error_rate'], 
                                                  1 - (correct / len(responses)) if responses else 0)
        
        elif 'letter_discrimination' in task_type:
            # Letter confusion
            responses = task_data.get('responses', [])
            confusions = sum(1 for r in responses if r.get('confused', False))
            features['letter_confusion_score'] = confusions / len(responses) if responses else 0
        
        elif 'paragraph_reading' in task_type:
            # Comprehension
            questions = task_data.get('questions', [])
            correct = sum(1 for q in questions if q.get('correct', False))
            features['comprehension_accuracy'] = correct / len(questions) if questions else 0
            
            # Update reading speed if applicable
            words = task_data.get('word_count', 0)
            time_seconds = task.get('completion_time', 1)
            speed = (words / time_seconds) * 60 if time_seconds > 0 and words > 0 else 0
            if speed > 0:
                features['reading_speed'] = speed
        
        elif 'verbal_memory' in task_type:
            # Verbal memory
            sequences = task_data.get('responses', [])
            correct = sum(1 for s in sequences if s.get('correct', False))
            features['verbal_memory'] = correct / len(sequences) if sequences else 0
    
    # Normalize features
    normalized_features = {}
    for feature_name, value in features.items():
        if feature_name in ['reading_speed', 'reading_accuracy', 'phoneme_error_rate']:
            normalized_features[feature_name] = z_score_normalize(value, age, feature_name, 'dyslexia')
        else:
            # Simple 0-1 normalization for other features
            normalized_features[feature_name] = min(1.0, max(0.0, value))
    
    return normalized_features


def extract_dysgraphia_features(task_results: List[Dict], age: float, grade: int) -> Dict[str, float]:
    """Extract and normalize features for dysgraphia assessment"""
    features = {
        'writing_speed': 0.0,
        'spelling_error_rate': 0.0,
        'spelling_inconsistency': 0.0,
        'spacing_variance': 0.0,
        'stroke_deviation': 0.0,
        'motor_hesitation': 0.0
    }
    
    for task in task_results:
        task_type = task.get('task_type', '')
        task_data = task.get('task_data', {})
        
        if 'copying' in task_type or 'dictation' in task_type or 'free_writing' in task_type:
            # Writing speed (characters per minute)
            char_count = task_data.get('character_count', 0)
            time_seconds = task.get('completion_time', 1)
            speed = (char_count / time_seconds) * 60 if time_seconds > 0 else 0
            features['writing_speed'] = max(features['writing_speed'], speed)
            
            # Spelling errors
            total_words = task_data.get('word_count', 0)
            spelling_errors = task_data.get('spelling_errors', 0)
            if total_words > 0:
                error_rate = spelling_errors / total_words
                features['spelling_error_rate'] = max(features['spelling_error_rate'], error_rate)
            
            # Spelling inconsistency (same word spelled differently)
            inconsistencies = task_data.get('spelling_inconsistencies', 0)
            features['spelling_inconsistency'] = max(features['spelling_inconsistency'], inconsistencies / 10)
            
            # Spacing variance
            spacing_score = task_data.get('spacing_variance', 0)
            features['spacing_variance'] = max(features['spacing_variance'], spacing_score)
        
        elif 'letter_tracing' in task_type or 'shape_tracing' in task_type:
            # Stroke deviation
            deviation = task_data.get('average_deviation', 0)
            features['stroke_deviation'] = max(features['stroke_deviation'], deviation / 10)
            
            # Motor hesitation
            hesitations = task_data.get('hesitation_count', 0)
            features['motor_hesitation'] = max(features['motor_hesitation'], hesitations / 5)
    
    # Normalize features
    normalized_features = {}
    for feature_name, value in features.items():
        if feature_name in ['writing_speed', 'spelling_error_rate']:
            normalized_features[feature_name] = z_score_normalize(value, age, feature_name, 'dysgraphia')
        else:
            normalized_features[feature_name] = min(1.0, max(0.0, value))
    
    return normalized_features


def extract_dyscalculia_features(task_results: List[Dict], age: float, grade: int) -> Dict[str, float]:
    """Extract and normalize features for dyscalculia assessment"""
    features = {
        'counting_accuracy': 0.0,
        'arithmetic_accuracy': 0.0,
        'symbol_confusion': 0.0,
        'quantity_comparison': 0.0,
        'fact_recall_consistency': 0.0,
        'number_line_deviation': 0.0
    }
    
    for task in task_results:
        task_type = task.get('task_type', '')
        task_data = task.get('task_data', {})
        
        if 'skip_counting' in task_type:
            # Counting accuracy
            sequences = task_data.get('responses', [])
            correct = sum(1 for s in sequences if s.get('correct', False))
            features['counting_accuracy'] = correct / len(sequences) if sequences else 0
        
        elif 'mental_arithmetic' in task_type or 'fact_recall' in task_type:
            # Arithmetic accuracy
            responses = task_data.get('responses', [])
            correct = sum(1 for r in responses if r.get('correct', False))
            accuracy = correct / len(responses) if responses else 0
            features['arithmetic_accuracy'] = max(features['arithmetic_accuracy'], accuracy)
            
            # Fact recall consistency (low variance = high consistency)
            response_times = [r.get('response_time', 0) for r in responses if r.get('response_time')]
            if response_times:
                variance = np.var(response_times)
                consistency = 1 / (1 + variance / 1000)  # Normalize variance
                features['fact_recall_consistency'] = max(features['fact_recall_consistency'], consistency)
        
        elif 'symbol_recognition' in task_type:
            # Symbol confusion
            responses = task_data.get('responses', [])
            confusions = sum(1 for r in responses if r.get('confused', False))
            features['symbol_confusion'] = confusions / len(responses) if responses else 0
        
        elif 'quantity_comparison' in task_type:
            # Quantity comparison
            responses = task_data.get('responses', [])
            correct = sum(1 for r in responses if r.get('correct', False))
            features['quantity_comparison'] = correct / len(responses) if responses else 0
        
        elif 'number_line' in task_type:
            # Number line deviation
            responses = task_data.get('responses', [])
            deviations = [abs(r.get('deviation', 0)) for r in responses]
            avg_deviation = np.mean(deviations) if deviations else 0
            features['number_line_deviation'] = min(1.0, avg_deviation / 100)
    
    # Normalize features
    normalized_features = {}
    for feature_name, value in features.items():
        if feature_name in ['arithmetic_accuracy', 'counting_accuracy']:
            normalized_features[feature_name] = z_score_normalize(value, age, feature_name, 'dyscalculia')
        else:
            normalized_features[feature_name] = min(1.0, max(0.0, value))
    
    return normalized_features


def extract_dyspraxia_features(task_results: List[Dict], age: float, grade: int) -> Dict[str, float]:
    """Extract and normalize features for dyspraxia assessment"""
    features = {
        'tracing_deviation': 0.0,
        'reaction_time': 0.0,
        'movement_smoothness': 0.0,
        'coordination_errors': 0.0,
        'directional_confusion': 0.0
    }
    
    for task in task_results:
        task_type = task.get('task_type', '')
        task_data = task.get('task_data', {})
        
        if 'pattern_tracing' in task_type or 'shape_replication' in task_type:
            # Tracing deviation
            deviation = task_data.get('average_deviation', 0)
            features['tracing_deviation'] = max(features['tracing_deviation'], deviation / 10)
            
            # Movement smoothness (inverse of jerkiness)
            jerkiness = task_data.get('jerkiness_score', 0)
            smoothness = 1 - min(1.0, jerkiness / 10)
            features['movement_smoothness'] = max(features['movement_smoothness'], smoothness)
        
        elif 'reaction_time' in task_type:
            # Reaction time
            times = [r.get('reaction_time', 0) for r in task_data.get('responses', [])]
            if times:
                avg_rt = np.mean(times)
                features['reaction_time'] = avg_rt
        
        elif 'hand_eye_coordination' in task_type or 'fine_motor' in task_type:
            # Coordination errors
            errors = task_data.get('error_count', 0)
            total = task_data.get('total_attempts', 1)
            features['coordination_errors'] = max(features['coordination_errors'], errors / total)
        
        elif 'directional_awareness' in task_type:
            # Directional confusion
            responses = task_data.get('responses', [])
            errors = sum(1 for r in responses if not r.get('correct', False))
            features['directional_confusion'] = errors / len(responses) if responses else 0
    
    # Normalize features
    normalized_features = {}
    for feature_name, value in features.items():
        if feature_name in ['reaction_time', 'coordination_accuracy']:
            normalized_features[feature_name] = z_score_normalize(value, age, feature_name, 'dyspraxia')
        else:
            normalized_features[feature_name] = min(1.0, max(0.0, value))
    
    return normalized_features


def extract_features(task_results: List[Dict], disability_category: str, 
                    age: float, grade: int) -> Dict[str, float]:
    """
    Main feature extraction function
    Routes to appropriate disability-specific extractor
    """
    if disability_category == 'dyslexia':
        return extract_dyslexia_features(task_results, age, grade)
    elif disability_category == 'dysgraphia':
        return extract_dysgraphia_features(task_results, age, grade)
    elif disability_category == 'dyscalculia':
        return extract_dyscalculia_features(task_results, age, grade)
    elif disability_category == 'dyspraxia':
        return extract_dyspraxia_features(task_results, age, grade)
    else:
        raise ValueError(f"Unknown disability category: {disability_category}")
