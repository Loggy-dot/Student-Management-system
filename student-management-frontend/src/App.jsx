import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import DepartmentManagement from './components/DepartmentManagement';
import CourseManagement from './components/CourseManagement';
import Reports from './components/Reports';
import StudentPortal from './components/StudentPortal';
import TeacherManagement from './components/TeacherManagement';
import EmailIntegration from './components/EmailIntegration';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function AppContent() {
  const { isAuthenticated, user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Student Portal Route - Standalone */}
          <Route path="/student-portal" element={<StudentPortal />} />
          
          {/* Admin Routes with Sidebar */}
          <Route path="/*" element={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex">
              {/* Sidebar */}
              <Sidebar user={user} onLogout={logout} />
              
              {/* Main Content */}
              <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="p-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/students" element={<StudentManagement />} />
                      <Route path="/teachers" element={<TeacherManagement />} />
                      <Route path="/departments" element={<DepartmentManagement />} />
                      <Route path="/courses" element={<CourseManagement />} />
                      <Route path="/email" element={<EmailIntegration />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </main>
            </div>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;