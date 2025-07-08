import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-emerald-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-sky-500/30 to-emerald-400/20 backdrop-blur-sm"></div>
      
      {/* Floating blur elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/90 backdrop-blur-md rounded-full mb-6 shadow-2xl border border-white/20">
            <GraduationCap className="w-10 h-10 text-sky-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Student Database</h1>
          <p className="text-sky-100 text-lg font-medium">Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-6 relative z-50">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-2xl border-4 border-blue-500 relative z-50"
                style={{
                  minHeight: '60px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                    <span className="text-xl font-bold">SIGNING IN...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Lock className="h-6 w-6" />
                    <span className="text-xl font-bold">LOGIN NOW</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Student Portal Link */}
        <div className="text-center mt-6 relative z-50">
          <a
            href="/student-portal"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 backdrop-blur-md text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 border-2 border-white/50 shadow-2xl transform hover:scale-105 relative z-50"
            style={{
              minHeight: '56px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
          >
            <GraduationCap className="w-6 h-6 mr-3" />
            STUDENT LOGIN PORTAL
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sky-100 text-sm drop-shadow">
            © 2025 Student Database Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;