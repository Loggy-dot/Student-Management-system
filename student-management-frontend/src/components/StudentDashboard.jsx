import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Award, 
  TrendingUp, 
  LogOut, 
  GraduationCap,
  Calendar,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

const StudentDashboard = ({ student, onLogout }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, [student.StudentId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:10000/api/student-grades/${student.StudentId}`);
      setGrades(response.data.grades || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradeValue = grade.replace(/[+-]/g, ''); // Remove + or - modifiers
    switch (gradeValue) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradePoints = (grade) => {
    const gradeValue = grade.replace(/[+-]/g, '');
    const modifier = grade.includes('+') ? 0.3 : grade.includes('-') ? -0.3 : 0;
    
    switch (gradeValue) {
      case 'A': return 4.0 + modifier;
      case 'B': return 3.0 + modifier;
      case 'C': return 2.0 + modifier;
      case 'D': return 1.0 + modifier;
      default: return 0.0;
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((sum, grade) => sum + getGradePoints(grade.grade), 0);
    return (totalPoints / grades.length).toFixed(2);
  };

  const getPerformanceLevel = (gpa) => {
    if (gpa >= 3.5) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (gpa >= 3.0) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (gpa >= 2.5) return { level: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const gpa = calculateGPA();
  const performance = getPerformanceLevel(gpa);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-500">Welcome back, {student.StudentName}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Student Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-white">
                  {student.StudentName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{student.StudentName}</h3>
                <p className="text-sm text-gray-500">ID: {student.StudentId}</p>
                <p className="text-sm text-gray-500">{student.DepartmentName || 'Department'}</p>
              </div>
            </div>
          </div>

          {/* GPA Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current GPA</p>
                <p className="text-3xl font-bold text-gray-900">{gpa}</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.color} ${performance.bg} mt-2`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {performance.level}
                </div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{grades.length}</p>
                <p className="text-xs text-gray-500 mt-2">Enrolled courses</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Grades Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Academic Results</h2>
            </div>
          </div>

          {error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          ) : grades.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Available</h3>
              <p className="text-gray-500">Your grades will appear here once they are published.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{grade.course}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getGradePoints(grade.grade).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {grade.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        {grades.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-gray-500" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['A', 'B', 'C', 'D'].map(gradeLevel => {
                const count = grades.filter(g => g.grade.replace(/[+-]/g, '') === gradeLevel).length;
                const percentage = grades.length > 0 ? ((count / grades.length) * 100).toFixed(1) : 0;
                
                return (
                  <div key={gradeLevel} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getGradeColor(gradeLevel).split(' ')[1]}`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-500">Grade {gradeLevel}</div>
                    <div className="text-xs text-gray-400">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;