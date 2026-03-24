"""
Dyspraxia Assessment Tasks and Definitions
Motor Planning & Coordination Tasks
"""

# Task 1: Shape Replication
SHAPE_REPLICATION_TASK = {
    'task_id': 'dyspraxia_shape_replication',
    'task_name': 'Shape Drawing Task',
    'disability_category': 'dyspraxia',
    'description': 'Replicate various shapes without tracing',
    'instructions': 'Look at the shape and draw it in the box below.',
    'time_limit': 600,  # 10 minutes
    'shapes': [
        {'shape': 'circle', 'difficulty': 1, 'complexity': 'simple'},
        {'shape': 'square', 'difficulty': 1, 'complexity': 'simple'},
        {'shape': 'triangle', 'difficulty': 2, 'complexity': 'simple'},
        {'shape': 'diamond', 'difficulty': 2, 'complexity': 'moderate'},
        {'shape': 'hexagon', 'difficulty': 3, 'complexity': 'moderate'},
        {'shape': 'star', 'difficulty': 4, 'complexity': 'complex'}
    ],
    'evaluation_criteria': {
        'shape_accuracy': 0.3,
        'proportions': 0.2,
        'line_quality': 0.2,
        'completion': 0.15,
        'motor_control': 0.15
    }
}


# Task 2: Pattern Tracing
PATTERN_TRACING_TASK = {
    'task_id': 'dyspraxia_pattern_tracing',
    'task_name': 'Pattern Following Task',
    'disability_category': 'dyspraxia',
    'description': 'Trace complex patterns with precision',
    'instructions': 'Trace the pattern as carefully as you can, staying on the line.',
    'time_limit': 600,  # 10 minutes
    'patterns': [
        {'pattern': 'straight_line', 'difficulty': 1, 'length': 100},
        {'pattern': 'zigzag', 'difficulty': 2, 'complexity': 'moderate'},
        {'pattern': 'wave', 'difficulty': 3, 'complexity': 'moderate'},
        {'pattern': 'spiral', 'difficulty': 4, 'complexity': 'complex'},
        {'pattern': 'maze', 'difficulty': 5, 'complexity': 'complex'}
    ],
    'evaluation_criteria': {
        'path_deviation': 0.3,
        'smoothness': 0.25,
        'speed_consistency': 0.2,
        'pressure_control': 0.15,
        'completion': 0.1
    }
}


# Task 3: Reaction Time Task
REACTION_TIME_TASK = {
    'task_id': 'dyspraxia_reaction_time',
    'task_name': 'Quick Response Task',
    'disability_category': 'dyspraxia',
    'description': 'Respond quickly to visual stimuli',
    'instructions': 'Press the button as quickly as you can when you see the target.',
    'time_limit': 300,  # 5 minutes
    'trials': [
        {'stimulus': 'visual', 'target': 'circle', 'difficulty': 1},
        {'stimulus': 'visual', 'target': 'square', 'difficulty': 1},
        {'stimulus': 'visual_complex', 'target': 'red_circle', 'difficulty': 2},
        {'stimulus': 'visual_complex', 'target': 'blue_square', 'difficulty': 2},
        {'stimulus': 'auditory', 'target': 'beep', 'difficulty': 2},
        {'stimulus': 'multimodal', 'target': 'visual_and_auditory', 'difficulty': 3}
    ],
    'trial_count': 20,
    'evaluation_criteria': {
        'mean_reaction_time': 0.4,
        'reaction_time_variability': 0.3,
        'accuracy': 0.3
    }
}


# Task 4: Hand-Eye Coordination
HAND_EYE_COORDINATION_TASK = {
    'task_id': 'dyspraxia_hand_eye_coordination',
    'task_name': 'Coordination Challenge',
    'disability_category': 'dyspraxia',
    'description': 'Complete tasks requiring hand-eye coordination',
    'instructions': 'Follow the moving target with the cursor.',
    'time_limit': 600,  # 10 minutes
    'activities': [
        {
            'activity': 'dot_to_dot',
            'description': 'Connect numbered dots in sequence',
            'difficulty': 2,
            'targets': 10
        },
        {
            'activity': 'tracking',
            'description': 'Follow a moving object with cursor',
            'difficulty': 3,
            'duration': 30
        },
        {
            'activity': 'target_clicking',
            'description': 'Click on appearing targets',
            'difficulty': 3,
            'targets': 15
        },
        {
            'activity': 'path_navigation',
            'description': 'Navigate through a path without touching edges',
            'difficulty': 4,
            'complexity': 'high'
        }
    ],
    'evaluation_criteria': {
        'accuracy': 0.3,
        'smoothness': 0.25,
        'timing': 0.2,
        'error_rate': 0.15,
        'completion_rate': 0.1
    }
}


