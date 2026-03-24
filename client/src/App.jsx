import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import AssessmentFlow from './pages/AssessmentFlow';
import TeacherDashboard from './pages/TeacherDashboard';
import Results from './pages/Results';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assess" element={<AssessmentFlow />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:studentId" element={<StudentProfile />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
