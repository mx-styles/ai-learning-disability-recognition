"""
Hybrid Decision Engine
Combines rule-based and ML-based predictions
Formula: final_score = (ML_WEIGHT × ML_probability) + (RULE_WEIGHT × rule_score)
"""

from typing import Dict, Tuple
from config import Config


def determine_risk_level(score: float) -> str:
    """
    Determine risk level from final score
    
    Args:
        score: Final hybrid score (0-1)
    
    Returns:
        Risk level: 'low', 'moderate', or 'high'
    """
    if score < Config.RISK_THRESHOLDS['low']:
        return 'low'
    elif score < Config.RISK_THRESHOLDS['moderate']:
        return 'moderate'
    else:
        return 'high'


def calculate_confidence(ml_probability: float, rule_score: float, 
                        triggered_rules_count: int) -> float:
    """
    Calculate confidence in the prediction
    
    Confidence is high when:
    - ML probability and rule score agree
    - Multiple rules are triggered (for high-risk cases)
    - Scores are extreme (very high or very low)
    
    Args:
        ml_probability: ML model probability (0-1)
        rule_score: Rule-based score (0-1)
        triggered_rules_count: Number of triggered rules
    
    Returns:
        Confidence score (0-1)
    """
    # Agreement between ML and rules
    agreement = 1 - abs(ml_probability - rule_score)
    
    # Extremity (confidence is higher at extremes)
    avg_score = (ml_probability + rule_score) / 2
    extremity = abs(avg_score - 0.5) * 2  # 0 at 0.5, 1 at 0 or 1
    
    # Rule support (more triggered rules = higher confidence for at-risk)
    rule_support = min(1.0, triggered_rules_count / 3) if triggered_rules_count > 0 else 0
    
    # Weighted combination
    confidence = (0.5 * agreement) + (0.3 * extremity) + (0.2 * rule_support)
    
    return round(min(1.0, max(0.0, confidence)), 4)


class HybridDecisionEngine:
    """Hybrid decision engine combining rule-based and ML predictions"""
    
    def __init__(self, ml_weight: float = None, rule_weight: float = None):
        """
        Initialize hybrid engine
        
        Args:
            ml_weight: Weight for ML prediction (default from config)
            rule_weight: Weight for rule-based score (default from config)
        """
        self.ml_weight = ml_weight if ml_weight is not None else Config.ML_WEIGHT
        self.rule_weight = rule_weight if rule_weight is not None else Config.RULE_WEIGHT
        
        # Ensure weights sum to 1
        total_weight = self.ml_weight + self.rule_weight
        if total_weight != 1.0:
            self.ml_weight /= total_weight
            self.rule_weight /= total_weight
    
    def make_decision(self, ml_probability: float, rule_score: float, 
                     triggered_rules_count: int = 0) -> Dict:
        """
        Make hybrid decision combining ML and rule-based predictions
        
        Args:
            ml_probability: Probability from ML model (0-1)
            rule_score: Score from rule-based engine (0-1)
            triggered_rules_count: Number of triggered rules
        
        Returns:
            Dictionary with final decision and metadata
        """
        # Calculate final score
        final_score = (self.ml_weight * ml_probability) + (self.rule_weight * rule_score)
        final_score = round(final_score, 4)
        
        # Determine risk level
        risk_level = determine_risk_level(final_score)
        
        # Calculate confidence
        confidence = calculate_confidence(ml_probability, rule_score, triggered_rules_count)
        
        # Decision metadata
        decision = {
            'final_score': final_score,
            'risk_level': risk_level,
            'confidence': confidence,
            'ml_probability': round(ml_probability, 4),
            'rule_score': round(rule_score, 4),
            'ml_weight': self.ml_weight,
            'rule_weight': self.rule_weight,
            'triggered_rules_count': triggered_rules_count
        }
        
        return decision
    
    def make_multi_decision(self, ml_results: Dict, rule_results: Dict) -> Dict:
        """
        Make decisions for multiple disabilities
        
        Args:
            ml_results: Dict of disability -> {probability, ...}
            rule_results: Dict of disability -> {rule_score, triggered_rules, ...}
        
        Returns:
            Dictionary of disability -> decision
        """
        decisions = {}
        
        for disability in ml_results.keys():
            if disability in rule_results:
                ml_prob = ml_results[disability].get('probability', 0.0)
                rule_score = rule_results[disability].get('rule_score', 0.0)
                triggered_count = rule_results[disability].get('rules_triggered_count', 0)
                
                decision = self.make_decision(ml_prob, rule_score, triggered_count)
                
                # Add additional context
                decision['ml_feature_importance'] = ml_results[disability].get('feature_importance', {})
                decision['triggered_rules'] = rule_results[disability].get('triggered_rules', [])
                decision['rule_descriptions'] = rule_results[disability].get('rule_descriptions', [])
                
                decisions[disability] = decision
        
        return decisions


