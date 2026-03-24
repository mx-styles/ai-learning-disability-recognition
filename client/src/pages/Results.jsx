import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisAPI, recommendationAPI, reportAPI } from '../services/api';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const [resultsRes, recRes] = await Promise.all([
        analysisAPI.getResults(sessionId),
        recommendationAPI.getSessionRecommendations(sessionId)
      ]);
      setResults(resultsRes.data.results);
      const recommendationList = recRes.data.recommendations || [];
      const recommendationMap = Array.isArray(recommendationList)
        ? recommendationList.reduce((acc, item) => {
            if (item?.disability_category) {
              acc[item.disability_category] = item;
            }
            return acc;
          }, {})
        : recommendationList;
      setRecommendations(recommendationMap);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await reportAPI.generateSessionPDF(sessionId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assessment_report_${sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await reportAPI.exportSessionData(sessionId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assessment_data_${sessionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return '✓';
      case 'moderate': return '⚠';
      case 'high': return '⚠';
      default: return '•';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 sm:p-6">
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-gray-600 mt-1">Session ID: {sessionId}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Data
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Cards */}
      {results && Object.entries(results).map(([disability, data]) => (
        <div key={disability} className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold capitalize text-gray-900">
                {disability.replace('_', ' ')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Learning Disability Assessment</p>
            </div>
            
            <div className={`w-full sm:w-auto px-4 py-2 rounded-lg border-2 font-bold text-base sm:text-lg text-center ${getRiskColor(data.risk_score?.risk_level)}`}>
              {getRiskIcon(data.risk_score?.risk_level)} {data.risk_score?.risk_level?.toUpperCase()} RISK
            </div>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-sm text-gray-600 mb-1">Overall Risk Score</p>
              <p className="text-2xl font-bold text-indigo-900">
                {(((data.risk_score?.final_score ?? 0) * 100)).toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Screening Level</p>
              <p className="text-2xl font-bold text-purple-900 uppercase">
                {data.risk_score?.risk_level || 'N/A'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Rule Risk Score</p>
              <p className="text-2xl font-bold text-purple-900">
                {(((data.risk_score?.rule_score ?? 0) * 100)).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Confidence Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Confidence Level</span>
              <span className="text-sm font-bold text-gray-900">
                {(data.risk_score?.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${data.risk_score?.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Explanation */}
          {data.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explanation
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                {data.explanation.explanation_text}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {recommendations[disability] && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recommended Interventions
              </h3>
              
              {recommendations[disability].classroom_accommodations && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-amber-900 mb-1">Classroom Accommodations:</p>
                  <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                    {recommendations[disability].classroom_accommodations.slice(0, 3).map((acc, idx) => (
                      <li key={idx}>{acc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations[disability].practice_exercises && (
                <div>
                  <p className="text-sm font-medium text-amber-900 mb-1">Practice Exercises:</p>
                  <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                    {recommendations[disability].practice_exercises.slice(0, 3).map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> This is an educational screening tool and NOT a diagnostic assessment. 
              Results should be interpreted by qualified educational professionals. Students with moderate to high 
              risk levels should undergo comprehensive diagnostic evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/students')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Back to Students
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
