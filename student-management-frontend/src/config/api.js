// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  STUDENT_LOGIN: '/api/auth/student-login',
  
  // Students
  STUDENTS: '/api/students-report',
  STUDENTS_ENHANCED: '/api/students/enhanced',
  STUDENT_GRADES: (id) => `/api/students/${id}/grades`,
  
  // Teachers
  TEACHERS: '/api/teachers',
  TEACHER_BY_ID: (id) => `/api/teachers/${id}`,
  
  // Departments
  DEPARTMENTS: '/api/departments',
  DEPARTMENT_BY_ID: (id) => `/api/departments/${id}`,
  
  // Courses
  COURSES: '/api/courses',
  COURSE_BY_ID: (id) => `/api/courses/${id}`,
  COURSE_ASSESSMENTS: (id) => `/api/courses/${id}/assessments`,
  
  // Grading
  ASSESSMENTS: '/api/assessments',
  GRADES: '/api/grades',
  
  // File Upload
  UPLOADS: '/uploads'
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Default axios configuration
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