# Task 5: Directional Awareness
DIRECTIONAL_AWARENESS_TASK = {
    'task_id': 'dyspraxia_directional_awareness',
    'task_name': 'Left-Right Recognition',
    'disability_category': 'dyspraxia',
    'description': 'Identify left and right directions',
    'instructions': 'Point to the direction I say.',
    'time_limit': 300,  # 5 minutes
    'tasks': [
        {'instruction': 'Show me your left hand', 'correct': 'left', 'difficulty': 1},
        {'instruction': 'Show me your right hand', 'correct': 'right', 'difficulty': 1},
        {'instruction': 'Point to the left', 'correct': 'left', 'difficulty': 2},
        {'instruction': 'Point to the right', 'correct': 'right', 'difficulty': 2},
        {'instruction': 'Touch your left ear with your right hand', 'correct': 'cross_lateral', 'difficulty': 4},
        {'instruction': 'Point to my right hand', 'correct': 'perspective_shift', 'difficulty': 5}
    ],
    'evaluation_criteria': {
        'accuracy': 0.6,
        'response_time': 0.2,
        'hesitation': 0.2
    }
}


# Task 6: Sequential Motor Task
SEQUENTIAL_MOTOR_TASK = {
    'task_id': 'dyspraxia_sequential_motor',
    'task_name': 'Movement Sequence Task',
    'disability_category': 'dyspraxia',
    'description': 'Perform a sequence of motor actions',
    'instructions': 'Watch the sequence and repeat it exactly.',
    'time_limit': 600,  # 10 minutes
    'sequences': [
        {'sequence': ['tap', 'clap'], 'length': 2, 'difficulty': 1},
        {'sequence': ['tap', 'clap', 'snap'], 'length': 3, 'difficulty': 2},
        {'sequence': ['tap', 'clap', 'wave', 'snap'], 'length': 4, 'difficulty': 3},
        {'sequence': ['tap', 'clap', 'wave', 'snap', 'stomp'], 'length': 5, 'difficulty': 4}
    ],
    'evaluation_criteria': {
        'sequence_accuracy': 0.4,
        'timing_accuracy': 0.3,
        'motor_execution': 0.3
    }
}


# Task 7: Fine Motor Control
FINE_MOTOR_TASK = {
    'task_id': 'dyspraxia_fine_motor',
    'task_name': 'Precision Task',
    'disability_category': 'dyspraxia',
    'description': 'Complete tasks requiring fine motor precision',
    'instructions': 'Complete each activity as carefully as you can.',
    'time_limit': 600,  # 10 minutes
    'activities': [
        {'activity': 'bead_threading', 'description': 'Thread virtual beads', 'difficulty': 2},
        {'activity': 'knot_tying', 'description': 'Tie a simple knot', 'difficulty': 3},
        {'activity': 'button_fastening', 'description': 'Fasten buttons', 'difficulty': 3},
        {'activity': 'precision_clicking', 'description': 'Click on small targets', 'difficulty': 4}
    ],
    'evaluation_criteria': {
        'precision': 0.4,
        'completion_time': 0.3,
        'error_rate': 0.3
    }
}


# Comprehensive Dyspraxia Assessment
DYSPRAXIA_ASSESSMENT = {
    'assessment_id': 'dyspraxia_full',
    'disability_category': 'dyspraxia',
    'assessment_name': 'Dyspraxia Screening Assessment',
    'description': 'Comprehensive assessment for motor planning and coordination difficulties',
    'tasks': [
        SHAPE_REPLICATION_TASK,
        PATTERN_TRACING_TASK,
        REACTION_TIME_TASK,
        HAND_EYE_COORDINATION_TASK,
        DIRECTIONAL_AWARENESS_TASK,
        SEQUENTIAL_MOTOR_TASK,
        FINE_MOTOR_TASK
    ],
    'total_time_limit': 3600,  # 60 minutes
    'feature_extraction': {
        'tracing_deviation': {
            'source': ['pattern_tracing', 'shape_replication'],
            'normalization': 'age_grade'
        },
        'reaction_time': {
            'source': ['reaction_time'],
            'unit': 'milliseconds',
            'normalization': 'age_grade'
        },
        'movement_smoothness': {
            'source': ['pattern_tracing', 'hand_eye_coordination'],
            'normalization': 'age_grade'
        },
        'coordination_errors': {
            'source': ['hand_eye_coordination', 'fine_motor'],
            'normalization': 'age_grade'
        },
        'directional_confusion': {
            'source': ['directional_awareness'],
            'normalization': 'age_grade'
        },
        'motor_planning': {
            'source': ['sequential_motor', 'fine_motor'],
            'normalization': 'age_grade'
        }
    }
}
