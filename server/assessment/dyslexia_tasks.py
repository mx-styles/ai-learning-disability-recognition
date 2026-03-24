"""
Dyslexia Assessment Tasks and Definitions
Reading & Language Processing Tasks
"""

# Task 1: Word Reading Task
WORD_READING_TASK = {
    'task_id': 'dyslexia_word_reading',
    'task_name': 'Word Reading Task',
    'disability_category': 'dyslexia',
    'description': 'Read a list of words aloud with varying complexity',
    'instructions': 'Please read each word out loud as accurately as you can.',
    'time_limit': 300,  # 5 minutes
    'words': [
        # Simple words (CVC pattern)
        {'word': 'cat', 'difficulty': 1, 'phonemes': 3},
        {'word': 'dog', 'difficulty': 1, 'phonemes': 3},
        {'word': 'sun', 'difficulty': 1, 'phonemes': 3},
        {'word': 'bed', 'difficulty': 1, 'phonemes': 3},
        {'word': 'hat', 'difficulty': 1, 'phonemes': 3},
        
        # Consonant blends
        {'word': 'ship', 'difficulty': 2, 'phonemes': 3},
        {'word': 'frog', 'difficulty': 2, 'phonemes': 4},
        {'word': 'star', 'difficulty': 2, 'phonemes': 4},
        {'word': 'tree', 'difficulty': 2, 'phonemes': 3},
        {'word': 'blue', 'difficulty': 2, 'phonemes': 3},
        
        # Digraphs and complex patterns
        {'word': 'phone', 'difficulty': 3, 'phonemes': 3},
        {'word': 'light', 'difficulty': 3, 'phonemes': 3},
        {'word': 'night', 'difficulty': 3, 'phonemes': 3},
        {'word': 'though', 'difficulty': 3, 'phonemes': 2},
        {'word': 'thought', 'difficulty': 3, 'phonemes': 4},
        
        # Silent letters and irregular
        {'word': 'island', 'difficulty': 4, 'phonemes': 5},
        {'word': 'knight', 'difficulty': 4, 'phonemes': 3},
        {'word': 'answer', 'difficulty': 4, 'phonemes': 4},
        {'word': 'column', 'difficulty': 4, 'phonemes': 4},
        {'word': 'receipt', 'difficulty': 4, 'phonemes': 5}
    ],
    'scoring': {
        'accuracy_weight': 0.6,
        'speed_weight': 0.2,
        'phoneme_error_weight': 0.2
    }
}


# Task 2: Minimal Pair Discrimination
MINIMAL_PAIR_TASK = {
    'task_id': 'dyslexia_minimal_pairs',
    'task_name': 'Sound Discrimination Task',
    'disability_category': 'dyslexia',
    'description': 'Identify whether two words sound the same or different',
    'instructions': 'Listen carefully and tell me if the two words sound the same or different.',
    'time_limit': 180,  # 3 minutes
    'pairs': [
        {'pair': ['bat', 'pat'], 'same': False, 'phoneme_difference': 'initial'},
        {'pair': ['sip', 'zip'], 'same': False, 'phoneme_difference': 'initial'},
        {'pair': ['fan', 'van'], 'same': False, 'phoneme_difference': 'initial'},
        {'pair': ['thin', 'tin'], 'same': False, 'phoneme_difference': 'initial'},
        {'pair': ['ship', 'chip'], 'same': False, 'phoneme_difference': 'initial'},
        
        {'pair': ['bad', 'bed'], 'same': False, 'phoneme_difference': 'medial'},
        {'pair': ['pin', 'pen'], 'same': False, 'phoneme_difference': 'medial'},
        {'pair': ['cat', 'cot'], 'same': False, 'phoneme_difference': 'medial'},
        
        {'pair': ['bat', 'bad'], 'same': False, 'phoneme_difference': 'final'},
        {'pair': ['cap', 'cat'], 'same': False, 'phoneme_difference': 'final'},
        {'pair': ['pig', 'pin'], 'same': False, 'phoneme_difference': 'final'},
        
        # Same pairs (controls)
        {'pair': ['cat', 'cat'], 'same': True, 'phoneme_difference': None},
        {'pair': ['dog', 'dog'], 'same': True, 'phoneme_difference': None},
        {'pair': ['sun', 'sun'], 'same': True, 'phoneme_difference': None}
    ],
    'scoring': {
        'accuracy_weight': 1.0
    }
}


# Task 3: Letter Discrimination
LETTER_DISCRIMINATION_TASK = {
    'task_id': 'dyslexia_letter_discrimination',
    'task_name': 'Letter Recognition Task',
    'disability_category': 'dyslexia',
    'description': 'Identify letters and distinguish between similar-looking letters',
    'instructions': 'Look at each letter and tell me what letter it is.',
    'time_limit': 180,  # 3 minutes
    'letter_pairs': [
        {'letters': ['b', 'd'], 'confusion_type': 'mirror'},
        {'letters': ['p', 'q'], 'confusion_type': 'mirror'},
        {'letters': ['m', 'w'], 'confusion_type': 'rotation'},
        {'letters': ['u', 'n'], 'confusion_type': 'rotation'},
        {'letters': ['s', 'z'], 'confusion_type': 'similar'},
        {'letters': ['c', 'o'], 'confusion_type': 'similar'},
        {'letters': ['i', 'l'], 'confusion_type': 'similar'},
        {'letters': ['h', 'n'], 'confusion_type': 'similar'}
    ],
    'single_letters': ['a', 'e', 'r', 't', 'f', 'g', 'j', 'k'],
    'scoring': {
        'accuracy_weight': 0.7,
        'confusion_penalty': 0.3
    }
}


