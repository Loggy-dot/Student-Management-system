import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Users, GraduationCap, BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

const AdvancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalDepartments: 0,
    recentEnrollments: 0,
    departmentData: [],
    gradeDistribution: [],
    enrollmentTrend: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const [studentsRes, teachersRes, departmentsRes] = await Promise.all([
        axios.get(buildApiUrl(API_ENDPOINTS.STUDENTS_ENHANCED)),
        axios.get(buildApiUrl(API_ENDPOINTS.TEACHERS)),
        axios.get(buildApiUrl(API_ENDPOINTS.DEPARTMENTS))
      ]);

      const students = studentsRes.data;
      const teachers = teachersRes.data;
      const departments = departmentsRes.data;

      // Process department data for charts
      const departmentStats = departments.map(dept => {
        const studentCount = students.filter(s => s.DepartmentId === dept.DepartmentId).length;
        const teacherCount = teachers.filter(t => t.DepartmentId === dept.DepartmentId).length;
        
        return {
          name: dept.DepartmentName,
          students: studentCount,
          teachers: teacherCount,
          total: studentCount + teacherCount
        };
      });

      // Generate grade distribution (mock data for demo)
      const gradeDistribution = [
        { grade: 'A', count: Math.floor(students.length * 0.15), percentage: 15 },
        { grade: 'B', count: Math.floor(students.length * 0.25), percentage: 25 },
        { grade: 'C', count: Math.floor(students.length * 0.35), percentage: 35 },
        { grade: 'D', count: Math.floor(students.length * 0.20), percentage: 20 },
        { grade: 'F', count: Math.floor(students.length * 0.05), percentage: 5 }
      ];

      // Generate enrollment trend (mock data)
      const enrollmentTrend = [
        { month: 'Jan', enrollments: 45 },
        { month: 'Feb', enrollments: 52 },
        { month: 'Mar', enrollments: 48 },
        { month: 'Apr', enrollments: 61 },
        { month: 'May', enrollments: 55 },
        { month: 'Jun', enrollments: 67 }
      ];

      setDashboardData({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalDepartments: departments.length,
        recentEnrollments: 23, // Mock recent enrollments
        departmentData: departmentStats,
        gradeDistribution,
        enrollmentTrend,
        topPerformers: students.slice(0, 5) // Top 5 students
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      window.showToast && window.showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading advanced dashboard..." />;
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">📊 Advanced Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Comprehensive analytics and insights for your institution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{dashboardData.totalStudents}</p>
              <p className="text-blue-100 text-xs mt-1">↗️ +12% from last month</p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Teachers</p>
              <p className="text-3xl font-bold">{dashboardData.totalTeachers}</p>
              <p className="text-green-100 text-xs mt-1">↗️ +5% from last month</p>
            </div>
            <GraduationCap className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Departments</p>
              <p className="text-3xl font-bold">{dashboardData.totalDepartments}</p>
              <p className="text-purple-100 text-xs mt-1">📚 Active programs</p>
            </div>
            <BookOpen className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">New Enrollments</p>
              <p className="text-3xl font-bold">{dashboardData.recentEnrollments}</p>
              <p className="text-orange-100 text-xs mt-1">📅 This month</p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">👥 Students by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3B82F6" name="Students" />
              <Bar dataKey="teachers" fill="#10B981" name="Teachers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {dashboardData.gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollment Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Enrollment Trend (2024)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dashboardData.enrollmentTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="enrollments" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-left transition-colors">
              📝 Add New Student
            </button>
            <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg text-left transition-colors">
              👨‍🏫 Add New Teacher
            </button>
            <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 px-4 rounded-lg text-left transition-colors">
              📊 Generate Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            {dashboardData.topPerformers.slice(0, 3).map((student, index) => (
              <div key={student.StudentId} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.FirstName} {student.LastName}</p>
                  <p className="text-sm text-gray-500">{student.Department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">New student enrolled</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Grade updated</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">New teacher added</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
