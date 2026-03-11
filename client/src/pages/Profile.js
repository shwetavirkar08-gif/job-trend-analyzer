import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Brain, ListChecks } from 'lucide-react';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => { refreshProfile?.(); }, []);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600">Please log in to view your profile and progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <div className="text-gray-600">{user.email}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">Resume Analysis</h2>
          </div>
          {profile?.resumeAnalysis ? (
            <div className="text-sm text-gray-700">
              <div><span className="font-medium">File:</span> {profile.resumeAnalysis.filename || profile.resumeAnalysis.name || 'Resume'}</div>
              <div><span className="font-medium">Experience:</span> {profile.resumeAnalysis.experienceLevel || 'N/A'}</div>
              <div><span className="font-medium">Skills:</span> {(profile.resumeAnalysis.skills || []).join(', ') || 'N/A'}</div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm">No resume analysis saved yet.</div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center mb-3">
            <ListChecks className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">Skill Progress</h2>
          </div>
          {profile?.skillProgress && Object.keys(profile.skillProgress).length ? (
            <div className="space-y-2">
              {Object.entries(profile.skillProgress).map(([skill, prog]) => (
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
            </div>
          ) : (
            <div className="text-gray-600 text-sm">No skill progress recorded yet.</div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold">AI Interview Results</h2>
          </div>
          {profile?.interviewResults?.length ? (
            <div className="space-y-2">
              {profile.interviewResults.slice().reverse().map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                  <span className="font-medium">{r.score} / {r.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-sm">No interviews completed yet.</div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center mb-3">
            <Brain className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold">Aptitude Results</h2>
          </div>
          {profile?.aptitudeResults?.length ? (
            <div className="space-y-2">
              {profile.aptitudeResults.slice().reverse().map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                  <span className="font-medium">{r.score} / {r.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-sm">No aptitude tests completed yet.</div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">LeetCode Solved</h2>
          </div>
          {profile?.leetcodeSolved?.length ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-700">Total solved: {profile.leetcodeSolved.length}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profile.leetcodeSolved.slice().reverse().map((p, idx) => (
                  <a key={idx} href={p.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm hover:bg-gray-100">
                    {p.title} <span className="text-xs text-gray-500 ml-1">({p.difficulty})</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm">No problems marked as solved yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;


