import React from 'react';
import { useNavigate } from 'react-router-dom';

const SystemFeatureIcon = ({ children }) => (
  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
    {children}
  </div>
);

const LockIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
  </svg>
);

const RobotIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="6" y="8" width="12" height="10" rx="2" />
    <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18v2M15 18v2M6 12H4M20 12h-2" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="6" y="5" width="12" height="16" rx="2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Dyslexia Screening',
      description: 'Reading and language processing assessment',
      icon: '📖',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Dysgraphia Screening',
      description: 'Writing and motor-linguistic output assessment',
      icon: '✍️',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Dyscalculia Screening',
      description: 'Numerical cognition and math assessment',
      icon: '🔢',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Dyspraxia Screening',
      description: 'Motor planning and coordination assessment',
      icon: '🤸',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            INTELLIGENT LEARNING DISABILITY RECOGNITION SYSTEM
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Privacy-preserving, fully offline system for detecting learning disability risk
            in students through task-based assessments and machine learning analysis.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/assess')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Start Assessment
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Teacher Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className={`text-4xl p-3 rounded-lg ${feature.color}`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Features */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <SystemFeatureIcon>
              <LockIcon />
            </SystemFeatureIcon>
            <h4 className="font-medium text-gray-900 mb-2">Fully Offline</h4>
            <p className="text-sm text-gray-600">
              Complete privacy protection with local data storage
            </p>
          </div>
          <div className="text-center">
            <SystemFeatureIcon>
              <RobotIcon />
            </SystemFeatureIcon>
            <h4 className="font-medium text-gray-900 mb-2">AI-Powered</h4>
            <p className="text-sm text-gray-600">
              Machine Learning based classification for accuracy
            </p>
          </div>
          <div className="text-center">
            <SystemFeatureIcon>
              <ClipboardIcon />
            </SystemFeatureIcon>
            <h4 className="font-medium text-gray-900 mb-2">Explainable</h4>
            <p className="text-sm text-gray-600">
              Clear explanations and actionable recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
