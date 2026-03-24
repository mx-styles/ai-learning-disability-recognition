"""
Recommendation Engine
Generates disability-specific educational recommendations and interventions
"""

from typing import Dict, List


# Dyslexia Recommendations
DYSLEXIA_RECOMMENDATIONS = {
    'high': {
        'classroom_accommodations': [
            'Provide extended time for reading tasks (1.5x to 2x standard time)',
            'Allow use of audiobooks and text-to-speech software',
            'Provide written instructions alongside verbal instructions',
            'Use larger fonts and increased spacing in reading materials',
            'Reduce amount of reading required; focus on quality over quantity',
            'Seat student away from distractions',
            'Allow oral responses instead of written when appropriate'
        ],
        'practice_exercises': [
            'Daily phonics drills (15-20 minutes) focusing on phoneme awareness',
            'Multisensory reading activities (Orton-Gillingham approach)',
            'Repeated reading of familiar texts to build fluency',
            'Word family and rhyming activities',
            'Letter-sound correspondence exercises',
            'Sight word practice using flashcards',
            'Reading comprehension strategies (summarizing, predicting, questioning)'
        ],
        'assistive_strategies': [
            'Use colored overlays or tinted glasses to reduce visual stress',
            'Implement Read&Write or similar assistive reading software',
            'Provide access to digital texts for adjustable formatting',
            'Use graphic organizers for reading comprehension',
            'Teach systematic phonics approach',
            'Use multi-sensory techniques (visual, auditory, kinesthetic)',
            'Break reading material into smaller, manageable chunks'
        ],
        'teacher_action_plan': [
            'Conduct weekly progress monitoring using oral reading fluency probes',
            'Implement intensive phonics intervention program',
            'Consult with reading specialist for targeted intervention',
            'Communicate regularly with parents about home practice',
            'Document specific areas of difficulty for ongoing assessment',
            'Consider referral for comprehensive psychoeducational evaluation',
            'Adjust curriculum expectations as needed'
        ]
    },
    'moderate': {
        'classroom_accommodations': [
            'Provide extended time for reading tasks (1.25x standard time)',
            'Allow use of text-to-speech for lengthy passages',
            'Provide both written and verbal instructions',
            'Use clear, sans-serif fonts (12-14 pt)',
            'Pre-teach vocabulary before reading activities',
            'Allow breaks during extended reading'
        ],
        'practice_exercises': [
            'Daily phonics practice (10-15 minutes)',
            'Paired reading with fluent reader',
            'Word pattern recognition activities',
            'Comprehension strategy instruction',
            'Vocabulary building exercises',
            'Timed reading practice to build fluency'
        ],
        'assistive_strategies': [
            'Use graphic organizers for comprehension',
            'Provide audio support for textbooks when available',
            'Teach decoding strategies explicitly',
            'Use highlighted or color-coded text',
            'Implement structured literacy approach',
            'Use reading guides or bookmarks to track lines'
        ],
        'teacher_action_plan': [
            'Monitor reading progress bi-weekly',
            'Implement small-group reading intervention',
            'Provide additional phonics instruction',
            'Communicate with parents monthly',
            'Track improvement in reading accuracy and fluency',
            'Adjust strategies based on response to intervention'
        ]
    },
    'low': {
        'classroom_accommodations': [
            'Provide clear instructions for reading tasks',
            'Allow use of dictionaries and reference materials',
            'Encourage reading at student\'s own pace'
        ],
        'practice_exercises': [
            'Regular independent reading practice',
            'Vocabulary enrichment activities',
            'Comprehension strategy practice',
            'Reading for enjoyment (choice reading)'
        ],
        'assistive_strategies': [
            'Use of graphic organizers when helpful',
            'Reading comprehension strategies',
            'Note-taking techniques'
        ],
        'teacher_action_plan': [
            'Continue regular classroom literacy instruction',
            'Monitor progress with standard assessments',
            'Encourage continued reading practice'
        ]
    }
}


