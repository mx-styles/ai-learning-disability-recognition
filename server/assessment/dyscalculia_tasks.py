"""
Dyscalculia Assessment Tasks and Definitions
Numerical Cognition Tasks
"""

# Task 1: Skip Counting
SKIP_COUNTING_TASK = {
    'task_id': 'dyscalculia_skip_counting',
    'task_name': 'Skip Counting Task',
    'disability_category': 'dyscalculia',
    'description': 'Count by 2s, 5s, and 10s',
    'instructions': 'Count out loud by the number shown.',
    'time_limit': 300,  # 5 minutes
    'sequences': [
        {'start': 2, 'increment': 2, 'target': 20, 'difficulty': 1},
        {'start': 5, 'increment': 5, 'target': 50, 'difficulty': 2},
        {'start': 10, 'increment': 10, 'target': 100, 'difficulty': 2},
        {'start': 3, 'increment': 3, 'target': 30, 'difficulty': 3}
    ],
    'evaluation_criteria': {
        'accuracy': 0.6,
        'speed': 0.2,
        'pattern_recognition': 0.2
    }
}


# Task 2: Mental Arithmetic
MENTAL_ARITHMETIC_TASK = {
    'task_id': 'dyscalculia_mental_arithmetic',
    'task_name': 'Mental Math Task',
    'disability_category': 'dyscalculia',
    'description': 'Solve single-digit arithmetic problems mentally',
    'instructions': 'Solve each problem in your head and tell me the answer.',
    'time_limit': 600,  # 10 minutes
    'problems': [
        # Addition
        {'problem': '2 + 3', 'answer': 5, 'operation': 'addition', 'difficulty': 1},
        {'problem': '5 + 4', 'answer': 9, 'operation': 'addition', 'difficulty': 1},
        {'problem': '7 + 6', 'answer': 13, 'operation': 'addition', 'difficulty': 2},
        {'problem': '8 + 9', 'answer': 17, 'operation': 'addition', 'difficulty': 2},
        
        # Subtraction
        {'problem': '5 - 2', 'answer': 3, 'operation': 'subtraction', 'difficulty': 1},
        {'problem': '9 - 4', 'answer': 5, 'operation': 'subtraction', 'difficulty': 1},
        {'problem': '12 - 7', 'answer': 5, 'operation': 'subtraction', 'difficulty': 2},
        {'problem': '15 - 8', 'answer': 7, 'operation': 'subtraction', 'difficulty': 2},
        
        # Multiplication (if age appropriate)
        {'problem': '2 × 3', 'answer': 6, 'operation': 'multiplication', 'difficulty': 2},
        {'problem': '5 × 4', 'answer': 20, 'operation': 'multiplication', 'difficulty': 3},
        
        # Division (if age appropriate)
        {'problem': '10 ÷ 2', 'answer': 5, 'operation': 'division', 'difficulty': 3},
        {'problem': '15 ÷ 3', 'answer': 5, 'operation': 'division', 'difficulty': 3}
    ],
    'evaluation_criteria': {
        'accuracy': 0.7,
        'response_time': 0.3
    }
}


# Task 3: Symbol Recognition
SYMBOL_RECOGNITION_TASK = {
    'task_id': 'dyscalculia_symbol_recognition',
    'task_name': 'Math Symbol Recognition',
    'disability_category': 'dyscalculia',
    'description': 'Identify mathematical symbols and their meanings',
    'instructions': 'Look at each symbol and tell me what it means.',
    'time_limit': 180,  # 3 minutes
    'symbols': [
        {'symbol': '+', 'meaning': 'plus/addition', 'difficulty': 1},
        {'symbol': '-', 'meaning': 'minus/subtraction', 'difficulty': 1},
        {'symbol': '×', 'meaning': 'times/multiplication', 'difficulty': 2},
        {'symbol': '÷', 'meaning': 'divided by/division', 'difficulty': 2},
        {'symbol': '=', 'meaning': 'equals', 'difficulty': 1},
        {'symbol': '<', 'meaning': 'less than', 'difficulty': 3},
        {'symbol': '>', 'meaning': 'greater than', 'difficulty': 3},
        {'symbol': '%', 'meaning': 'percent', 'difficulty': 4}
    ],
    'evaluation_criteria': {
        'accuracy': 0.8,
        'confusion_rate': 0.2
    }
}


# Task 4: Quantity Comparison
QUANTITY_COMPARISON_TASK = {
    'task_id': 'dyscalculia_quantity_comparison',
    'task_name': 'Number Comparison Task',
    'disability_category': 'dyscalculia',
    'description': 'Compare quantities and determine which is greater',
    'instructions': 'Look at the two numbers and tell me which is bigger.',
    'time_limit': 300,  # 5 minutes
    'comparisons': [
        {'numbers': [5, 8], 'correct': 8, 'difficulty': 1},
        {'numbers': [12, 9], 'correct': 12, 'difficulty': 1},
        {'numbers': [23, 32], 'correct': 32, 'difficulty': 2},
        {'numbers': [47, 74], 'correct': 74, 'difficulty': 2},
        {'numbers': [156, 165], 'correct': 165, 'difficulty': 3},
        {'numbers': [1002, 1020], 'correct': 1020, 'difficulty': 4}
    ],
    'evaluation_criteria': {
        'accuracy': 0.7,
        'response_time': 0.3
    }
}