# Task 4: Paragraph Reading & Comprehension
PARAGRAPH_READING_TASK = {
    'task_id': 'dyslexia_paragraph_reading',
    'task_name': 'Reading Comprehension Task',
    'disability_category': 'dyslexia',
    'description': 'Read a paragraph and answer comprehension questions',
    'instructions': 'Read this paragraph carefully, then answer the questions.',
    'time_limit': 600,  # 10 minutes
    'paragraphs': [
        {
            'grade_level': '1-3',
            'text': 'The sun was shining brightly in the sky. Emma and her dog Max went to the park. They played with a red ball. Max ran very fast. Emma laughed and clapped her hands. They had a fun day at the park.',
            'word_count': 44,
            'questions': [
                {'question': 'Where did Emma and Max go?', 'answer': 'park', 'type': 'literal'},
                {'question': 'What color was the ball?', 'answer': 'red', 'type': 'literal'},
                {'question': 'Who is Max?', 'answer': 'dog', 'type': 'literal'},
                {'question': 'How did Emma feel?', 'answer': 'happy', 'type': 'inferential'}
            ]
        },
        {
            'grade_level': '4-6',
            'text': 'Photosynthesis is the process by which plants make their own food. Plants use sunlight, water, and carbon dioxide to create glucose and oxygen. The green pigment chlorophyll, found in leaves, captures the sunlight. This process is essential for life on Earth because it produces the oxygen we breathe.',
            'word_count': 49,
            'questions': [
                {'question': 'What do plants use to make food?', 'answer': 'sunlight, water, carbon dioxide', 'type': 'literal'},
                {'question': 'What does chlorophyll do?', 'answer': 'captures sunlight', 'type': 'literal'},
                {'question': 'Why is photosynthesis important?', 'answer': 'produces oxygen', 'type': 'inferential'},
                {'question': 'Where is chlorophyll found?', 'answer': 'leaves', 'type': 'literal'}
            ]
        }
    ],
    'scoring': {
        'reading_speed_weight': 0.3,  # Words per minute
        'accuracy_weight': 0.3,       # Reading accuracy
        'comprehension_weight': 0.4    # Question answers
    }
}


# Task 5: Verbal Sequential Memory
VERBAL_MEMORY_TASK = {
    'task_id': 'dyslexia_verbal_memory',
    'task_name': 'Word Sequence Memory',
    'disability_category': 'dyslexia',
    'description': 'Remember and repeat sequences of words',
    'instructions': 'Listen to the words and repeat them back in the same order.',
    'time_limit': 300,  # 5 minutes
    'sequences': [
        # Length 3
        {'sequence': ['cat', 'ball', 'tree'], 'length': 3},
        {'sequence': ['sun', 'book', 'chair'], 'length': 3},
        
        # Length 4
        {'sequence': ['dog', 'house', 'car', 'star'], 'length': 4},
        {'sequence': ['fish', 'clock', 'door', 'moon'], 'length': 4},
        
        # Length 5
        {'sequence': ['apple', 'table', 'shoe', 'cloud', 'pen'], 'length': 5},
        {'sequence': ['bird', 'glass', 'flag', 'cake', 'hat'], 'length': 5},
        
        # Length 6
        {'sequence': ['phone', 'grass', 'rain', 'sock', 'bear', 'lamp'], 'length': 6}
    ],
    'scoring': {
        'accuracy_weight': 0.6,
        'sequence_length_bonus': 0.4
    }
}


# Comprehensive Dyslexia Assessment
DYSLEXIA_ASSESSMENT = {
    'assessment_id': 'dyslexia_full',
    'disability_category': 'dyslexia',
    'assessment_name': 'Dyslexia Screening Assessment',
    'description': 'Comprehensive assessment for reading and language processing difficulties',
    'tasks': [
        WORD_READING_TASK,
        MINIMAL_PAIR_TASK,
        LETTER_DISCRIMINATION_TASK,
        PARAGRAPH_READING_TASK,
        VERBAL_MEMORY_TASK
    ],
    'total_time_limit': 1800,  # 30 minutes
    'feature_extraction': {
        'phoneme_error_rate': {
            'source': ['word_reading', 'minimal_pairs'],
            'normalization': 'age_grade'
        },
        'reading_accuracy': {
            'source': ['word_reading', 'paragraph_reading'],
            'normalization': 'age_grade'
        },
        'reading_speed': {
            'source': ['paragraph_reading'],
            'unit': 'words_per_minute',
            'normalization': 'age_grade'
        },
        'letter_confusion_score': {
            'source': ['letter_discrimination'],
            'normalization': 'age_grade'
        },
        'comprehension_accuracy': {
            'source': ['paragraph_reading'],
            'normalization': 'age_grade'
        },
        'verbal_memory': {
            'source': ['verbal_memory'],
            'normalization': 'age_grade'
        }
    }
}