# Dysgraphia Recommendations
DYSGRAPHIA_RECOMMENDATIONS = {
    'high': {
        'classroom_accommodations': [
            'Allow use of word processor or speech-to-text software for all writing',
            'Provide extended time for writing tasks (2x standard time)',
            'Reduce writing requirements; focus on quality over quantity',
            'Accept typed or dictated responses instead of handwritten',
            'Provide copies of class notes',
            'Allow student to demonstrate knowledge through oral presentations',
            'Use graphic organizers and writing templates'
        ],
        'practice_exercises': [
            'Daily handwriting practice (10-15 minutes) with occupational therapy exercises',
            'Fine motor skill development activities',
            'Letter formation practice using multi-sensory methods',
            'Typing/keyboarding instruction and practice',
            'Pre-writing activities (tracing, patterns)',
            'Grip strengthening exercises',
            'Sentence construction practice with reduced writing load'
        ],
        'assistive_strategies': [
            'Use speech-to-text software (Dragon, Google Voice Typing)',
            'Provide access to word processor with spell-check',
            'Use pencil grips and ergonomic writing tools',
            'Implement word prediction software',
            'Use graphic organizers and mind maps',
            'Teach touch-typing systematically',
            'Allow use of audio recorder for note-taking'
        ],
        'teacher_action_plan': [
            'Consult with occupational therapist for evaluation',
            'Implement intensive handwriting intervention program',
            'Monitor progress weekly with writing samples',
            'Reduce handwriting requirements across subjects',
            'Focus on content rather than mechanics in initial drafts',
            'Provide explicit instruction in written expression',
            'Consider assistive technology assessment'
        ]
    },
    'moderate': {
        'classroom_accommodations': [
            'Allow use of word processor for longer assignments',
            'Provide extended time for writing (1.5x standard time)',
            'Reduce length requirements for written work',
            'Provide writing templates and organizers',
            'Allow alternative formats for some assignments',
            'Break writing tasks into smaller steps'
        ],
        'practice_exercises': [
            'Daily handwriting practice (10 minutes)',
            'Fine motor activities',
            'Typing practice (15 minutes daily)',
            'Letter formation drills',
            'Sentence and paragraph writing practice',
            'Spelling pattern practice'
        ],
        'assistive_strategies': [
            'Use of word processor with spell-check',
            'Pencil grips if helpful',
            'Graphic organizers for planning',
            'Reference sheets for letter formation',
            'Speech-to-text for drafting',
            'Breaking writing into planning/drafting/revising stages'
        ],
        'teacher_action_plan': [
            'Monitor writing progress bi-weekly',
            'Provide targeted handwriting instruction',
            'Teach keyboarding skills',
            'Implement accommodations as needed',
            'Focus on writing strategies and organization',
            'Communicate with parents about home practice'
        ]
    },
    'low': {
        'classroom_accommodations': [
            'Provide writing templates when helpful',
            'Teach organization strategies',
            'Allow adequate time for writing tasks'
        ],
        'practice_exercises': [
            'Regular writing practice',
            'Keyboarding skills development',
            'Spelling and grammar practice',
            'Handwriting maintenance'
        ],
        'assistive_strategies': [
            'Use of word processor when appropriate',
            'Graphic organizers for planning',
            'Editing checklists'
        ],
        'teacher_action_plan': [
            'Continue regular writing instruction',
            'Monitor progress with standard assessments',
            'Encourage regular practice'
        ]
    }
}


