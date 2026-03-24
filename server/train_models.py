"""
Train ML models using generated training data
"""

import os
import numpy as np
import pandas as pd
from ml_models.classifiers.ml_classifier import MultiLabelClassifier
from config import Config


def load_training_data(disability_category):
    """Load training data for a specific disability"""
    filepath = os.path.join(Config.DATASETS_DIR, f'{disability_category}_training_data.csv')
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Training data not found: {filepath}")
    
    df = pd.read_csv(filepath)
    
    # Separate features and labels
    X = df.drop('label', axis=1).values
    y = df['label'].values
    
    return X, y


def main():
    """Train all disability classifiers"""
    print("="*60)
    print("ML Model Training Pipeline")
    print("="*60)
    
    # Check if training data exists
    if not os.path.exists(Config.DATASETS_DIR):
        print("\n❌ Training data not found!")
        print("Please run 'python generate_training_data.py' first.")
        return
    
    disabilities = ['dyslexia', 'dysgraphia', 'dyscalculia', 'dyspraxia']
    training_data = {}
    
    # Load all training data
    print("\nLoading training data...")
    for disability in disabilities:
        try:
            X, y = load_training_data(disability)
            training_data[disability] = (X, y)
            print(f"✓ Loaded {disability}: {X.shape[0]} samples, {X.shape[1]} features")
        except FileNotFoundError as e:
            print(f"✗ {e}")
            return
    
    # Train Random Forest models
    print("\n" + "="*60)
    print("Training Random Forest Models")
    print("="*60)
    
    rf_classifier = MultiLabelClassifier(model_type='random_forest')
    rf_metrics = rf_classifier.train_all(training_data)
    
    # Save models
    print("\nSaving models...")
    saved_paths = rf_classifier.save_all(Config.ML_MODELS_DIR)
    for disability, path in saved_paths.items():
        print(f"✓ Saved {disability} model to: {path}")
    
    # Print summary
    print("\n" + "="*60)
    print("Training Summary")
    print("="*60)
    
    for disability, metrics in rf_metrics.items():
        print(f"\n{disability.upper()}")
        print(f"  Accuracy:  {metrics['accuracy']:.3f}")
        print(f"  Precision: {metrics['precision']:.3f}")
        print(f"  Recall:    {metrics['recall']:.3f}")
        print(f"  F1 Score:  {metrics['f1_score']:.3f}")
        if 'roc_auc' in metrics:
            print(f"  ROC AUC:   {metrics['roc_auc']:.3f}")
        print(f"  CV F1:     {metrics['cv_f1_mean']:.3f} ± {metrics['cv_f1_std']:.3f}")
    
    print("\n" + "="*60)
    print("✓ Model training completed successfully!")
    print("="*60)
    print("\nModels are ready for use in the assessment system.")


if __name__ == '__main__':
    main()
