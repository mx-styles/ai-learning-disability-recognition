"""
Rule-Based Screening Engine
Threshold-based classification rules for each disability
"""

from typing import Any, Dict, List, Tuple


class Rule:
    """Represents a single screening rule"""
    def __init__(self, rule_id: str, condition: callable, weight: float, description: str):
        self.rule_id = rule_id
        self.condition = condition
        self.weight = weight
        self.description = description
    
    def evaluate(self, features: Dict[str, float]) -> bool:
        """Evaluate if the rule condition is met"""
        try:
            return self.condition(features)
        except (KeyError, TypeError):
            return False


# Dyslexia Rules
DYSLEXIA_RULES = [
    Rule(
        rule_id='DYS_R1',
        condition=lambda f: f.get('reading_speed', 1.0) < 0.3 and f.get('reading_accuracy', 1.0) < 0.4,
        weight=0.9,
        description='Severely low reading speed AND accuracy (high risk)'
    ),
    Rule(
        rule_id='DYS_R2',
        condition=lambda f: f.get('phoneme_error_rate', 0.0) > 0.7,
        weight=0.8,
        description='High phoneme processing errors (phonological deficit)'
    ),
    Rule(
        rule_id='DYS_R3',
        condition=lambda f: f.get('letter_confusion_score', 0.0) > 0.6 and f.get('reading_accuracy', 1.0) < 0.5,
        weight=0.7,
        description='High letter confusion with poor reading accuracy'
    ),
    Rule(
        rule_id='DYS_R4',
        condition=lambda f: f.get('comprehension_accuracy', 1.0) < 0.4 and f.get('reading_speed', 1.0) < 0.5,
        weight=0.6,
        description='Poor comprehension with slow reading'
    ),
    Rule(
        rule_id='DYS_R5',
        condition=lambda f: f.get('verbal_memory', 1.0) < 0.4,
        weight=0.5,
        description='Weak verbal sequential memory'
    ),
    Rule(
        rule_id='DYS_R6',
        condition=lambda f: f.get('reading_speed', 1.0) < 0.4,
        weight=0.4,
        description='Below-average reading speed'
    ),
    Rule(
        rule_id='DYS_R7',
        condition=lambda f: f.get('phoneme_error_rate', 0.0) > 0.5 and f.get('letter_confusion_score', 0.0) > 0.4,
        weight=0.7,
        description='Combined phoneme and visual processing difficulties'
    )
]


# Dysgraphia Rules
DYSGRAPHIA_RULES = [
    Rule(
        rule_id='DYG_R1',
        condition=lambda f: f.get('writing_speed', 1.0) < 0.3 and f.get('spelling_error_rate', 0.0) > 0.6,
        weight=0.9,
        description='Very slow writing with frequent spelling errors'
    ),
    Rule(
        rule_id='DYG_R2',
        condition=lambda f: f.get('spelling_inconsistency', 0.0) > 0.7,
        weight=0.8,
        description='High spelling inconsistency (same word spelled differently)'
    ),
    Rule(
        rule_id='DYG_R3',
        condition=lambda f: f.get('stroke_deviation', 0.0) > 0.7 and f.get('motor_hesitation', 0.0) > 0.6,
        weight=0.8,
        description='Poor motor control with frequent hesitations'
    ),
    Rule(
        rule_id='DYG_R4',
        condition=lambda f: f.get('spacing_variance', 0.0) > 0.6,
        weight=0.6,
        description='Inconsistent letter and word spacing'
    ),
    Rule(
        rule_id='DYG_R5',
        condition=lambda f: f.get('writing_speed', 1.0) < 0.4,
        weight=0.5,
        description='Below-average writing speed'
    ),
    Rule(
        rule_id='DYG_R6',
        condition=lambda f: f.get('motor_hesitation', 0.0) > 0.7,
        weight=0.6,
        description='Frequent motor hesitations during writing'
    ),
    Rule(
        rule_id='DYG_R7',
        condition=lambda f: f.get('spelling_error_rate', 0.0) > 0.5 and f.get('spelling_inconsistency', 0.0) > 0.5,
        weight=0.7,
        description='Combined spelling errors and inconsistency'
    )
]