# Dyscalculia Recommendations
DYSCALCULIA_RECOMMENDATIONS = {
    'high': {
        'classroom_accommodations': [
            'Allow use of calculator for all computations',
            'Provide extended time for math tasks (2x standard time)',
            'Reduce number of problems; focus on understanding concepts',
            'Provide math fact charts and reference sheets',
            'Use graph paper for alignment',
            'Allow oral explanation of math reasoning',
            'Provide step-by-step instructions and examples'
        ],
        'practice_exercises': [
            'Daily number sense activities (10-15 minutes)',
            'Concrete manipulatives for all math concepts',
            'Number line activities',
            'Math fact fluency practice (with visual supports)',
            'Real-world math application problems',
            'Pattern recognition activities',
            'Estimation and mental math strategies'
        ],
        'assistive_strategies': [
            'Use concrete manipulatives (blocks, counters, base-ten materials)',
            'Implement number lines and hundreds charts',
            'Use color-coding for place value and operations',
            'Provide math vocabulary reference sheets',
            'Use visual models for all operations',
            'Allow use of calculator and math software',
            'Teach estimation strategies before exact computation'
        ],
        'teacher_action_plan': [
            'Implement intensive math intervention program',
            'Use multi-sensory math instruction approach',
            'Monitor progress weekly with targeted assessments',
            'Break math concepts into small, sequential steps',
            'Provide extensive practice with concrete materials',
            'Consider referral for comprehensive evaluation',
            'Consult with math specialist for intervention strategies'
        ]
    },
    'moderate': {
        'classroom_accommodations': [
            'Allow use of calculator for complex computations',
            'Provide extended time for math (1.5x standard time)',
            'Provide reference sheets for formulas and math facts',
            'Use graph paper for organization',
            'Reduce number of practice problems',
            'Highlight key words in word problems'
        ],
        'practice_exercises': [
            'Daily math fact practice (10 minutes)',
            'Number sense activities',
            'Manipulative-based problem solving',
            'Mental math strategies practice',
            'Word problem strategies',
            'Place value activities'
        ],
        'assistive_strategies': [
            'Use of manipulatives for concept introduction',
            'Number lines and visual aids',
            'Step-by-step problem-solving guides',
            'Calculator for verification',
            'Color-coding for operations',
            'Visual fraction models'
        ],
        'teacher_action_plan': [
            'Implement small-group math intervention',
            'Monitor progress bi-weekly',
            'Use concrete-representational-abstract approach',
            'Provide additional practice with visual supports',
            'Teach problem-solving strategies explicitly',
            'Communicate with parents about home practice'
        ]
    },
    'low': {
        'classroom_accommodations': [
            'Provide clear instructions',
            'Allow use of reference materials',
            'Use visual aids when introducing new concepts'
        ],
        'practice_exercises': [
            'Regular math practice',
            'Mental math exercises',
            'Problem-solving activities',
            'Math facts maintenance'
        ],
        'assistive_strategies': [
            'Use of calculator when appropriate',
            'Visual models for complex concepts',
            'Estimation strategies'
        ],
        'teacher_action_plan': [
            'Continue regular math instruction',
            'Monitor progress with standard assessments',
            'Encourage problem-solving practice'
        ]
    }
}


# Dyspraxia Recommendations
DYSPRAXIA_RECOMMENDATIONS = {
    'high': {
        'classroom_accommodations': [
            'Allow extended time for all motor tasks (2x standard time)',
            'Provide preferential seating near instruction and away from traffic areas',
            'Allow use of technology to minimize handwriting (word processor)',
            'Break down motor tasks into small, explicit steps',
            'Provide visual schedules and step-by-step instructions',
            'Allow movement breaks every 20-30 minutes',
            'Reduce copying requirements from board'
        ],
        'practice_exercises': [
            'Daily occupational therapy exercises (15-20 minutes)',
            'Fine motor skill activities (beading, playdough, threading)',
            'Gross motor coordination practice',
            'Balance and coordination activities',
            'Hand-eye coordination games',
            'Sequential movement practice',
            'Body awareness activities'
        ],
        'assistive_strategies': [
            'Use of word processor and assistive technology',
            'Pencil grips and adaptive writing tools',
            'Slant boards for writing',
            'Non-slip mats for stability',
            'Visual schedules and task breakdowns',
            'Step-by-step written instructions',
            'Allow extra time for transitions'
        ],
        'teacher_action_plan': [
            'Refer to occupational therapist for comprehensive evaluation',
            'Implement daily motor skills intervention',
            'Monitor progress weekly with motor task observations',
            'Reduce motor demands in academic tasks when possible',
            'Teach self-regulation and organizational strategies',
            'Provide explicit instruction for motor sequences',
            'Coordinate with OT for classroom strategies'
        ]
    },
    'moderate': {
        'classroom_accommodations': [
            'Allow extended time for motor tasks (1.5x standard time)',
            'Provide clear, step-by-step instructions',
            'Allow use of technology for lengthy writing',
            'Provide movement breaks as needed',
            'Reduce copying requirements',
            'Allow oral responses when appropriate'
        ],
        'practice_exercises': [
            'Daily fine motor practice (10-15 minutes)',
            'Coordination activities',
            'Balance exercises',
            'Handwriting practice with supports',
            'Sequential task practice',
            'Hand-eye coordination activities'
        ],
        'assistive_strategies': [
            'Use of adaptive tools as needed',
            'Visual supports for multi-step tasks',
            'Breaking tasks into manageable steps',
            'Use of technology for writing when helpful',
            'Extra time for motor activities',
            'Environmental modifications for safety'
        ],
        'teacher_action_plan': [
            'Implement motor skills support activities',
            'Monitor progress bi-weekly',
            'Provide accommodations for motor tasks',
            'Teach organizational strategies',
            'Consider OT consultation',
            'Communicate with parents about home activities'
        ]
    },
    'low': {
        'classroom_accommodations': [
            'Provide clear instructions for motor tasks',
            'Allow adequate time for activities',
            'Provide visual supports when helpful'
        ],
        'practice_exercises': [
            'Regular physical education participation',
            'Fine motor skill maintenance',
            'Coordination activities',
            'Practice with sequential tasks'
        ],
        'assistive_strategies': [
            'Visual supports for complex tasks',
            'Step-by-step instructions when needed',
            'Encourage participation in motor activities'
        ],
        'teacher_action_plan': [
            'Continue regular instruction',
            'Monitor development',
            'Encourage physical activity and skill development'
        ]
    }
}


