import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_students: 0,
    assessed_students: 0,
    completed_assessments: 0,
    high_risk_cases: 0,
    high_risk_students: 0,
  });
  const [riskByDomain, setRiskByDomain] = useState({});
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [interventionQueue, setInterventionQueue] = useState([]);

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await analysisAPI.getDashboardOverview();
      const payload = response.data || {};

      setStats(payload.stats || {});
      setRiskByDomain(payload.risk_by_domain || {});
      setRecentAssessments(payload.recent_assessments || []);
      setInterventionQueue(payload.intervention_queue || []);
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      setError(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const domainCards = useMemo(
    () =>
      Object.entries(riskByDomain).map(([domain, counts]) => {
        const total = counts?.total || 0;
        const high = counts?.high || 0;
        const moderate = counts?.moderate || 0;
        const low = counts?.low || 0;
        const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
        return {
          domain,
          total,
          high,
          moderate,
          low,
          highPct,
        };
      }),
    [riskByDomain]
  );

  const getRiskBadgeClass = (level) => {
    if (level === 'high') return 'bg-red-100 text-red-700';
    if (level === 'moderate') return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
          <p className="text-sm text-gray-600">Live overview of screening activity, risk levels, and intervention priorities.</p>
        </div>
        <button
          onClick={fetchDashboardOverview}
          className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-3xl font-bold text-primary-600">{stats.total_students || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{stats.assessed_students || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Assessed Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-3xl font-bold text-indigo-600">{stats.completed_assessments || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Completed Assessments</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-3xl font-bold text-orange-600">{stats.high_risk_cases || 0}</div>
          <div className="text-sm text-gray-500 mt-1">High Risk Cases</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-3xl font-bold text-red-600">{stats.high_risk_students || 0}</div>
          <div className="text-sm text-gray-500 mt-1">High Risk Students</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        {/* Recent Assessments */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Assessments</h3>

          {recentAssessments.length === 0 ? (
            <p className="text-sm text-gray-500">No completed assessments yet.</p>
          ) : (
            <>
            <div className="md:hidden space-y-3">
              {recentAssessments.map((item) => (
                <div key={item.id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-900">{item.student?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{item.student?.student_id || 'N/A'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(item.overall_risk)}`}>
                      {item.overall_risk || 'low'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {item.assessment_type || 'full'} • {item.start_time ? new Date(item.start_time).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => item.student?.id && navigate(`/students/${item.student.id}`)}
                      className="rounded border border-primary-200 px-2 py-1.5 text-xs text-primary-700 hover:bg-primary-50"
                    >
                      Student
                    </button>
                    <button
                      onClick={() => navigate(`/results/${item.id}`)}
                      className="rounded border border-indigo-200 px-2 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50"
                    >
                      Results
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Assessment</th>
                    <th className="py-2 pr-3">Overall Risk</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAssessments.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-3">
                        <div className="font-medium text-gray-900">{item.student?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{item.student?.student_id || 'N/A'}</div>
                      </td>
                      <td className="py-2 pr-3 capitalize">{item.assessment_type || 'full'}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(item.overall_risk)}`}>
                          {item.overall_risk || 'low'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {item.start_time ? new Date(item.start_time).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 text-right space-x-2">
                        <button
                          onClick={() => item.student?.id && navigate(`/students/${item.student.id}`)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          Student
                        </button>
                        <button
                          onClick={() => navigate(`/results/${item.id}`)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* Intervention Queue */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Intervention Priority Queue</h3>
          {interventionQueue.length === 0 ? (
            <p className="text-sm text-gray-500">No moderate/high intervention records yet.</p>
          ) : (
            <div className="space-y-3">
              {interventionQueue.map((item, idx) => (
                <div key={`${item.session_id}-${item.disability_category}-${idx}`} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium text-gray-900">{item.student_name}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(item.risk_level)}`}>
                      {item.risk_level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 capitalize mb-1">{item.disability_category}</div>
                  <ul className="list-disc pl-4 text-xs text-gray-700 space-y-0.5">
                    {(item.priority_actions || []).map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Domain Risk Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution by Domain</h3>
        {domainCards.length === 0 ? (
          <p className="text-sm text-gray-500">No domain risk records yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {domainCards.map((card) => (
              <div key={card.domain} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 capitalize">{card.domain}</h4>
                  <span className="text-xs text-gray-500">{card.total} records</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${card.highPct}%` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-green-100 text-green-700 py-1">L: {card.low}</div>
                  <div className="rounded bg-amber-100 text-amber-700 py-1">M: {card.moderate}</div>
                  <div className="rounded bg-red-100 text-red-700 py-1">H: {card.high}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
