import React, { useState, useEffect } from 'react';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';

const StudentPortal = () => {
  const [student, setStudent] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for saved login state on component mount
  useEffect(() => {
    const savedStudent = localStorage.getItem('studentData');
    if (savedStudent) {
      try {
        const studentData = JSON.parse(savedStudent);
        setStudent(studentData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing saved student data:', error);
        localStorage.removeItem('studentData');
      }
    }
  }, []);

  const handleLogin = (studentData) => {
    setStudent(studentData);
    setIsLoggedIn(true);
    // Save login state to localStorage
    localStorage.setItem('studentData', JSON.stringify(studentData));
  };

  const handleLogout = () => {
    setStudent(null);
    setIsLoggedIn(false);
    // Clear saved login state
    localStorage.removeItem('studentData');
  };

  if (isLoggedIn && student) {
    return <StudentDashboard student={student} onLogout={handleLogout} />;
  }

  return <StudentLogin onLogin={handleLogin} />;
};

export default StudentPortal;