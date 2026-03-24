# AI-Based Educational Screening System for Learning Disabilities

## 🎯 Project Overview

A **privacy-preserving, fully offline AI system** that screens for four learning disabilities:
- **Dyslexia** (Reading & Language Processing)
- **Dysgraphia** (Writing & Motor-Linguistic Output)
- **Dyscalculia** (Numerical Cognition)
- **Dyspraxia** (Motor Planning & Coordination)

⚠️ **Important:** This system provides **educational screening only** and does not provide medical diagnoses.

## 🏗️ System Architecture

### Backend (Python + Flask)
- REST API with Flask
- SQLite local database
- Machine Learning: Random Forest, SVM
- Hybrid rule-based + ML classification
- Feature extraction and normalization
- Recommendation engine

### Frontend (React + Vite)
- Modern React 18+ interface
- Tailwind CSS styling
- Offline-capable charts (Chart.js)
- Student assessment interface
- Teacher dashboard
- Explainability views

## 📁 Project Structure

```
project_root/
├── server/                    # Backend (Python Flask)
│   ├── app.py                # Main Flask application
│   ├── config.py             # Configuration
│   ├── models.py             # SQLAlchemy models
│   ├── requirements.txt      # Python dependencies
│   ├── database/             # SQLite database
│   ├── routes/               # API endpoints
│   ├── ml_models/            # ML models and training
│   │   ├── classifiers/      # ML classifiers
│   │   ├── feature_extraction/
│   │   ├── rule_engine/
│   │   ├── hybrid_engine/
│   │   └── saved_models/     # Persisted models
│   ├── assessment/           # Task definitions
│   ├── recommendations/      # Recommendation engine
│   └── reports/              # Report generation
│
└── client/                   # Frontend (React)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   └── styles/           # Global styles
    └── public/
```

## 🚀 Setup Instructions

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Initialize database:
```bash
python init_db.py
```

6. Run the server:
```bash
python app.py
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📊 Assessment Modules

### 1. Dyslexia Assessment
- Word Reading Task
- Minimal Pair Discrimination
- Letter Discrimination
- Paragraph Reading & Comprehension
- Verbal Sequential Memory

### 2. Dysgraphia Assessment
- Copying Task
- Dictation Task
- Free Writing Task
- Letter Formation Tracing
- Shape Tracing

### 3. Dyscalculia Assessment
- Skip Counting
- Mental Arithmetic
- Symbol Recognition
- Quantity Comparison
- Math Fact Recall
- Number Line Task

### 4. Dyspraxia Assessment
- Shape Replication
- Pattern Tracing
- Reaction Time Task
- Hand-Eye Coordination
- Directional Awareness

## 🧠 Machine Learning Pipeline

1. **Feature Extraction**: Age and grade-normalized features
2. **Rule-Based Screening**: Threshold-based initial classification
3. **ML Classification**: Random Forest + SVM models
4. **Hybrid Decision**: Weighted combination (60% ML + 40% Rules)
5. **Explainability**: Feature importance and plain-language explanations

## 📈 System Outputs

- **Risk Levels**: Low / Moderate / High per disability
- **Learner Profiles**: Visual representations with trends
- **Explanations**: Feature-based, accessible explanations
- **Recommendations**: Disability-specific intervention strategies
- **Reports**: Exportable PDF reports

## 🔒 Privacy & Ethics

- ✅ Fully offline after installation
- ✅ Local data storage only (SQLite)
- ✅ No cloud services or APIs
- ✅ Educational screening disclaimer
- ✅ Non-stigmatizing language
- ✅ Teacher override capability

## 📝 License

Academic project for educational purposes.

## 👥 Contact

For questions or support, contact the development team.