# Dyscalculia Rules
DYSCALCULIA_RULES = [
    Rule(
        rule_id='DYC_R1',
        condition=lambda f: f.get('arithmetic_accuracy', 1.0) < 0.3 and f.get('counting_accuracy', 1.0) < 0.4,
        weight=0.9,
        description='Severe difficulties in both arithmetic and counting'
    ),
    Rule(
        rule_id='DYC_R2',
        condition=lambda f: f.get('number_line_deviation', 0.0) > 0.7,
        weight=0.8,
        description='Poor number sense and magnitude understanding'
    ),
    Rule(
        rule_id='DYC_R3',
        condition=lambda f: f.get('symbol_confusion', 0.0) > 0.6,
        weight=0.7,
        description='High mathematical symbol confusion'
    ),
    Rule(
        rule_id='DYC_R4',
        condition=lambda f: f.get('fact_recall_consistency', 1.0) < 0.4,
        weight=0.7,
        description='Poor automaticity in math fact recall'
    ),
    Rule(
        rule_id='DYC_R5',
        condition=lambda f: f.get('quantity_comparison', 1.0) < 0.5,
        weight=0.6,
        description='Difficulty comparing quantities'
    ),
    Rule(
        rule_id='DYC_R6',
        condition=lambda f: f.get('counting_accuracy', 1.0) < 0.5,
        weight=0.5,
        description='Below-average counting skills'
    ),
    Rule(
        rule_id='DYC_R7',
        condition=lambda f: f.get('arithmetic_accuracy', 1.0) < 0.4 and f.get('symbol_confusion', 0.0) > 0.5,
        weight=0.8,
        description='Combined arithmetic difficulty and symbol confusion'
    )
]


# Dyspraxia Rules
DYSPRAXIA_RULES = [
    Rule(
        rule_id='DYP_R1',
        condition=lambda f: f.get('coordination_errors', 0.0) > 0.7 and f.get('reaction_time', 0.0) > 0.7,
        weight=0.9,
        description='Severe coordination difficulties with slow reactions'
    ),
    Rule(
        rule_id='DYP_R2',
        condition=lambda f: f.get('tracing_deviation', 0.0) > 0.7,
        weight=0.8,
        description='High tracing and path deviation (motor planning deficit)'
    ),
    Rule(
        rule_id='DYP_R3',
        condition=lambda f: f.get('movement_smoothness', 1.0) < 0.3,
        weight=0.7,
        description='Very poor movement smoothness (jerky movements)'
    ),
    Rule(
        rule_id='DYP_R4',
        condition=lambda f: f.get('directional_confusion', 0.0) > 0.6,
        weight=0.6,
        description='High directional awareness confusion'
    ),
    Rule(
        rule_id='DYP_R5',
        condition=lambda f: f.get('reaction_time', 0.0) > 0.7,
        weight=0.5,
        description='Significantly delayed reaction time'
    ),
    Rule(
        rule_id='DYP_R6',
        condition=lambda f: f.get('coordination_errors', 0.0) > 0.6,
        weight=0.6,
        description='Frequent coordination errors'
    ),
    Rule(
        rule_id='DYP_R7',
        condition=lambda f: f.get('tracing_deviation', 0.0) > 0.6 and f.get('movement_smoothness', 1.0) < 0.4,
        weight=0.8,
        description='Combined motor planning and execution difficulties'
    )
]


# Rule sets for each disability
RULE_SETS = {
    'dyslexia': DYSLEXIA_RULES,
    'dysgraphia': DYSGRAPHIA_RULES,
    'dyscalculia': DYSCALCULIA_RULES,
    'dyspraxia': DYSPRAXIA_RULES
}


class RuleBasedEngine:
    """Rule-based screening engine"""
    
    def __init__(self, disability_category: str):
        self.disability_category = disability_category
        self.rules = RULE_SETS.get(disability_category, [])
    
    def evaluate(self, features: Dict[str, float]) -> Tuple[float, List[str]]:
        """
        Evaluate all rules and return risk score and triggered rules
        
        Returns:
            Tuple of (risk_score, triggered_rule_ids)
        """
        triggered_rules = []
        total_weight = 0.0
        weighted_sum = 0.0
        
        for rule in self.rules:
            if rule.evaluate(features):
                triggered_rules.append(rule.rule_id)
                weighted_sum += rule.weight
            total_weight += rule.weight
        
        # Calculate rule-based risk score (0-1)
        rule_score = weighted_sum / total_weight if total_weight > 0 else 0.0
        
        return rule_score, triggered_rules
    
    def get_rule_descriptions(self, rule_ids: List[str]) -> List[Dict[str, str]]:
        """Get human-readable descriptions of triggered rules"""
        descriptions = []
        for rule in self.rules:
            if rule.rule_id in rule_ids:
                descriptions.append({
                    'rule_id': rule.rule_id,
                    'description': rule.description,
                    'weight': rule.weight
                })
        return descriptions


