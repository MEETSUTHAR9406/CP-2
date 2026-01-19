import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatsProvider } from './context/StatsContext';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import Summarizer from './pages/student/Summarizer';
import Flashcards from './pages/student/Flashcards';
import MCQPractice from './pages/student/MCQPractice';
import ExamAttempt from './pages/student/ExamAttempt';

import SlidesGenerator from './pages/teacher/SlidesGenerator';
import ExamGenerator from './pages/teacher/ExamGenerator';
import Profile from './pages/Profile';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="center-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }
  
  return children ? children : <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Shared Authenticated Routes */}
            <Route element={<PrivateRoute allowedRoles={['student', 'teacher']}><Layout /></PrivateRoute>}>
               <Route path="/profile" element={<Profile />} />
               <Route path="/student/summarizer" element={<Summarizer />} />
               <Route path="/student/flashcards" element={<Flashcards />} />
               <Route path="/student/mcq" element={<MCQPractice />} />
               <Route path="/student/exam" element={<ExamAttempt />} />
            </Route>

            {/* Student Routes */}
            <Route element={<PrivateRoute allowedRoles={['student']}><Layout /></PrivateRoute>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Route>

            {/* Teacher Routes */}
            <Route element={<PrivateRoute allowedRoles={['teacher']}><Layout /></PrivateRoute>}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/slides" element={<SlidesGenerator />} />
              <Route path="/teacher/exam-generator" element={<ExamGenerator />} />
            </Route>
          </Routes>
        </Router>
      </StatsProvider>
    </AuthProvider>
  );
}

export default App;
