import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Home,
  Users,
  Building,
  BookOpen,
  FileText,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Bell,
  Star,
  UserCheck,
  Mail
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Students', href: '/students', icon: Users, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Teachers', href: '/teachers', icon: UserCheck, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Departments', href: '/departments', icon: Building, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Courses', href: '/courses', icon: BookOpen, gradient: 'from-orange-500 to-red-500' },
    { name: 'Email', href: '/email', icon: Mail, gradient: 'from-blue-500 to-indigo-500' },
    { name: 'Reports', href: '/reports', icon: FileText, gradient: 'from-indigo-500 to-purple-500' },
  ];

  const quickActions = [
    { name: 'Add Student', icon: Plus, action: () => {}, gradient: 'from-green-400 to-emerald-500' },
    { name: 'Search Records', icon: Search, action: () => {}, gradient: 'from-blue-400 to-cyan-500' },
    { name: 'Student Portal', href: '/student-portal', icon: GraduationCap, gradient: 'from-purple-400 to-pink-500' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-72'
    } min-h-screen flex flex-col shadow-2xl relative overflow-hidden`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-5 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <Link to="/" className={`flex items-center space-x-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-lime-400 to-green-500 rounded-full animate-ping"></div>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EduManage
                </h1>
                <p className="text-sm text-slate-400 font-medium">Student Management Pro</p>
              </div>
            )}
          </Link>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-200 hover:scale-105"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-cyan-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-6 space-y-3">
        <div className={`${isCollapsed ? 'hidden' : 'block'} mb-6`}>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Navigation
          </h2>
        </div>
        
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`relative flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 group transform hover:scale-105 ${
                active
                  ? `bg-gradient-to-r ${item.gradient} shadow-lg shadow-cyan-500/25`
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : ''}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
              )}
              <Icon className={`h-6 w-6 relative z-10 ${
                active ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
              } transition-colors duration-200`} />
              {!isCollapsed && (
                <span className={`font-semibold relative z-10 ${
                  active ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.name}
                </span>
              )}
              {active && !isCollapsed && (
                <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="relative z-10 p-6 border-t border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
            <Star className="h-3 w-3 mr-2 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              
              if (action.href) {
                return (
                  <Link
                    key={action.name}
                    to={action.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-white font-medium`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{action.name}</span>
                  </Link>
                );
              }
              
              return (
                <button
                  key={action.name}
                  onClick={action.action}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-white font-medium`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="relative z-10 p-6 border-t border-slate-700/50">
        {!isCollapsed ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl backdrop-blur-sm border border-slate-600/30">
              <div className="relative">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-cyan-400 truncate font-medium">{user?.role}</p>
              </div>
              <Bell className="h-4 w-4 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors duration-200" />
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-slate-400">Theme</span>
              <ThemeToggle />
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-200 font-medium transform hover:scale-105"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex justify-center p-3 text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-200 transform hover:scale-105"
              type="button"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;