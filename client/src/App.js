import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeUpload from './pages/ResumeUpload';
import JobMatching from './pages/JobMatching';
import SkillsAnalysis from './pages/SkillsAnalysis';
import SkillSuggestions from './pages/SkillSuggestions';
import JobTrends from './pages/JobTrends';
import MarketInsights from './pages/MarketInsights';
import Internships from './pages/Internships';
import LeetCode from './pages/LeetCode';
import AIInterviewer from './pages/AIInterviewer';
import Aptitude from './pages/Aptitude';
import { ResumeProvider } from './context/ResumeContext';
import Chatbot from './components/Chatbot';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import './App.css';

// Set the base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Make it available globally
window.API_BASE_URL = API_BASE_URL;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ResumeProvider>
        <Router>
          <div className="App bg-gray-50 text-gray-900 dark:bg-secondary-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex">
            <Navbar />
            <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-8 pt-20 md:pt-8 animate-fade-in">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/resume-upload" element={<ResumeUpload />} />
                <Route path="/job-matching" element={<JobMatching />} />
                <Route path="/skills-analysis" element={<SkillsAnalysis />} />
                <Route path="/skill-suggestions" element={<SkillSuggestions />} />
                <Route path="/job-trends" element={<JobTrends />} />
                <Route path="/market-insights" element={<MarketInsights />} />
                <Route path="/leetcode" element={<LeetCode />} />
                <Route path="/ai-interviewer" element={<AIInterviewer />} />
                <Route path="/aptitude" element={<Aptitude />} />
                <Route path="/internships" element={<Internships />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Chatbot />
          </div>
        </Router>
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
