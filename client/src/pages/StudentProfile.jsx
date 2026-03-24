import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportAPI, studentAPI } from '../services/api';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingSessionId, setDownloadingSessionId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade: '',
    gender: ''
  });

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const [studentRes, historyRes] = await Promise.all([
        studentAPI.getById(studentId),
        studentAPI.getHistory(studentId)
      ]);
      const studentRecord = studentRes.data.student;
      setStudent(studentRecord);
      setHistory(historyRes.data.history || []);
      setEditForm({
        first_name: studentRecord?.first_name || '',
        last_name: studentRecord?.last_name || '',
        date_of_birth: studentRecord?.date_of_birth || '',
        grade: String(studentRecord?.grade || ''),
        gender: studentRecord?.gender || ''
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSessionReport = async (session) => {
    setDownloadingSessionId(session.id);
    try {
      const response = await reportAPI.generateSessionPDF(session.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assessment_report_${session.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading session report:', error);
      alert('Failed to generate session report. Please try again.');
    } finally {
      setDownloadingSessionId(null);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.update(studentId, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        date_of_birth: editForm.date_of_birth,
        grade: Number(editForm.grade),
        gender: editForm.gender || null,
      });
      setShowEditModal(false);
      fetchStudentData();
    } catch (error) {
      alert('Failed to update student: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadProgressReport = async () => {
    setDownloading(true);
    try {
      const response = await reportAPI.generateProgressPDF(studentId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress_report_${student.student_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading progress report:', error);
      alert('Failed to generate progress report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Student not found</p>
        <button
          onClick={() => navigate('/students')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 sm:p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-gray-600 mt-1">Student ID: {student.student_id}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Edit Student
          </button>
          <button
            onClick={handleDownloadProgressReport}
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
                Progress Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {student.first_name} {student.last_name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Student ID:</span> {student.student_id}
          </div>
          <div>
            <span className="text-gray-500">Grade:</span> {student.grade}
          </div>
          <div>
            <span className="text-gray-500">Date of Birth:</span> {student.date_of_birth}
          </div>
          <div>
            <span className="text-gray-500">Gender:</span> {student.gender || 'Not specified'}
          </div>
        </div>
      </div>

      {/* Progress history will be displayed here */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Assessment History</h3>
        {history.length === 0 ? (
          <p className="text-gray-500">No assessments recorded yet for this student.</p>
        ) : (
          <>
          <div className="md:hidden space-y-3">
            {history.map((session) => {
              const riskScores = session.risk_scores || [];
              const summary = riskScores.length > 0
                ? riskScores.map((r) => `${r.disability_category}: ${r.risk_level}`).join(' | ')
                : 'Not analyzed';

              return (
                <div key={session.id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">Session #{session.id}</p>
                    <span className="text-xs text-gray-500 capitalize">{session.assessment_type || 'full'}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A'}</p>
                  <p className="text-xs text-gray-700 mt-2">{summary}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/results/${session.id}`)}
                      className="rounded border border-primary-200 px-2 py-1.5 text-xs text-primary-700 hover:bg-primary-50"
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => handleDownloadSessionReport(session)}
                      className="rounded border border-indigo-200 px-2 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50"
                      disabled={downloadingSessionId === session.id}
                    >
                      {downloadingSessionId === session.id ? 'Downloading...' : 'Report'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Session</th>
                  <th className="px-4 py-2 text-left">Assessment Type</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Risk Summary</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((session) => {
                  const riskScores = session.risk_scores || [];
                  const summary = riskScores.length > 0
                    ? riskScores.map((r) => `${r.disability_category}: ${r.risk_level}`).join(' | ')
                    : 'Not analyzed';

                  return (
                    <tr key={session.id}>
                      <td className="px-4 py-2">#{session.id}</td>
                      <td className="px-4 py-2 capitalize">{session.assessment_type || 'full'}</td>
                      <td className="px-4 py-2">{session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-2 text-xs text-gray-700">{summary}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/results/${session.id}`)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => handleDownloadSessionReport(session)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={downloadingSessionId === session.id}
                        >
                          {downloadingSessionId === session.id ? 'Downloading...' : 'Download Report'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Student</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  required
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <select
                    required
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
