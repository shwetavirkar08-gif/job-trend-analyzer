import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, Users, TrendingUp, FileText, Lightbulb, Briefcase, CheckCircle, GraduationCap, Moon, Sun, Bot, Brain, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resumeAnalysis } = useResume();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/job-trends', label: 'Job Trends', icon: TrendingUp },
    { path: '/resume-upload', label: 'Resume Upload', icon: Upload },
    { path: '/job-matching', label: 'Job Matching', icon: Users },
    { path: '/internships', label: 'Internships', icon: GraduationCap },
    { path: '/skills-analysis', label: 'Skills Analysis', icon: FileText },
    { path: '/skill-suggestions', label: 'Skill Suggestions', icon: Lightbulb },
    { path: '/resume-builder', label: 'Resume Builder', icon: Briefcase },
    { path: '/market-insights', label: 'Market Insights', icon: TrendingUp },
    { path: '/leetcode', label: 'LeetCode', icon: CheckCircle },
    { path: '/ai-interviewer', label: 'AI Interviewer', icon: Bot },
    { path: '/aptitude', label: 'Aptitude', icon: Brain }
  ];

  const toggleMobile = () => setMobileOpen((v) => !v);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-secondary-800 border-r border-gray-200 dark:border-secondary-700 h-screen sticky top-0 hidden md:flex flex-col z-40">
        <div className="h-16 px-4 flex items-center border-b border-gray-200 dark:border-secondary-700">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">JobTrend Analyzer</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto no-scrollbar py-3">
          <ul className="px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-secondary-700 dark:text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-secondary-700'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="truncate">{item.label}</span>
                    {resumeAnalysis && item.path === '/resume-upload' && (
                      <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            {user ? (
              <div className="flex items-center min-w-0">
                <Link to="/profile" className="text-sm text-gray-700 dark:text-gray-200 truncate hover:underline">{user.name}</Link>
                <button onClick={logout} className="ml-2 px-2 py-2 rounded-md border border-gray-200 dark:border-secondary-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link to="/login" className="px-2 py-2 rounded-md border border-gray-200 dark:border-secondary-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <LogIn className="w-4 h-4" />
                </Link>
                <Link to="/signup" className="ml-2 px-2 py-2 rounded-md border border-gray-200 dark:border-secondary-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <UserPlus className="w-4 h-4" />
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar and drawer */}
      <div className="md:hidden fixed inset-x-0 top-0 bg-white dark:bg-secondary-800 border-b border-gray-200 dark:border-secondary-700 z-40">
        <div className="h-16 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">JobTrend Analyzer</span>
          </Link>
          <div className="flex items-center">
            <ThemeToggle />
            <button
              className="ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={toggleMobile}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        <div id="mobile-nav" className={`${mobileOpen ? 'block' : 'hidden'} border-t border-gray-200 dark:border-secondary-700`}>
          <div className="px-3 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-secondary-700 dark:text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-secondary-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const ThemeToggle = ({ mobile = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      className={`ml-2 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-secondary-600 px-2 py-2 transition-colors ${
        mobile
          ? 'text-gray-600 dark:text-gray-300'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
      }`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default Navbar;