RECOMMENDATION_SETS = {
    'dyslexia': DYSLEXIA_RECOMMENDATIONS,
    'dysgraphia': DYSGRAPHIA_RECOMMENDATIONS,
    'dyscalculia': DYSCALCULIA_RECOMMENDATIONS,
    'dyspraxia': DYSPRAXIA_RECOMMENDATIONS
}


TASK_FOCUS_KEYWORDS = {
    'dyslexia': {
        'word_reading_accuracy': ['reading', 'fluency', 'phonics', 'decoding'],
        'minimal_pair_discrimination': ['phoneme', 'phonics', 'auditory', 'letter-sound'],
        'letter_discrimination': ['letter', 'visual', 'decoding', 'highlighted'],
        'paragraph_reading_comprehension': ['comprehension', 'summarizing', 'questioning', 'graphic organizer'],
        'verbal_sequential_memory': ['memory', 'sequence', 'chunk', 'step-by-step'],
    },
    'dysgraphia': {
        'sentence_copying': ['handwriting', 'letter formation', 'copy', 'templates'],
        'dictation': ['spelling', 'dictation', 'word processor', 'speech-to-text'],
        'free_writing_sample': ['writing', 'organizers', 'planning', 'draft'],
        'letter_formation_tracing': ['letter formation', 'fine motor', 'occupational', 'grip'],
        'shape_tracing': ['tracing', 'fine motor', 'pre-writing', 'control'],
    },
    'dyscalculia': {
        'skip_counting': ['counting', 'number sense', 'number line'],
        'mental_arithmetic': ['arithmetic', 'math fact', 'operations', 'calculator'],
        'symbol_recognition': ['symbol', 'vocabulary', 'visual', 'operation'],
        'quantity_comparison': ['quantity', 'comparison', 'magnitude', 'visual'],
        'number_line_task': ['number line', 'magnitude', 'visual', 'estimation'],
    },
    'dyspraxia': {
        'shape_replication': ['motor', 'coordination', 'sequen', 'step-by-step'],
        'pattern_tracing': ['tracing', 'motor', 'coordination', 'fine motor'],
        'reaction_time': ['reaction', 'timing', 'movement break', 'self-regulation'],
        'hand_eye_coordination': ['coordination', 'hand-eye', 'balance', 'motor'],
        'directional_awareness': ['direction', 'visual', 'step-by-step', 'sequential'],
    },
}


