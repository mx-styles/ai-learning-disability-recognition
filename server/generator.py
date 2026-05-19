"""
Generate synthetic training data for ML models
This creates sample data for training the disability classifiers
"""

import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)


def generate_dyslexia_data(n_samples=500):
    """Generate synthetic dyslexia training data"""
    data = []
    
    for i in range(n_samples):
        # Determine if at-risk (40% of samples)
        at_risk = random.random() < 0.4
        
        if at_risk:
            # At-risk patterns: low reading performance, high errors
            phoneme_error_rate = np.random.uniform(0.5, 0.9)
            reading_accuracy = np.random.uniform(0.1, 0.5)
            reading_speed = np.random.uniform(0.1, 0.4)
            letter_confusion = np.random.uniform(0.4, 0.9)
            comprehension = np.random.uniform(0.2, 0.5)
            verbal_memory = np.random.uniform(0.2, 0.6)
        else:
            # Not at-risk patterns: typical performance
            phoneme_error_rate = np.random.uniform(0.0, 0.3)
            reading_accuracy = np.random.uniform(0.7, 1.0)
            reading_speed = np.random.uniform(0.6, 1.0)
            letter_confusion = np.random.uniform(0.0, 0.3)
            comprehension = np.random.uniform(0.7, 1.0)
            verbal_memory = np.random.uniform(0.6, 1.0)
        
        data.append({
            'phoneme_error_rate': phoneme_error_rate,
            'reading_accuracy': reading_accuracy,
            'reading_speed': reading_speed,
            'letter_confusion_score': letter_confusion,
            'comprehension_accuracy': comprehension,
            'verbal_memory': verbal_memory,
            'label': 1 if at_risk else 0
        })
    
    return pd.DataFrame(data)


def generate_dysgraphia_data(n_samples=500):
    """Generate synthetic dysgraphia training data"""
    data = []
    
    for i in range(n_samples):
        at_risk = random.random() < 0.4
        
        if at_risk:
            writing_speed = np.random.uniform(0.1, 0.4)
            spelling_error = np.random.uniform(0.5, 0.9)
            spelling_inconsistency = np.random.uniform(0.5, 0.9)
            spacing_variance = np.random.uniform(0.5, 0.9)
            stroke_deviation = np.random.uniform(0.5, 0.9)
            motor_hesitation = np.random.uniform(0.5, 0.9)
        else:
            writing_speed = np.random.uniform(0.6, 1.0)
            spelling_error = np.random.uniform(0.0, 0.3)
            spelling_inconsistency = np.random.uniform(0.0, 0.3)
            spacing_variance = np.random.uniform(0.0, 0.3)
            stroke_deviation = np.random.uniform(0.0, 0.4)
            motor_hesitation = np.random.uniform(0.0, 0.3)
        
        data.append({
            'writing_speed': writing_speed,
            'spelling_error_rate': spelling_error,
            'spelling_inconsistency': spelling_inconsistency,
            'spacing_variance': spacing_variance,
            'stroke_deviation': stroke_deviation,
            'motor_hesitation': motor_hesitation,
            'label': 1 if at_risk else 0
        })
    
    return pd.DataFrame(data)


def generate_dyscalculia_data(n_samples=500):
    """Generate synthetic dyscalculia training data"""
    data = []
    
    for i in range(n_samples):
        at_risk = random.random() < 0.4
        
        if at_risk:
            counting_accuracy = np.random.uniform(0.2, 0.5)
            arithmetic_accuracy = np.random.uniform(0.1, 0.4)
            symbol_confusion = np.random.uniform(0.5, 0.9)
            quantity_comparison = np.random.uniform(0.2, 0.5)
            fact_recall = np.random.uniform(0.1, 0.4)
            number_line_deviation = np.random.uniform(0.5, 0.9)
        else:
            counting_accuracy = np.random.uniform(0.7, 1.0)
            arithmetic_accuracy = np.random.uniform(0.7, 1.0)
            symbol_confusion = np.random.uniform(0.0, 0.3)
            quantity_comparison = np.random.uniform(0.7, 1.0)
            fact_recall = np.random.uniform(0.7, 1.0)
            number_line_deviation = np.random.uniform(0.0, 0.3)
        
        data.append({
            'counting_accuracy': counting_accuracy,
            'arithmetic_accuracy': arithmetic_accuracy,
            'symbol_confusion': symbol_confusion,
            'quantity_comparison': quantity_comparison,
            'fact_recall_consistency': fact_recall,
            'number_line_deviation': number_line_deviation,
            'label': 1 if at_risk else 0
        })
    
    return pd.DataFrame(data)


def generate_dyspraxia_data(n_samples=500):
    """Generate synthetic dyspraxia training data"""
    data = []
    
    for i in range(n_samples):
        at_risk = random.random() < 0.4
        
        if at_risk:
            tracing_deviation = np.random.uniform(0.5, 0.9)
            reaction_time = np.random.uniform(0.6, 0.9)
            movement_smoothness = np.random.uniform(0.1, 0.4)
            coordination_errors = np.random.uniform(0.5, 0.9)
            directional_confusion = np.random.uniform(0.5, 0.9)
        else:
            tracing_deviation = np.random.uniform(0.0, 0.3)
            reaction_time = np.random.uniform(0.2, 0.5)
            movement_smoothness = np.random.uniform(0.7, 1.0)
            coordination_errors = np.random.uniform(0.0, 0.3)
            directional_confusion = np.random.uniform(0.0, 0.3)
        
        data.append({
            'tracing_deviation': tracing_deviation,
            'reaction_time': reaction_time,
            'movement_smoothness': movement_smoothness,
            'coordination_errors': coordination_errors,
            'directional_confusion': directional_confusion,
            'label': 1 if at_risk else 0
        })
    
    return pd.DataFrame(data)


def main():
    """Generate all training datasets"""
    output_dir = 'ml_models/datasets'
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating synthetic training data...")
    
    # Generate datasets
    datasets = {
        'dyslexia': generate_dyslexia_data(500),
        'dysgraphia': generate_dysgraphia_data(500),
        'dyscalculia': generate_dyscalculia_data(500),
        'dyspraxia': generate_dyspraxia_data(500)
    }
    
    # Save datasets
    for disability, df in datasets.items():
        filepath = os.path.join(output_dir, f'{disability}_training_data.csv')
        df.to_csv(filepath, index=False)
        
        # Print statistics
        at_risk_count = df['label'].sum()
        total_count = len(df)
        print(f"\n{disability.capitalize()}:")
        print(f"  Total samples: {total_count}")
        print(f"  At-risk: {at_risk_count} ({at_risk_count/total_count*100:.1f}%)")
        print(f"  Not at-risk: {total_count - at_risk_count} ({(total_count-at_risk_count)/total_count*100:.1f}%)")
        print(f"  Saved to: {filepath}")
    
    print("\n✓ All training datasets generated successfully!")
    print("\nNext steps:")
    print("1. Review the generated data in ml_models/datasets/")
    print("2. Run the training script to train ML models")
    print("3. Models will be saved to ml_models/saved_models/")


if __name__ == '__main__':
    main()