# Task 5: Math Fact Recall
MATH_FACT_RECALL_TASK = {
    'task_id': 'dyscalculia_fact_recall',
    'task_name': 'Math Facts Memory',
    'disability_category': 'dyscalculia',
    'description': 'Quickly recall basic math facts',
    'instructions': 'Answer as quickly as you can.',
    'time_limit': 300,  # 5 minutes
    'facts': [
        {'problem': '5 + 5', 'answer': 10, 'difficulty': 1},
        {'problem': '10 + 10', 'answer': 20, 'difficulty': 1},
        {'problem': '2 × 2', 'answer': 4, 'difficulty': 1},
        {'problem': '5 × 2', 'answer': 10, 'difficulty': 2},
        {'problem': '10 × 3', 'answer': 30, 'difficulty': 2},
        {'problem': '20 ÷ 2', 'answer': 10, 'difficulty': 2},
        {'problem': '100 - 50', 'answer': 50, 'difficulty': 2}
    ],
    'evaluation_criteria': {
        'accuracy': 0.6,
        'automaticity': 0.4  # Speed of recall
    }
}


# Task 6: Fact Family Reasoning
FACT_FAMILY_TASK = {
    'task_id': 'dyscalculia_fact_family',
    'task_name': 'Number Relationships',
    'disability_category': 'dyscalculia',
    'description': 'Understand relationships between numbers',
    'instructions': 'Use what you know to find the answer.',
    'time_limit': 300,  # 5 minutes
    'problems': [
        {'given': '5 + 5 = 10', 'question': '10 - 5 = ?', 'answer': 5, 'difficulty': 2},
        {'given': '3 × 4 = 12', 'question': '12 ÷ 3 = ?', 'answer': 4, 'difficulty': 3},
        {'given': '7 + 3 = 10', 'question': '10 - 3 = ?', 'answer': 7, 'difficulty': 2},
        {'given': '2 × 5 = 10', 'question': '10 ÷ 2 = ?', 'answer': 5, 'difficulty': 3}
    ],
    'evaluation_criteria': {
        'conceptual_understanding': 0.7,
        'accuracy': 0.3
    }
}


# Task 7: Number Line Task
NUMBER_LINE_TASK = {
    'task_id': 'dyscalculia_number_line',
    'task_name': 'Number Line Placement',
    'disability_category': 'dyscalculia',
    'description': 'Place numbers on a number line',
    'instructions': 'Show me where this number belongs on the number line.',
    'time_limit': 300,  # 5 minutes
    'tasks': [
        {'range': [0, 10], 'target': 5, 'difficulty': 1},
        {'range': [0, 10], 'target': 7, 'difficulty': 1},
        {'range': [0, 20], 'target': 15, 'difficulty': 2},
        {'range': [0, 100], 'target': 50, 'difficulty': 2},
        {'range': [0, 100], 'target': 75, 'difficulty': 3},
        {'range': [0, 1000], 'target': 250, 'difficulty': 4}
    ],
    'evaluation_criteria': {
        'placement_accuracy': 0.7,
        'magnitude_understanding': 0.3
    }
}


# Task 8: Numeral Recognition
NUMERAL_RECOGNITION_TASK = {
    'task_id': 'dyscalculia_numeral_recognition',
    'task_name': 'Number Word Recognition',
    'disability_category': 'dyscalculia',
    'description': 'Match digits with number words',
    'instructions': 'Match the number with its word.',
    'time_limit': 300,  # 5 minutes
    'items': [
        {'digit': 5, 'word': 'five', 'difficulty': 1},
        {'digit': 12, 'word': 'twelve', 'difficulty': 2},
        {'digit': 30, 'word': 'thirty', 'difficulty': 2},
        {'digit': 47, 'word': 'forty-seven', 'difficulty': 3},
        {'digit': 100, 'word': 'one hundred', 'difficulty': 3}
    ],
    'evaluation_criteria': {
        'accuracy': 1.0
    }
}


# Comprehensive Dyscalculia Assessment
DYSCALCULIA_ASSESSMENT = {
    'assessment_id': 'dyscalculia_full',
    'disability_category': 'dyscalculia',
    'assessment_name': 'Dyscalculia Screening Assessment',
    'description': 'Comprehensive assessment for numerical cognition difficulties',
    'tasks': [
        SKIP_COUNTING_TASK,
        MENTAL_ARITHMETIC_TASK,
        SYMBOL_RECOGNITION_TASK,
        QUANTITY_COMPARISON_TASK,
        MATH_FACT_RECALL_TASK,
        FACT_FAMILY_TASK,
        NUMBER_LINE_TASK,
        NUMERAL_RECOGNITION_TASK
    ],
    'total_time_limit': 2400,  # 40 minutes
    'feature_extraction': {
        'counting_accuracy': {
            'source': ['skip_counting'],
            'normalization': 'age_grade'
        },
        'arithmetic_accuracy': {
            'source': ['mental_arithmetic', 'fact_recall'],
            'normalization': 'age_grade'
        },
        'symbol_confusion': {
            'source': ['symbol_recognition'],
            'normalization': 'age_grade'
        },
        'quantity_comparison': {
            'source': ['quantity_comparison'],
            'normalization': 'age_grade'
        },
        'fact_recall_consistency': {
            'source': ['fact_recall', 'fact_family'],
            'normalization': 'age_grade'
        },
        'number_line_deviation': {
            'source': ['number_line'],
            'normalization': 'age_grade'
        }
    }
}