class RecommendationEngine:
    """Generate educational recommendations based on risk level"""
    
    @staticmethod
    def generate_recommendations(disability_category: str, risk_level: str, 
                                features: Dict[str, float] = None,
                                weak_tasks: List[str] = None,
                                critical_tasks: List[str] = None) -> Dict[str, List[str]]:
        """
        Generate recommendations for a specific disability and risk level
        
        Args:
            disability_category: 'dyslexia', 'dysgraphia', 'dyscalculia', or 'dyspraxia'
            risk_level: 'low', 'moderate', or 'high'
            features: Optional feature dictionary for personalization
        
        Returns:
            Dictionary with recommendation categories
        """
        recommendations = RECOMMENDATION_SETS.get(disability_category, {})
        level_recommendations = recommendations.get(risk_level, {})
        
        # Clone to avoid modifying original
        output = {
            'classroom_accommodations': level_recommendations.get('classroom_accommodations', []).copy(),
            'practice_exercises': level_recommendations.get('practice_exercises', []).copy(),
            'assistive_strategies': level_recommendations.get('assistive_strategies', []).copy(),
            'teacher_action_plan': level_recommendations.get('teacher_action_plan', []).copy()
        }
        
        # Personalize based on features if provided
        if features:
            output = RecommendationEngine._personalize_recommendations(
                output, disability_category, features
            )

        focused_tasks = list(dict.fromkeys((critical_tasks or []) + (weak_tasks or [])))
        output = RecommendationEngine._focus_recommendations_by_tasks(
            output,
            disability_category,
            risk_level,
            focused_tasks,
        )
        
        return output

    @staticmethod
    def _focus_recommendations_by_tasks(recommendations: Dict[str, List[str]],
                                        disability_category: str,
                                        risk_level: str,
                                        focused_tasks: List[str]) -> Dict[str, List[str]]:
        """
        Keep recommendation items that align with weak/critical tasks first,
        then include a small fallback set to avoid returning empty categories.
        """
        if not focused_tasks:
            # Keep concise output even with no explicit weak task signal.
            fallback_count = 3 if risk_level == 'high' else 2
            return {
                key: value[:fallback_count] if isinstance(value, list) else value
                for key, value in recommendations.items()
            }

        domain_keywords = TASK_FOCUS_KEYWORDS.get(disability_category, {})
        focus_keywords = set()
        for task in focused_tasks:
            focus_keywords.update(domain_keywords.get(task, []))

        focused_output = {}
        max_items = 3 if risk_level == 'high' else 2

        for category, items in recommendations.items():
            if not isinstance(items, list):
                focused_output[category] = items
                continue

            scored_items = []
            for item in items:
                text = item.lower()
                score = sum(1 for kw in focus_keywords if kw and kw in text)
                scored_items.append((score, item))

            matched = [item for score, item in scored_items if score > 0]
            if matched:
                focused_output[category] = matched[:max_items]
            else:
                focused_output[category] = items[:1]

        focused_output['targeted_task_focus'] = focused_tasks
        return focused_output
    
    @staticmethod
    def _personalize_recommendations(recommendations: Dict, disability_category: str, 
                                    features: Dict[str, float]) -> Dict:
        """
        Personalize recommendations based on specific feature weaknesses
        (Can be expanded to add more targeted recommendations)
        """
        # This is a simplified personalization
        # In a production system, this could be much more sophisticated
        
        # Add feature-specific notes
        notes = []
        
        if disability_category == 'dyslexia':
            if features.get('phoneme_error_rate', 0) > 0.7:
                notes.append("Focus heavily on phonemic awareness and phonics instruction.")
            if features.get('reading_speed', 1) < 0.3:
                notes.append("Prioritize fluency-building activities with repeated reading.")
            if features.get('comprehension_accuracy', 1) < 0.4:
                notes.append("Implement explicit comprehension strategy instruction.")
        
        elif disability_category == 'dysgraphia':
            if features.get('motor_hesitation', 0) > 0.7:
                notes.append("Emphasize occupational therapy for fine motor development.")
            if features.get('spelling_inconsistency', 0) > 0.7:
                notes.append("Focus on systematic spelling instruction with visual supports.")
        
        elif disability_category == 'dyscalculia':
            if features.get('number_line_deviation', 0) > 0.7:
                notes.append("Intensive number line and magnitude comparison activities needed.")
            if features.get('arithmetic_accuracy', 1) < 0.3:
                notes.append("Begin with concrete manipulatives for all operations.")
        
        elif disability_category == 'dyspraxia':
            if features.get('coordination_errors', 0) > 0.7:
                notes.append("Occupational therapy evaluation strongly recommended.")
            if features.get('directional_confusion', 0) > 0.6:
                notes.append("Explicit instruction in directional concepts needed.")
        
        recommendations['personalized_notes'] = notes
        
        return recommendations
    
    @staticmethod
    def generate_multi_recommendations(decisions: Dict[str, Dict]) -> Dict[str, Dict]:
        """
        Generate recommendations for multiple disabilities
        
        Args:
            decisions: Dict of disability -> decision dict (with risk_level, features, etc.)
        
        Returns:
            Dict of disability -> recommendations
        """
        all_recommendations = {}
        
        for disability, decision in decisions.items():
            risk_level = decision.get('risk_level', 'low')
            features = decision.get('features', {})
            
            recommendations = RecommendationEngine.generate_recommendations(
                disability, risk_level, features
            )
            
            all_recommendations[disability] = recommendations
        
        return all_recommendations