def explain_decision(decision: Dict, disability_category: str, 
                    features: Dict[str, float]) -> str:
    """
    Generate plain-language explanation of the decision
    
    Args:
        decision: Decision dictionary from hybrid engine
        disability_category: Name of the disability
        features: Feature dictionary
    
    Returns:
        Plain-language explanation string
    """
    risk_level = decision['risk_level']
    confidence = decision['confidence']
    final_score = decision['final_score']
    
    # Start explanation
    explanation_parts = []
    
    # Risk level statement
    risk_statements = {
        'low': f"Based on the assessment, this student shows LOW risk for {disability_category}.",
        'moderate': f"Based on the assessment, this student shows MODERATE risk for {disability_category}.",
        'high': f"Based on the assessment, this student shows HIGH risk for {disability_category}."
    }
    explanation_parts.append(risk_statements[risk_level])
    
    # Confidence statement
    if confidence > 0.8:
        conf_text = "This assessment has high confidence."
    elif confidence > 0.6:
        conf_text = "This assessment has moderate confidence."
    else:
        conf_text = "This assessment has lower confidence and should be interpreted with caution."
    explanation_parts.append(conf_text)
    
    # Contributing factors (top 3 features)
    feature_importance = decision.get('ml_feature_importance', {})
    if feature_importance:
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
        
        explanation_parts.append("\nKey contributing factors:")
        for feat_name, importance in sorted_features:
            feat_value = features.get(feat_name, 0.0)
            
            # Convert feature names to readable text
            readable_name = feat_name.replace('_', ' ').title()
            
            # Determine if feature indicates risk
            risk_features = ['error', 'confusion', 'deviation', 'hesitation']
            is_risk_feature = any(risk in feat_name for risk in risk_features)
            
            if is_risk_feature:
                if feat_value > 0.6:
                    status = "significantly elevated"
                elif feat_value > 0.4:
                    status = "moderately elevated"
                else:
                    status = "within normal range"
            else:  # Performance features (higher is better)
                if feat_value < 0.4:
                    status = "significantly below expected level"
                elif feat_value < 0.6:
                    status = "moderately below expected level"
                else:
                    status = "within expected range"
            
            explanation_parts.append(f"• {readable_name}: {status}")
    
    # Triggered rules
    rule_descriptions = decision.get('rule_descriptions', [])
    if rule_descriptions and risk_level in ['moderate', 'high']:
        explanation_parts.append("\nScreening indicators:")
        for rule_desc in rule_descriptions[:3]:  # Top 3 rules
            explanation_parts.append(f"• {rule_desc['description']}")
    
    # Recommendation note
    if risk_level in ['moderate', 'high']:
        explanation_parts.append(
            f"\nRecommendation: Consider implementing targeted interventions and continue monitoring progress. "
            f"This is an educational screening only and not a diagnostic assessment."
        )
    
    return "\n".join(explanation_parts)
