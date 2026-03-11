import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Target, BookOpen, DollarSign, Clock, ExternalLink, Globe, MapPin, FileText, Upload, CheckCircle, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';

const SkillSuggestions = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use global resume context
  const { resumeAnalysis, skillGaps, upgradeRecommendations, skillProgress, updateSkillProgress, lastUpdated } = useResume();

  useEffect(() => {
    fetchSkillSuggestions();
  }, []);

  const fetchSkillSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/skills/suggestions/user123');
      setSuggestions(response.data.data);
    } catch (error) {
      setError('Failed to fetch skill suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openLearningPlatform = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleProgressUpdate = (skillName, increment = true) => {
    const currentProgress = skillProgress[skillName] || 0;
    const newProgress = increment 
      ? Math.min(100, currentProgress + 10) 
      : Math.max(0, currentProgress - 10);
    
    updateSkillProgress(skillName, newProgress);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getProgressText = (progress) => {
    if (progress >= 100) return 'Completed';
    if (progress >= 80) return 'Advanced';
    if (progress >= 60) return 'Intermediate';
    if (progress >= 40) return 'Beginner+';
    if (progress >= 20) return 'Beginner';
    return 'Not Started';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing Indian market trends and generating personalized skill suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button onClick={fetchSkillSuggestions} className="btn-primary mt-4">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-primary-100 rounded-lg mr-4">
            <Lightbulb className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Skill Suggestions</h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Personalized skill recommendations based on Indian market trends
            </p>
          </div>
        </div>
      </div>

      {/* Resume Analysis Status */}
      {resumeAnalysis ? (
        <div className="card mb-6 bg-blue-50 border-blue-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">Personalized Skill Suggestions</h3>
              <p className="text-blue-700">
                Showing skill suggestions based on your uploaded resume: <strong>{resumeAnalysis.filename}</strong>
              </p>
              {lastUpdated && (
                <p className="text-sm text-blue-600">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-6 bg-yellow-50 border-yellow-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-900">No Resume Uploaded</h3>
              <p className="text-yellow-700">
                Upload your resume to get personalized skill suggestions and learning recommendations.
              </p>
            </div>
            <a href="/resume-upload" className="btn-primary">
              Upload Resume
            </a>
          </div>
        </div>
      )}

      {/* Personalized Skill Gaps and Recommendations */}
      {skillGaps && skillGaps.length > 0 && (
        <div className="card mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-red-600" />
            Your Skill Gaps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillGaps.map((gap, index) => (
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
        </div>
      )}

      {/* Skill Progress Tracking */}
      {(skillGaps && skillGaps.length > 0) || Object.keys(skillProgress).length > 0 ? (
        <div className="card mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Skill Progress Tracking
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skills from gaps */}
            {skillGaps && skillGaps.map((gap, index) => {
              const progress = skillProgress[gap.skill] || 0;
              return (
                <div key={`gap-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-lg font-medium text-gray-900">{gap.skill}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(gap.priority)}`}>
                      {gap.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{gap.reason}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{getProgressText(progress)}</span>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Progress Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProgressUpdate(gap.skill, false)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Decrease Progress"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleProgressUpdate(gap.skill, true)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Increase Progress"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {progress >= 100 && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Other tracked skills */}
            {Object.entries(skillProgress).map(([skillName, progress]) => {
              // Skip skills that are already shown in gaps
              if (skillGaps && skillGaps.some(gap => gap.skill === skillName)) {
                return null;
              }
              
              return (
                <div key={`progress-${skillName}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-lg font-medium text-gray-900">{skillName}</h5>
                    <span className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                      Tracked
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{getProgressText(progress)}</span>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Progress Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProgressUpdate(skillName, false)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Decrease Progress"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleProgressUpdate(skillName, true)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Increase Progress"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {progress >= 100 && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Add new skill tracking */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Add New Skill to Track</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter skill name..."
                className="flex-1 input-field"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    updateSkillProgress(e.target.value.trim(), 0);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value.trim()) {
                    updateSkillProgress(input.value.trim(), 0);
                    input.value = '';
                  }
                }}
                className="btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {upgradeRecommendations && upgradeRecommendations.length > 0 && (
        <div className="card mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Upgrade Recommendations
          </h3>
          <div className="space-y-4">
            {upgradeRecommendations.map((rec, index) => (
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
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions && (
        <>
          {/* Immediate Actions */}
          {suggestions.marketInsights.immediateActions && (
            <div className="card mb-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Immediate Actions to Take
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.marketInsights.immediateActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-stagger">
            <div className="card">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Growing Skills</h3>
                  <p className="text-sm text-gray-600">High-demand areas in India</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {suggestions.marketInsights.topGrowingSkills.map((skill, index) => (
                    <span key={index} className="badge badge-primary text-xs">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Salary Impact</h3>
                  <p className="text-sm text-gray-600">Skills that boost earning potential in India</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700">{suggestions.marketInsights.salaryImpact}</p>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Learning Path</h3>
                  <p className="text-sm text-gray-600">Strategic skill development for Indian market</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700">{suggestions.marketInsights.learningPath}</p>
              </div>
            </div>
          </div>

          {/* Skill Suggestions by Category */}
          <div className="space-y-6">
            {suggestions.suggestions.map((category, categoryIndex) => (
              <div key={categoryIndex} className="card animate-slide-up">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                  {category.category}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
                  {category.skills.map((skill, skillIndex) => {
                    const progress = skillProgress[skill.name] || 0;
                    return (
                      <div key={skillIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{skill.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(skill.priority)}`}>
                            {skill.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{skill.reason}</p>
                        
                        {/* Practical Information */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{skill.timeToLearn || '2-4 weeks'}</span>
                          </div>
                          <div className="flex items-center text-xs text-green-600 font-medium">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span>{skill.salaryImpact || '+₹1-2 LPA'}</span>
                          </div>
                        </div>
                        
                        {/* Progress Tracking */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">Progress: {getProgressText(progress)}</span>
                            <span className="text-xs text-gray-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleProgressUpdate(skill.name, false)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Decrease Progress"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleProgressUpdate(skill.name, true)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Increase Progress"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            {progress >= 100 && (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                <span className="text-xs font-medium">Completed!</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Learning Platform Links */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            Learn on:
                          </h5>
                          <div className="space-y-1">
                            {skill.learningPlatforms?.map((platform, platformIndex) => (
                              <button
                                key={platformIndex}
                                onClick={() => openLearningPlatform(platform.url)}
                                className="w-full text-left text-xs text-blue-600 hover:text-blue-800 flex items-center justify-between p-2 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                              >
                                <span>{platform.name}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                <BookOpen className="w-4 h-4 mr-2" />
                Start Learning Path
              </button>
              <button className="btn-secondary">
                <Target className="w-4 h-4 mr-2" />
                Set Skill Goals
              </button>
              <button className="btn-secondary">
                <TrendingUp className="w-4 h-4 mr-2" />
                Track Progress
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillSuggestions;

