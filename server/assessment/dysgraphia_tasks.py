"""
Dysgraphia Assessment Tasks and Definitions
Writing & Motor-Linguistic Output Tasks
"""

# Task 1: Copying Task
COPYING_TASK = {
    'task_id': 'dysgraphia_copying',
    'task_name': 'Sentence Copying Task',
    'disability_category': 'dysgraphia',
    'description': 'Copy sentences with varying complexity',
    'instructions': 'Copy each sentence as neatly and accurately as you can.',
    'time_limit': 600,  # 10 minutes
    'sentences': [
        {'text': 'The cat sat on the mat.', 'difficulty': 1, 'char_count': 23},
        {'text': 'I like to play with my friends.', 'difficulty': 2, 'char_count': 31},
        {'text': 'The quick brown fox jumps over the lazy dog.', 'difficulty': 3, 'char_count': 45},
        {'text': 'Beautiful butterflies flutter gracefully through the garden.', 'difficulty': 4, 'char_count': 60}
    ],
    'evaluation_criteria': {
        'letter_formation': 0.3,
        'spacing': 0.2,
        'line_adherence': 0.2,
        'speed': 0.15,
        'accuracy': 0.15
    }
}


# Task 2: Dictation Task
DICTATION_TASK = {
    'task_id': 'dysgraphia_dictation',
    'task_name': 'Dictation Writing Task',
    'disability_category': 'dysgraphia',
    'description': 'Write sentences from dictation',
    'instructions': 'Listen carefully and write down each sentence you hear.',
    'time_limit': 600,  # 10 minutes
    'sentences': [
        {'text': 'I have a pet dog.', 'difficulty': 1, 'word_count': 5},
        {'text': 'The sun shines brightly today.', 'difficulty': 2, 'word_count': 5},
        {'text': 'We went to the store to buy milk and bread.', 'difficulty': 3, 'word_count': 10},
        {'text': 'The children played happily in the playground after school.', 'difficulty': 4, 'word_count': 10}
    ],
    'evaluation_criteria': {
        'spelling_accuracy': 0.4,
        'spelling_consistency': 0.2,
        'writing_speed': 0.2,
        'letter_formation': 0.2
    }
}


# Task 3: Free Writing Task
FREE_WRITING_TASK = {
    'task_id': 'dysgraphia_free_writing',
    'task_name': 'Creative Writing Task',
    'disability_category': 'dysgraphia',
    'description': 'Write a short paragraph about a given topic',
    'instructions': 'Write a short paragraph (4-5 sentences) about the topic.',
    'time_limit': 600,  # 10 minutes
    'prompts': [
        {'topic': 'My favorite animal', 'grade_level': '1-3'},
        {'topic': 'A fun day with friends', 'grade_level': '4-6'},
        {'topic': 'What I want to be when I grow up', 'grade_level': '7-9'}
    ],
    'evaluation_criteria': {
        'writing_fluency': 0.3,
        'spelling_errors': 0.2,
        'letter_formation': 0.2,
        'spacing_consistency': 0.15,
        'motor_control': 0.15
    }
}


# Task 4: Letter Formation Tracing
LETTER_TRACING_TASK = {
    'task_id': 'dysgraphia_letter_tracing',
    'task_name': 'Letter Formation Task',
    'disability_category': 'dysgraphia',
    'description': 'Trace and write individual letters',
    'instructions': 'Trace each letter carefully, then write it on your own.',
    'time_limit': 300,  # 5 minutes
    'letters': [
        {'letter': 'a', 'difficulty': 1, 'stroke_count': 2},
        {'letter': 'b', 'difficulty': 2, 'stroke_count': 2},
        {'letter': 'd', 'difficulty': 2, 'stroke_count': 2},
        {'letter': 'g', 'difficulty': 3, 'stroke_count': 2},
        {'letter': 'p', 'difficulty': 2, 'stroke_count': 2},
        {'letter': 'm', 'difficulty': 2, 'stroke_count': 1},
        {'letter': 'n', 'difficulty': 1, 'stroke_count': 1},
        {'letter': 'r', 'difficulty': 1, 'stroke_count': 1}
    ],
    'evaluation_criteria': {
        'stroke_accuracy': 0.4,
        'letter_size_consistency': 0.2,
        'formation_order': 0.2,
        'motor_hesitation': 0.2
    }
}


# Task 5: Shape Tracing
SHAPE_TRACING_TASK = {
    'task_id': 'dysgraphia_shape_tracing',
    'task_name': 'Shape Tracing Task',
    'disability_category': 'dysgraphia',
    'description': 'Trace various shapes with precision',
    'instructions': 'Trace each shape as carefully as you can, staying on the lines.',
    'time_limit': 300,  # 5 minutes
    'shapes': [
        {'shape': 'circle', 'difficulty': 1},
        {'shape': 'square', 'difficulty': 2},
        {'shape': 'triangle', 'difficulty': 2},
        {'shape': 'zigzag', 'difficulty': 3},
        {'shape': 'spiral', 'difficulty': 4},
        {'shape': 'star', 'difficulty': 4}
    ],
    'evaluation_criteria': {
        'path_deviation': 0.3,
        'smoothness': 0.3,
        'completion_accuracy': 0.2,
        'motor_control': 0.2
    }
}


# Comprehensive Dysgraphia Assessment
DYSGRAPHIA_ASSESSMENT = {
    'assessment_id': 'dysgraphia_full',
    'disability_category': 'dysgraphia',
    'assessment_name': 'Dysgraphia Screening Assessment',
    'description': 'Comprehensive assessment for writing and motor-linguistic difficulties',
    'tasks': [
        COPYING_TASK,
        DICTATION_TASK,
        FREE_WRITING_TASK,
        LETTER_TRACING_TASK,
        SHAPE_TRACING_TASK
    ],
    'total_time_limit': 2400,  # 40 minutes
    'feature_extraction': {
        'writing_speed': {
            'source': ['copying', 'dictation', 'free_writing'],
            'unit': 'characters_per_minute',
            'normalization': 'age_grade'
        },
        'spelling_error_rate': {
            'source': ['dictation', 'free_writing'],
            'normalization': 'age_grade'
        },
        'spelling_inconsistency': {
            'source': ['dictation', 'free_writing'],
            'normalization': 'age_grade'
        },
        'spacing_variance': {
            'source': ['copying', 'dictation'],
            'normalization': 'age_grade'
        },
        'line_drift': {
            'source': ['copying', 'free_writing'],
            'normalization': 'age_grade'
        },
        'stroke_deviation': {
            'source': ['letter_tracing', 'shape_tracing'],
            'normalization': 'age_grade'
        },
        'motor_hesitation': {
            'source': ['letter_tracing', 'copying'],
            'normalization': 'age_grade'
        }
    }
}
