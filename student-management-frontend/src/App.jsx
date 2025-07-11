import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import AdvancedDashboard from './components/AdvancedDashboard';
import StudentManagement from './components/StudentManagement';
import DepartmentManagement from './components/DepartmentManagement';
import CourseManagement from './components/CourseManagement';
import Reports from './components/Reports';
import StudentPortal from './components/StudentPortal';
import TeacherManagement from './components/TeacherManagement';
import EmailIntegration from './components/EmailIntegration';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastManager } from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function AppContent() {
  const { isAuthenticated, user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Initializing Student Management System..." />
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors duration-200">
              {/* Sidebar */}
              <Sidebar user={user} onLogout={logout} />

              {/* Main Content */}
              <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <Routes>
                      <Route path="/" element={<AdvancedDashboard />} />
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <ToastManager />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;