import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Briefcase, Upload, ArrowRight, Activity, DollarSign, MapPin, BarChart3, Lightbulb, FileText, CheckCircle, Target } from 'lucide-react';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    avgSalary: 0,
    growthRate: 0,
    topSkills: []
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Use global resume context
  const { resumeAnalysis, jobMatches, skillsAnalysis, skillGaps, lastUpdated } = useResume();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [trendsRes, jobsRes] = await Promise.all([
          axios.get('/api/jobs/trends'),
          axios.get('/api/jobs/listings')
        ]);

        const trends = trendsRes.data.data;
        const jobs = jobsRes.data.data;

        setStats({
          totalJobs: trends.reduce((sum, skill) => sum + skill.jobCount, 0),
          avgSalary: Math.round(trends.reduce((sum, skill) => sum + skill.avgSalary, 0) / trends.length),
          growthRate: Math.round(trends.reduce((sum, skill) => sum + skill.growth, 0) / trends.length),
          topSkills: trends.slice(0, 5)
        });

        setRecentJobs(jobs.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile?.();
    }
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
    <Link to={href} className="card group hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to JobTrend Analyzer - Your gateway to job market insights</p>
      </div>

      {/* Resume Analysis Summary (from context or profile) */}
      {(resumeAnalysis || profile?.resumeAnalysis) && (
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Resume Analysis Active</h3>
                {(() => {
                  const ra = resumeAnalysis || profile?.resumeAnalysis;
                  if (!ra) return null;
                  return (
                    <p className="text-blue-700">
                      {(ra.filename || ra.name || 'Resume')} • {(ra.experienceLevel || 'N/A')} level • {(ra.skills || []).length} skills detected
                    </p>
                  );
                })()}
                {lastUpdated && (
                  <p className="text-sm text-blue-600">
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Link to="/resume-upload" className="btn-secondary">
              Update Resume
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{jobMatches.length}</div>
              <div className="text-sm text-gray-600">Job Matches</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{skillsAnalysis?.totalSkills || (profile?.resumeAnalysis?.skills || []).length || 0}</div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{skillGaps.length}</div>
              <div className="text-sm text-gray-600">Skill Gaps</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {jobMatches.length > 0 ? Math.round(jobMatches[0].matchScore) : 0}%
              </div>
              <div className="text-sm text-gray-600">Top Match Score</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/matching" className="btn-primary text-sm">
              View Job Matches
            </Link>
            <Link to="/skills" className="btn-secondary text-sm">
              Skills Analysis
            </Link>
            <Link to="/suggestions" className="btn-secondary text-sm">
              Skill Suggestions
            </Link>
            <Link to="/insights" className="btn-secondary text-sm">
              Market Insights
            </Link>
          </div>
        </div>
      )}

      {/* User Progress (when logged in) */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-stagger">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skill Progress</h3>
            {profile?.skillProgress && Object.keys(profile.skillProgress).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(profile.skillProgress).slice(0, 6).map(([skill, prog]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>{skill}</span>
                      <span>{prog}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div className="bg-primary-500 h-2 rounded" style={{ width: `${Math.max(0, Math.min(100, prog))}%` }}></div>
                    </div>
                  </div>
                ))}
                {Object.entries(profile.skillProgress).length > 6 && (
                  <div className="text-xs text-gray-500">and more…</div>
                )}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">Update progress from Skills pages to track learning.</div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Interview Results</h3>
            {profile?.interviewResults?.length ? (
              <div className="space-y-2">
                {profile.interviewResults.slice(-3).reverse().map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    <span className="font-medium">{r.score} / {r.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">No interviews taken yet.</div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Aptitude Results</h3>
            {profile?.aptitudeResults?.length ? (
              <div className="space-y-2">
                {profile.aptitudeResults.slice(-3).reverse().map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    <span className="font-medium">{r.score} / {r.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-sm">No aptitude tests taken yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          icon={Briefcase}
          color="bg-blue-500"
          subtitle="Available positions"
        />
        <StatCard
          title="Average Salary"
          value={`$${stats.avgSalary.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
          subtitle="Annual compensation"
        />
        <StatCard
          title="Growth Rate"
          value={`${stats.growthRate}%`}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle="Market expansion"
        />
        <StatCard
          title="Active Users"
          value="2,847"
          icon={Users}
          color="bg-orange-500"
          subtitle="This month"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/job-trends')}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Job Trends</h3>
              <p className="text-sm text-gray-600">Analyze market trends</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resume-upload')}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
              <p className="text-sm text-gray-600">Parse and analyze</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/job-matching')}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Job Matching</h3>
              <p className="text-sm text-gray-600">Find perfect matches</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/skills-analysis')}>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Skills Analysis</h3>
              <p className="text-sm text-gray-600">Market demand insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-stagger">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/skill-suggestions')}>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Skill Suggestions</h3>
              <p className="text-sm text-gray-600">AI-powered recommendations</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resume-builder')}>
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resume Builder</h3>
              <p className="text-sm text-gray-600">Create professional resumes</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/market-insights')}>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Market Insights</h3>
              <p className="text-sm text-gray-600">Comprehensive analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Skills & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-stagger">
        {/* Top Skills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Skills in Demand</h3>
            <Link to="/job-trends" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topSkills.map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{skill.demand}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${skill.demand}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Job Openings</h3>
            <Link to="/job-matching" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="border-l-4 border-primary-500 pl-4">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {user && (
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">LeetCode Solved</h3>
            <Link to="/leetcode" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Go to LeetCode</Link>
          </div>
          {profile?.leetcodeSolved?.length ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-700">Total solved: {profile.leetcodeSolved.length}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profile.leetcodeSolved.slice(-6).reverse().map((p, idx) => (
                  <a key={idx} href={p.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm hover:bg-gray-100">
                    {p.title} <span className="text-xs text-gray-500 ml-1">({p.difficulty})</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm">Mark problems as solved on the LeetCode page to track progress.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
