import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Building, 
  TrendingUp, 
  Award, 
  Calendar,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDepartments: 0,
    totalCourses: 0,
    averageGPA: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, departmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/students-report'),
        axios.get('http://localhost:5000/api/departments')
      ]);

      const students = studentsRes.data;
      const departments = departmentsRes.data;

      // Calculate stats
      const totalCourses = new Set(students.flatMap(s => [s.Course1, s.Course2])).size;
      const avgGPA = students.reduce((acc, student) => {
        const grade1 = student.Grade1 === 'A' ? 4 : student.Grade1 === 'B' ? 3 : student.Grade1 === 'C' ? 2 : 1;
        const grade2 = student.Grade2 === 'A' ? 4 : student.Grade2 === 'B' ? 3 : student.Grade2 === 'C' ? 2 : 1;
        return acc + (grade1 + grade2) / 2;
      }, 0) / students.length;

      setStats({
        totalStudents: students.length,
        totalDepartments: departments.length,
        totalCourses,
        averageGPA: avgGPA.toFixed(2)
      });

      setRecentStudents(students.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12%',
      changeType: 'increase',
      description: 'Active enrollments'
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+3%',
      changeType: 'increase',
      description: 'Academic divisions'
    },
    {
      title: 'Active Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      change: '+8%',
      changeType: 'increase',
      description: 'Course offerings'
    },
    {
      title: 'Average GPA',
      value: stats.averageGPA,
      icon: Award,
      gradient: 'from-orange-500 to-red-500',
      change: '+0.2',
      changeType: 'increase',
      description: 'Overall performance'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Student',
      description: 'Register a new student',
      icon: Plus,
      gradient: 'from-blue-500 to-cyan-500',
      link: '/students'
    },
    {
      title: 'View Reports',
      description: 'Generate academic reports',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-teal-500',
      link: '/reports'
    },
    {
      title: 'Manage Courses',
      description: 'Course administration',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      link: '/courses'
    },
    {
      title: 'Analytics',
      description: 'Performance insights',
      icon: PieChart,
      gradient: 'from-orange-500 to-red-500',
      link: '/reports'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-teal-600/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome to EduManage
              </h1>
              <p className="text-cyan-200 text-lg mb-4">
                Your comprehensive student management dashboard
              </p>
              <div className="flex items-center space-x-4 text-cyan-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">System Status</p>
                    <p className="text-cyan-200 text-sm">All systems operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 card-hover stagger-item"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className={`block p-4 rounded-xl bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-white`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Students */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Students</h2>
              </div>
              <Link
                to="/students"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>View All</span>
                <Eye className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentStudents.map((student, index) => {
                const avgGrade = ((student.Grade1 === 'A' ? 4 : student.Grade1 === 'B' ? 3 : student.Grade1 === 'C' ? 2 : 1) +
                                (student.Grade2 === 'A' ? 4 : student.Grade2 === 'B' ? 3 : student.Grade2 === 'C' ? 2 : 1)) / 2;
                
                const getDepartmentColor = (department) => {
                  const colors = {
                    'Science': 'from-green-500 to-emerald-600',
                    'Arts': 'from-purple-500 to-pink-600',
                    'Engineering': 'from-blue-500 to-cyan-600',
                    'Computer Science': 'from-indigo-500 to-purple-600',
                    'Business': 'from-orange-500 to-red-600',
                    'Information Technology': 'from-cyan-500 to-blue-600'
                  };
                  return colors[department] || 'from-gray-500 to-slate-600';
                };
                
                return (
                  <div 
                    key={student.StudentId}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${getDepartmentColor(student.Department)} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold">
                        {student.StudentName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{student.StudentName}</p>
                      <p className="text-sm text-gray-600">ID: {student.StudentId}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">GPA: {avgGrade.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">{student.Department}</p>
                    </div>
                    
                    <div className={`w-3 h-3 rounded-full ${
                      avgGrade >= 3.5 ? 'bg-green-400' :
                      avgGrade >= 2.5 ? 'bg-blue-400' :
                      avgGrade >= 1.5 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Performance Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-green-700">85%</p>
            <p className="text-sm text-green-600">Excellent Performance</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-700">92%</p>
            <p className="text-sm text-blue-600">Course Completion</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-purple-700">98%</p>
            <p className="text-sm text-purple-600">Student Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;