import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Briefcase, Target, Award, MapPin, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use global resume context
  const { 
    resumeAnalysis: analysis, 
    isLoading: uploading, 
    error, 
    setResumeAnalysis, 
    setLoading, 
    setError,
    clearResumeData 
  } = useResume();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeAnalysis(response.data.data);
      setFile(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'skills', name: 'Skills Analysis', icon: Award },
    { id: 'jobs', name: 'Job Matches', icon: Briefcase },
    { id: 'gaps', name: 'Skill Gaps', icon: Target },
    { id: 'upgrades', name: 'Upgrade Path', icon: TrendingUp }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">File Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Filename:</span>
              <span className="font-medium">{analysis.filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">File Size:</span>
              <span className="font-medium">{formatFileSize(analysis.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Word Count:</span>
              <span className="font-medium">{analysis.wordCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Analysis Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Experience Level:</span>
              <span className="badge badge-primary">{analysis.experienceLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Education:</span>
              <span className={analysis.hasEducation ? 'text-green-600' : 'text-red-600'}>
                {analysis.hasEducation ? 'Detected' : 'Not Found'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Skills:</span>
              <span className="font-medium">{analysis.skillAnalysis?.totalSkills || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-4">Skills Detected</h4>
        {analysis.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, index) => (
              <span key={index} className="badge badge-primary">{skill}</span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No specific skills detected.</p>
        )}
      </div>

      {analysis.skillAnalysis && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Skill Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.skillAnalysis.categories).map(([category, skills]) => (
              <div key={category} className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">{category}</h5>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSkillsAnalysis = () => (
    <div className="space-y-6">
      {analysis.skillAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">{analysis.skillAnalysis.totalSkills}</div>
              <div className="text-sm font-medium text-gray-900">Total Skills</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">{analysis.skillAnalysis.strengths.length}</div>
              <div className="text-sm font-medium text-gray-900">Strong Areas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">{analysis.skillAnalysis.weaknesses.length}</div>
              <div className="text-sm font-medium text-gray-900">Areas to Improve</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Strengths</h4>
              {analysis.skillAnalysis.strengths.length > 0 ? (
                <div className="space-y-2">
                  {analysis.skillAnalysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No strong areas identified yet.</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Areas to Improve</h4>
              {analysis.skillAnalysis.weaknesses.length > 0 ? (
                <div className="space-y-2">
                  {analysis.skillAnalysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center space-x-2 text-yellow-600">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">All major areas covered!</p>
              )}
            </div>
          </div>

          {analysis.skillAnalysis.marketDemand && Object.keys(analysis.skillAnalysis.marketDemand).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Market Demand for Your Skills</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.skillAnalysis.marketDemand).map(([skill, demand]) => (
                  <div key={skill} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{skill}</span>
                      <span className="text-sm font-medium text-blue-600">{demand}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${demand}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderJobMatches = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Top Job Matches</h4>
        <p className="text-gray-600">Jobs sorted by skill match and experience level</p>
      </div>

      {analysis.jobMatches && analysis.jobMatches.length > 0 ? (
        <div className="space-y-4">
          {analysis.jobMatches.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="text-lg font-medium text-gray-900">{job.title}</h5>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.company}</span>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getMatchScoreColor(job.matchScore)}`}>
                    {job.matchScore}%
                  </div>
                  <div className="text-sm text-gray-600">Match Score</div>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-lg font-semibold text-green-600">{job.salary}</span>
              </div>

              <div className="mb-3">
                <h6 className="font-medium text-gray-900 mb-2">Required Skills:</h6>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className={`text-xs px-2 py-1 rounded ${
                      job.matchedSkills.includes(skill) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.missingSkills.length > 0 && (
                <div className="mb-3">
                  <h6 className="font-medium text-gray-900 mb-2">Missing Skills:</h6>
                  <div className="flex flex-wrap gap-2">
                    {job.missingSkills.map((skill, index) => (
                      <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Experience: {job.experience}</span>
                <button className="btn-primary text-sm">Apply Now</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No job matches found.</p>
      )}
    </div>
  );

  const renderSkillGaps = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Skill Gaps Analysis</h4>
        <p className="text-gray-600">High-demand skills you should consider learning</p>
      </div>

      {analysis.skillGaps && analysis.skillGaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.skillGaps.map((gap, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-lg font-medium text-gray-900">{gap.skill}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(gap.priority)}`}>
                  {gap.priority}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{gap.reason}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Learning Time:</span>
                  <span className="font-medium">{gap.learningTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary Impact:</span>
                  <span className="font-medium text-green-600">{gap.salaryImpact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Great! You have all the high-demand skills covered.</p>
      )}
    </div>
  );

  const renderUpgradePath = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Skill Upgrade Recommendations</h4>
        <p className="text-gray-600">Personalized learning path based on your profile</p>
      </div>

      {analysis.upgradeRecommendations && analysis.upgradeRecommendations.length > 0 ? (
        <div className="space-y-4">
          {analysis.upgradeRecommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="text-lg font-medium text-gray-900">{rec.type}</h5>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </span>
              </div>
              
              <div className="mb-3">
                <h6 className="font-medium text-gray-900 mb-2">Recommended Skills:</h6>
                <div className="flex flex-wrap gap-2">
                  {rec.skills.map((skill, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Priority: {rec.priority}</span>
                <button className="btn-secondary text-sm">View Learning Path</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No specific upgrade recommendations at this time.</p>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'skills': return renderSkillsAnalysis();
      case 'jobs': return renderJobMatches();
      case 'gaps': return renderSkillGaps();
      case 'upgrades': return renderUpgradePath();
      default: return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Upload & Analysis</h1>
        <p className="text-gray-600 mt-2">Upload your resume to analyze skills, get job recommendations, and identify skill gaps</p>
      </div>

      <div className="card mb-8 animate-slide-up">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
          <p className="text-gray-600 mb-6">Supported format: PDF (Max size: 5MB)</p>

          {file ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">{file.name}</p>
              <p className="text-sm text-gray-500 mb-4">{formatFileSize(file.size)}</p>
              <div className="flex justify-center space-x-3">
                <button onClick={handleUpload} disabled={uploading} className="btn-primary">
                  {uploading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
                <button onClick={() => setFile(null)} className="btn-secondary">Remove</button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                Select PDF file
                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {analysis && (
        <div className="card animate-slide-up">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}

          <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
            <button onClick={clearResumeData} className="btn-secondary">
              Analyze Another Resume
            </button>
            <button className="btn-primary">Get Detailed Report</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
