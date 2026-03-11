import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Star, Building, Users, Filter, TrendingUp, Target, Upload, FileText, ExternalLink, Calendar, Clock, Linkedin, Search, Globe } from 'lucide-react';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';

const JobMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
    salary: '',
    skills: []
  });
  const [sortBy, setSortBy] = useState('matchScore');
  const [showFilters, setShowFilters] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [remote, setRemote] = useState(false);
  const [fullTime, setFullTime] = useState(true);
  const [webLoading, setWebLoading] = useState(false);
  const [webResults, setWebResults] = useState([]);
  
  // Use global resume context
  const { resumeAnalysis, jobMatches, lastUpdated } = useResume();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs/listings');
        // Filter only active jobs
        const activeJobs = response.data.data.filter(job => job.isActive !== false);
        setJobs(activeJobs);
        setFilteredJobs(activeJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Use job matches from resume analysis if available
  useEffect(() => {
    if (jobMatches && jobMatches.length > 0) {
      setFilteredJobs(jobMatches);
    }
  }, [jobMatches]);

  useEffect(() => {
    applyFilters();
  }, [filters, sortBy, jobs]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply experience filter
    if (filters.experience) {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    // Apply salary filter
    if (filters.salary) {
      filtered = filtered.filter(job => {
        const salaryRange = job.salary;
        if (filters.salary === 'low') {
          return salaryRange.includes('₹8') || salaryRange.includes('₹9');
        } else if (filters.salary === 'medium') {
          return salaryRange.includes('₹10') || salaryRange.includes('₹11') || salaryRange.includes('₹12');
        } else if (filters.salary === 'high') {
          return salaryRange.includes('₹13') || salaryRange.includes('₹14') || salaryRange.includes('₹15') || salaryRange.includes('₹16');
        }
        return true;
      });
    }

    // Apply skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => 
        filters.skills.some(skill => 
          job.requiredSkills.some(requiredSkill => 
            requiredSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'salary':
          return extractSalary(b.salary) - extractSalary(a.salary);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const extractSalary = (salaryString) => {
    const match = salaryString.match(/₹(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      experience: '',
      salary: '',
      skills: []
    });
    setSortBy('matchScore');
  };

  const handleApplyJob = (job) => {
    if (job.applicationUrl) {
      // Show confirmation dialog
      const confirmed = window.confirm(
        `You are about to apply for "${job.title}" at ${job.company}.\n\nThis will open the company's career portal in a new tab.\n\nDo you want to continue?`
      );
      
      if (confirmed) {
        window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      alert('Application link not available for this position. Please check the company website directly.');
    }
  };

  const handleOpenLinkedIn = (job) => {
    if (job.linkedinUrl) {
      const confirmed = window.confirm(
        `Open LinkedIn search for "${job.title}" at ${job.company} in ${job.location}?\n\nThis will open LinkedIn in a new tab.`
      );
      if (confirmed) {
        window.open(job.linkedinUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      alert('LinkedIn link not available for this position.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const availableSkills = [...new Set(jobs.flatMap(job => job.requiredSkills))];
  const availableLocations = [...new Set(jobs.map(job => job.location))];
  const availableExperiences = [...new Set(jobs.map(job => job.experience))];

  const handleWebSearch = async () => {
    try {
      setWebLoading(true);
      setWebResults([]);
      const params = new URLSearchParams();
      if (keywords) params.append('q', keywords);
      if (filters.location) params.append('location', filters.location);
      params.append('type', 'job');
      if (filters.skills?.length) params.append('skills', filters.skills.join(','));
      if (remote) params.append('remote', 'true');
      if (fullTime) params.append('fullTime', 'true');
      const res = await axios.get(`/api/jobs/search?${params.toString()}`);
      setWebResults(res.data?.data || []);
    } catch (e) {
      console.error('Job meta search failed', e);
    } finally {
      setWebLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Job Matching</h1>
        <p className="text-gray-600 mt-2">Find the perfect job match based on your skills and experience</p>
      </div>

      {/* Resume Analysis Status */}
      {resumeAnalysis ? (
        <div className="card mb-6 bg-blue-50 border-blue-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">Resume Analysis Active</h3>
              <p className="text-blue-700">
                Showing personalized job matches based on your uploaded resume: <strong>{resumeAnalysis.filename}</strong>
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
                Upload your resume to get personalized job matches based on your skills and experience.
              </p>
            </div>
            <a href="/resume-upload" className="btn-primary">
              Upload Resume
            </a>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="card mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters & Sorting</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="input-field"
                  placeholder="e.g. React, Node.js, Data Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Locations</option>
                  {availableLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({...filters, experience: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  {availableExperiences.map(exp => (
                    <option key={exp} value={exp}>{exp.charAt(0).toUpperCase() + exp.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <select
                  value={filters.salary}
                  onChange={(e) => setFilters({...filters, salary: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Ranges</option>
                  <option value="low">₹8L - ₹10L</option>
                  <option value="medium">₹10L - ₹12L</option>
                  <option value="high">₹12L+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="matchScore">Match Score</option>
                  <option value="salary">Salary</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills Filter</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.slice(0, 10).map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      if (filters.skills.includes(skill)) {
                        setFilters({
                          ...filters,
                          skills: filters.skills.filter(s => s !== skill)
                        });
                      } else {
                        setFilters({
                          ...filters,
                          skills: [...filters.skills, skill]
                        });
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      filters.skills.includes(skill)
                        ? 'bg-primary-100 text-primary-800 border-primary-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
                <span>Remote</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="checkbox" checked={fullTime} onChange={(e) => setFullTime(e.target.checked)} />
                <span>Full-time</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Showing {filteredJobs.length} of {jobs.length} jobs</span>
              <div className="flex items-center space-x-2">
                <button onClick={handleWebSearch} className="btn-primary flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search Web</span>
                </button>
                <button onClick={clearFilters} className="btn-secondary">Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div className="space-y-6 animate-stagger">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedJob(job)}>
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge ${getMatchScoreColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="capitalize">{job.experience}</span>
                    </div>
                    {job.postedDate && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {formatDate(job.postedDate)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">{job.description}</p>

                  <div className="mb-3">
                    <h6 className="font-medium text-gray-900 mb-2">Required Skills:</h6>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, index) => (
                        <span key={index} className="badge badge-secondary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {job.matchedSkills && job.matchedSkills.length > 0 && (
                    <div className="mb-3">
                      <h6 className="font-medium text-gray-900 mb-2">Your Matching Skills:</h6>
                      <div className="flex flex-wrap gap-2">
                        {job.matchedSkills.map((skill, index) => (
                          <span key={index} className="badge badge-success">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div>
                      <h6 className="font-medium text-gray-900 mb-2">Skills to Learn:</h6>
                      <div className="flex flex-wrap gap-2">
                        {job.missingSkills.map((skill, index) => (
                          <span key={index} className="badge badge-warning">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex items-center space-x-2">
                  <button 
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement save job functionality
                    }}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  {job.linkedinUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLinkedIn(job);
                      }}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </button>
                  )}
                  {job.applicationUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyJob(job);
                      }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Apply</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters or broadening your search criteria.</p>
            <button onClick={clearFilters} className="btn-primary mt-4">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* External provider results */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Globe className="w-5 h-5 mr-2" />Results from job sites</h3>
        {webLoading ? (
          <div className="text-gray-600">Searching providers…</div>
        ) : webResults.length ? (
          <div className="space-y-4">
            {webResults.map((r) => (
              <div key={r.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{r.title}</div>
                  <div className="text-sm text-gray-600">{r.provider}</div>
                </div>
                <button className="btn-secondary flex items-center space-x-2" onClick={() => window.open(r.applicationUrl, '_blank', 'noopener,noreferrer')}>
                  <ExternalLink className="w-4 h-4" />
                  <span>Open</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">Use the filters above to search jobs across providers.</div>
        )}
      </div>
      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{selectedJob.company}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{selectedJob.salary}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Match Score:</span>
                  <span className={`badge ${getMatchScoreColor(selectedJob.matchScore)}`}>
                    {selectedJob.matchScore}% Match
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                  <p className="text-gray-600">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, index) => (
                      <span key={index} className="badge badge-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedJob.matchedSkills && selectedJob.matchedSkills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Your Matching Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.matchedSkills.map((skill, index) => (
                        <span key={index} className="badge badge-success">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.missingSkills && selectedJob.missingSkills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills to Learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.missingSkills.map((skill, index) => (
                        <span key={index} className="badge badge-warning">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      // TODO: Implement save job functionality
                    }}
                  >
                    Save Job
                  </button>
                  {selectedJob.linkedinUrl && (
                    <button 
                      className="btn-secondary flex items-center space-x-2"
                      onClick={() => handleOpenLinkedIn(selectedJob)}
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>View on LinkedIn</span>
                    </button>
                  )}
                  {selectedJob.applicationUrl ? (
                    <button 
                      className="btn-primary flex items-center space-x-2"
                      onClick={() => handleApplyJob(selectedJob)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Apply Now</span>
                    </button>
                  ) : (
                    <button className="btn-primary opacity-50 cursor-not-allowed">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;
