import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import AssessmentFlow from './pages/AssessmentFlow';
import TeacherDashboard from './pages/TeacherDashboard';
import Results from './pages/Results';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/assess" element={<AssessmentFlow />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/:studentId" element={<StudentProfile />} />
            <Route path="/dashboard" element={<TeacherDashboard />} />
            <Route path="/users" element={<ProtectedRoute roles={[ 'admin' ]}><UserManagement /></ProtectedRoute>} />
            <Route path="/results/:sessionId" element={<Results />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
