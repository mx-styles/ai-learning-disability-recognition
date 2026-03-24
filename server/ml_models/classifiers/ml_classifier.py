"""
Machine Learning Classifiers
Random Forest and SVM models for learning disability classification
"""

import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')


class DisabilityClassifier:
    """Base classifier for learning disability detection"""
    
    def __init__(self, disability_category: str, model_type: str = 'random_forest'):
        self.disability_category = disability_category
        self.model_type = model_type
        self.model = None
        self.feature_names = self._get_feature_names()
        self.is_trained = False
    
    def _get_feature_names(self) -> List[str]:
        """Get feature names for the disability category"""
        feature_map = {
            'dyslexia': [
                'phoneme_error_rate', 'reading_accuracy', 'reading_speed',
                'letter_confusion_score', 'comprehension_accuracy', 'verbal_memory'
            ],
            'dysgraphia': [
                'writing_speed', 'spelling_error_rate', 'spelling_inconsistency',
                'spacing_variance', 'stroke_deviation', 'motor_hesitation'
            ],
            'dyscalculia': [
                'counting_accuracy', 'arithmetic_accuracy', 'symbol_confusion',
                'quantity_comparison', 'fact_recall_consistency', 'number_line_deviation'
            ],
            'dyspraxia': [
                'tracing_deviation', 'reaction_time', 'movement_smoothness',
                'coordination_errors', 'directional_confusion'
            ]
        }
        return feature_map.get(self.disability_category, [])
    
    def _create_model(self):
        """Create the ML model based on model_type"""
        if self.model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            )
        elif self.model_type == 'svm':
            self.model = SVC(
                kernel='rbf',
                C=1.0,
                gamma='scale',
                probability=True,
                random_state=42,
                class_weight='balanced'
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """
        Train the classifier
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: Labels (0 = no risk, 1 = at risk)
        
        Returns:
            Dictionary of training metrics
        """
        if self.model is None:
            self._create_model()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        y_proba = self.model.predict_proba(X_test)[:, 1] if hasattr(self.model, 'predict_proba') else None
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0)
        }
        
        if y_proba is not None:
            try:
                metrics['roc_auc'] = roc_auc_score(y_test, y_proba)
            except:
                metrics['roc_auc'] = 0.0
        
        # Cross-validation score
        cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='f1')
        metrics['cv_f1_mean'] = cv_scores.mean()
        metrics['cv_f1_std'] = cv_scores.std()
        
        return metrics
    
    def predict(self, features: Dict[str, float]) -> Tuple[int, float]:
        """
        Predict risk level for a single sample
        
        Args:
            features: Dictionary of feature name -> value
        
        Returns:
            Tuple of (prediction, probability)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Convert features dict to array
        X = np.array([[features.get(fname, 0.0) for fname in self.feature_names]])
        
        # Predict
        prediction = self.model.predict(X)[0]
        
        # Get probability if available
        if hasattr(self.model, 'predict_proba'):
            probability = self.model.predict_proba(X)[0][1]
        else:
            probability = float(prediction)
        
        return int(prediction), float(probability)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        if not self.is_trained:
            return {}
        
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            return {
                fname: float(imp) 
                for fname, imp in zip(self.feature_names, importances)
            }
        else:
            return {}
    
    def save_model(self, save_dir: str):
        """Save model to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        os.makedirs(save_dir, exist_ok=True)
        model_path = os.path.join(
            save_dir, 
            f"{self.disability_category}_{self.model_type}_model.pkl"
        )
        
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names,
            'disability_category': self.disability_category,
            'model_type': self.model_type
        }, model_path)
        
        return model_path
    
    def load_model(self, model_path: str):
        """Load model from disk"""
        data = joblib.load(model_path)
        
        self.model = data['model']
        self.feature_names = data['feature_names']
        self.disability_category = data['disability_category']
        self.model_type = data['model_type']
        self.is_trained = True


class MultiLabelClassifier:
    """Multi-label classifier for all four disabilities"""
    
    def __init__(self, model_type: str = 'random_forest'):
        self.classifiers = {
            'dyslexia': DisabilityClassifier('dyslexia', model_type),
            'dysgraphia': DisabilityClassifier('dysgraphia', model_type),
            'dyscalculia': DisabilityClassifier('dyscalculia', model_type),
            'dyspraxia': DisabilityClassifier('dyspraxia', model_type)
        }
    
    def train_all(self, training_data: Dict[str, Tuple[np.ndarray, np.ndarray]]) -> Dict:
        """
        Train all classifiers
        
        Args:
            training_data: Dict of disability -> (X, y) tuples
        
        Returns:
            Dictionary of training metrics for each disability
        """
        results = {}
        
        for disability, classifier in self.classifiers.items():
            if disability in training_data:
                X, y = training_data[disability]
                print(f"Training {disability} classifier...")
                metrics = classifier.train(X, y)
                results[disability] = metrics
                print(f"  Accuracy: {metrics['accuracy']:.3f}, F1: {metrics['f1_score']:.3f}")
        
        return results
    
    def predict_all(self, features: Dict[str, Dict[str, float]]) -> Dict[str, Dict]:
        """
        Predict for all disabilities
        
        Args:
            features: Dict of disability -> features dict
        
        Returns:
            Dictionary of predictions for each disability
        """
        predictions = {}
        
        for disability, classifier in self.classifiers.items():
            if classifier.is_trained and disability in features:
                pred, prob = classifier.predict(features[disability])
                predictions[disability] = {
                    'prediction': pred,
                    'probability': prob,
                    'feature_importance': classifier.get_feature_importance()
                }
        
        return predictions
    
    def save_all(self, save_dir: str):
        """Save all models"""
        saved_paths = {}
        for disability, classifier in self.classifiers.items():
            if classifier.is_trained:
                path = classifier.save_model(save_dir)
                saved_paths[disability] = path
        return saved_paths
    
    def load_all(self, model_dir: str):
        """Load all models"""
        for disability, classifier in self.classifiers.items():
            model_path = os.path.join(
                model_dir,
                f"{disability}_{classifier.model_type}_model.pkl"
            )
            if os.path.exists(model_path):
                classifier.load_model(model_path)
                print(f"Loaded {disability} model from {model_path}")
