import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';
import { Briefcase, MapPin, Calendar, ExternalLink, Linkedin, Target, FileText, Search, Globe } from 'lucide-react';

const Internships = () => {
  const { resumeAnalysis, lastUpdated } = useResume();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webLoading, setWebLoading] = useState(false);
  const [webResults, setWebResults] = useState([]);

  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [useResumeSkills, setUseResumeSkills] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [remote, setRemote] = useState(false);
  const [fullTime, setFullTime] = useState(true);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await axios.get('/api/jobs/internships');
        const data = res.data?.data || [];

        // If resume is available, compute match scores
        if (resumeAnalysis?.skills?.length) {
          const skills = resumeAnalysis.skills;
          const withScores = data.map((intern) => {
            const matches = (intern.requiredSkills || []).filter((req) =>
              skills.some((s) => s.toLowerCase().includes(req.toLowerCase()))
            );
            const score = Math.round((matches.length / Math.max(1, (intern.requiredSkills || []).length)) * 100);
            return { ...intern, matchScore: score, matchedSkills: matches };
          });
          setInternships(withScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
        } else {
          setInternships(data);
        }
      } catch (e) {
        console.error('Error fetching internships', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, [resumeAnalysis]);

  useEffect(() => {
    if (resumeAnalysis?.skills?.length && useResumeSkills) {
      setSelectedSkills(resumeAnalysis.skills.slice(0, 8));
    }
  }, [resumeAnalysis, useResumeSkills]);

  const handleApply = (intern) => {
    if (intern.applicationUrl) {
      window.open(intern.applicationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLinkedIn = (intern) => {
    if (intern.linkedinUrl) {
      window.open(intern.linkedinUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWebSearch = async () => {
    try {
      setWebLoading(true);
      setWebResults([]);
      const params = new URLSearchParams();
      if (keywords) params.append('q', keywords);
      if (location) params.append('location', location);
      params.append('type', 'internship');
      const skillsToSend = (useResumeSkills ? selectedSkills : selectedSkills) || [];
      if (skillsToSend.length) params.append('skills', skillsToSend.join(','));
      if (remote) params.append('remote', 'true');
      if (fullTime) params.append('fullTime', 'true');
      const res = await axios.get(`/api/jobs/search?${params.toString()}`);
      setWebResults(res.data?.data || []);
    } catch (e) {
      console.error('Meta search failed', e);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Internships</h1>
        <p className="text-gray-600 mt-2">Discover internships tailored to your resume and skills</p>
      </div>

      {resumeAnalysis ? (
        <div className="card mb-6 bg-blue-50 border-blue-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">Using Your Resume</h3>
              <p className="text-blue-700">
                Matching internships based on: <strong>{resumeAnalysis.filename}</strong>
              </p>
              {lastUpdated && (
                <p className="text-sm text-blue-600">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-6 bg-yellow-50 border-yellow-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-900">No Resume Uploaded</h3>
              <p className="text-yellow-700">Upload a resume to rank internships by fit.</p>
            </div>
            <a href="/resume-upload" className="btn-primary">Upload Resume</a>
          </div>
        </div>
      )}

      {/* Meta Search Filters */}
      <div className="card mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Search across job sites</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="input-field" placeholder="e.g. React, Data Science" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="City or Remote" />
          </div>
          <div className="flex items-center space-x-3 mt-6">
            <label className="flex items-center space-x-2 text-gray-700">
              <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
              <span>Remote</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-700">
              <input type="checkbox" checked={fullTime} onChange={(e) => setFullTime(e.target.checked)} />
              <span>Full-time</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills to include</label>
          <div className="flex flex-wrap gap-2">
            {(resumeAnalysis?.skills || []).slice(0, 15).map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => {
                    setSelectedSkills((prev) =>
                      active ? prev.filter((s) => s !== skill) : [...prev, skill]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    active
                      ? 'bg-primary-100 text-primary-800 border-primary-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Search providers: LinkedIn, Indeed, Naukri, Glassdoor, Internshala</span>
          <button onClick={handleWebSearch} className="btn-primary flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Search Web</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-stagger">
        {internships.length ? (
          internships.map((intern) => (
            <div key={intern.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{intern.title}</h3>
                    {typeof intern.matchScore === 'number' && (
                      <span className="badge bg-blue-100 text-blue-700 border-blue-200">{intern.matchScore}% Match</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 mb-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{intern.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{intern.location}</span>
                    </div>
                    {intern.postedDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {new Date(intern.postedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{intern.description}</p>
                  {intern.requiredSkills?.length ? (
                    <div className="mb-3">
                      <h6 className="font-medium text-gray-900 mb-2">Required Skills:</h6>
                      <div className="flex flex-wrap gap-2">
                        {intern.requiredSkills.map((s, i) => (
                          <span key={i} className="badge badge-secondary">{s}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="ml-6 flex items-center space-x-2">
                  {intern.linkedinUrl && (
                    <button className="btn-secondary flex items-center space-x-2" onClick={() => handleLinkedIn(intern)}>
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </button>
                  )}
                  {intern.applicationUrl && (
                    <button className="btn-primary flex items-center space-x-2" onClick={() => handleApply(intern)}>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try again later or broaden your search.</p>
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
          <div className="text-gray-600">Use the filters above to search internships across providers.</div>
        )}
      </div>
    </div>
  );
};

export default Internships;