def screen_features(features: Dict[str, float], disability_category: str) -> Dict:
    """
    Screen features using rule-based engine
    
    Args:
        features: Normalized feature dictionary
        disability_category: 'dyslexia', 'dysgraphia', 'dyscalculia', or 'dyspraxia'
    
    Returns:
        Dictionary with rule_score, triggered_rules, and descriptions
    """
    engine = RuleBasedEngine(disability_category)
    rule_score, triggered_rules = engine.evaluate(features)
    descriptions = engine.get_rule_descriptions(triggered_rules)
    
    return {
        'rule_score': round(rule_score, 4),
        'triggered_rules': triggered_rules,
        'rule_descriptions': descriptions,
        'rules_triggered_count': len(triggered_rules)
    }


# Domain task-level rule engine
DOMAIN_TASK_CONFIG = {
    'dyslexia': {
        'task_order': [
            'word_reading_accuracy',
            'minimal_pair_discrimination',
            'letter_discrimination',
            'paragraph_reading_comprehension',
            'verbal_sequential_memory',
        ],
        'high_risk_avg_threshold': 0.45,
        'moderate_risk_avg_threshold': 0.65,
        'critical_task_threshold': 0.35,
        'weak_task_threshold': 0.55,
        'high_risk_min_critical_tasks': 2,
        'moderate_risk_min_weak_tasks': 2,
    },
    'dysgraphia': {
        'task_order': [
            'sentence_copying',
            'dictation',
            'free_writing_sample',
            'letter_formation_tracing',
            'shape_tracing',
        ],
        'high_risk_avg_threshold': 0.5,
        'moderate_risk_avg_threshold': 0.68,
        'critical_task_threshold': 0.4,
        'weak_task_threshold': 0.58,
        'high_risk_min_critical_tasks': 2,
        'moderate_risk_min_weak_tasks': 2,
    },
    'dyscalculia': {
        'task_order': [
            'skip_counting',
            'mental_arithmetic',
            'symbol_recognition',
            'quantity_comparison',
            'number_line_task',
        ],
        'high_risk_avg_threshold': 0.45,
        'moderate_risk_avg_threshold': 0.66,
        'critical_task_threshold': 0.35,
        'weak_task_threshold': 0.56,
        'high_risk_min_critical_tasks': 2,
        'moderate_risk_min_weak_tasks': 2,
    },
    'dyspraxia': {
        'task_order': [
            'shape_replication',
            'pattern_tracing',
            'reaction_time',
            'hand_eye_coordination',
            'directional_awareness',
        ],
        'high_risk_avg_threshold': 0.5,
        'moderate_risk_avg_threshold': 0.7,
        'critical_task_threshold': 0.4,
        'weak_task_threshold': 0.6,
        'high_risk_min_critical_tasks': 2,
        'moderate_risk_min_weak_tasks': 2,
    },
}


def _normalize_score(raw_value: Any) -> float:
    if raw_value is None:
        return 0.0

    try:
        value = float(raw_value)
    except (TypeError, ValueError):
        return 0.0

    if value > 1.0:
        # Supports 0-100 scale from UI or CSV-like payloads.
        value = value / 100.0

    return max(0.0, min(1.0, value))


def _extract_task_scores(task_results: List[Dict[str, Any]]) -> Dict[str, float]:
    extracted: Dict[str, float] = {}

    for task in task_results:
        task_type = str(task.get('task_type') or '').strip().lower().replace(' ', '_')
        task_data = task.get('task_data') or {}

        # 1) Score from top-level record.
        direct_score = _normalize_score(task.get('score'))
        if task_type and direct_score > 0:
            extracted[task_type] = direct_score

        # 2) Nested individual task scores (dict or list).
        nested_scores = task_data.get('task_scores') or task_data.get('scores') or {}
        if isinstance(nested_scores, dict):
            for nested_name, nested_value in nested_scores.items():
                nested_key = str(nested_name).strip().lower().replace(' ', '_')
                if isinstance(nested_value, dict):
                    nested_score = _normalize_score(nested_value.get('score'))
                    if nested_score == 0.0 and 'correct' in nested_value and 'total' in nested_value:
                        total = nested_value.get('total') or 0
                        if total:
                            nested_score = _normalize_score(nested_value.get('correct', 0) / total)
                else:
                    nested_score = _normalize_score(nested_value)
                extracted[nested_key] = nested_score
        elif isinstance(nested_scores, list):
            for idx, nested_value in enumerate(nested_scores):
                nested_key = f'task_{idx + 1}'
                if isinstance(nested_value, dict):
                    nested_score = _normalize_score(nested_value.get('score'))
                    if nested_score == 0.0 and 'correct' in nested_value and 'total' in nested_value:
                        total = nested_value.get('total') or 0
                        if total:
                            nested_score = _normalize_score(nested_value.get('correct', 0) / total)
                else:
                    nested_score = _normalize_score(nested_value)
                extracted[nested_key] = nested_score

        # 3) Aggregate computed metrics fallback.
        computed = task_data.get('computed') or {}
        if isinstance(computed, dict):
            for feature_name, value in computed.items():
                if not isinstance(value, (int, float)):
                    continue
                feature_key = str(feature_name).strip().lower().replace(' ', '_')
                metric_score = _normalize_score(value)
                # Invert error-like metrics so higher score means better performance.
                if any(token in feature_key for token in ('error', 'confusion', 'deviation', 'hesitation')):
                    metric_score = 1.0 - metric_score
                extracted[feature_key] = metric_score

    return extracted


def screen_task_scores(task_results: List[Dict[str, Any]], disability_category: str) -> Dict[str, Any]:
    """
    Rule-based decision from individual domain task scores.

    Returns:
        {
          risk_score, risk_level, has_learning_disability,
          task_scores, weak_tasks, critical_tasks,
          triggered_rules, rules_triggered_count
        }
    """
    category = disability_category.lower().strip()
    config = DOMAIN_TASK_CONFIG.get(category)

    if not config:
        return {
            'risk_score': 0.0,
            'risk_level': 'low',
            'has_learning_disability': False,
            'task_scores': {},
            'weak_tasks': [],
            'critical_tasks': [],
            'triggered_rules': [],
            'rules_triggered_count': 0,
            'rule_notes': ['No task-score rule configuration found for this domain.'],
        }

    extracted_scores = _extract_task_scores(task_results)

    ordered_scores: Dict[str, float] = {}
    for task_name in config['task_order']:
        ordered_scores[task_name] = extracted_scores.get(task_name, 0.0)

    available_scores = list(ordered_scores.values())
    avg_score = sum(available_scores) / len(available_scores) if available_scores else 0.0

    critical_tasks = [
        task_name for task_name, score in ordered_scores.items()
        if score < config['critical_task_threshold']
    ]
    weak_tasks = [
        task_name for task_name, score in ordered_scores.items()
        if score < config['weak_task_threshold']
    ]

    triggered_rules: List[str] = []
    rule_notes: List[str] = []

    if avg_score < config['high_risk_avg_threshold']:
        triggered_rules.append(f"{category.upper()}_TASK_R1")
        rule_notes.append('Average domain task score is in high-risk range.')

    if len(critical_tasks) >= config['high_risk_min_critical_tasks']:
        triggered_rules.append(f"{category.upper()}_TASK_R2")
        rule_notes.append('Multiple critical task deficits were detected.')

    if avg_score < config['moderate_risk_avg_threshold']:
        triggered_rules.append(f"{category.upper()}_TASK_R3")
        rule_notes.append('Average domain task score is below expected range.')

    if len(weak_tasks) >= config['moderate_risk_min_weak_tasks']:
        triggered_rules.append(f"{category.upper()}_TASK_R4")
        rule_notes.append('Multiple weak task scores indicate broad domain difficulty.')

    if (
        avg_score < config['high_risk_avg_threshold']
        or len(critical_tasks) >= config['high_risk_min_critical_tasks']
    ):
        risk_level = 'high'
    elif (
        avg_score < config['moderate_risk_avg_threshold']
        or len(weak_tasks) >= config['moderate_risk_min_weak_tasks']
    ):
        risk_level = 'moderate'
    else:
        risk_level = 'low'

    # Risk score: combine low mean performance with severe-task penalties.
    base_risk = 1.0 - avg_score
    critical_penalty = min(0.25, len(critical_tasks) * 0.08)
    weak_penalty = min(0.2, len(weak_tasks) * 0.03)
    risk_score = max(0.0, min(1.0, base_risk + critical_penalty + weak_penalty))

    return {
        'risk_score': round(risk_score, 4),
        'average_task_score': round(avg_score, 4),
        'risk_level': risk_level,
        'has_learning_disability': risk_level in {'moderate', 'high'},
        'task_scores': {k: round(v, 4) for k, v in ordered_scores.items()},
        'weak_tasks': weak_tasks,
        'critical_tasks': critical_tasks,
        'triggered_rules': triggered_rules,
        'rules_triggered_count': len(triggered_rules),
        'rule_notes': rule_notes,
    }
