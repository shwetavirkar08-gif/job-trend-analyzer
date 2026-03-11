import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, FileText, Upload } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';

const SkillsAnalysis = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use global resume context
  const { resumeAnalysis, skillsAnalysis, lastUpdated } = useResume();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/skills/analysis');
        setSkills(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const chartData = {
    labels: skills.map(skill => skill.name),
    datasets: [{
      label: 'Demand Score',
      data: skills.map(skill => skill.demand),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
    }]
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* AI Interviewer CTA */}
      <div className="card mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Job Interviewer</h2>
            <p className="text-sm text-gray-600">Practice company-specific interviews with AI</p>
          </div>
          <a href="/ai-interviewer" className="btn-primary">Open Interviewer</a>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skills Analysis</h1>
        <p className="text-gray-600 mt-2">Comprehensive analysis of skills and market demands</p>
      </div>

      {/* Resume Analysis Status */}
      {resumeAnalysis ? (
        <div className="card mb-6 bg-blue-50 border-blue-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">Personalized Skills Analysis</h3>
              <p className="text-blue-700">
                Showing skills analysis based on your uploaded resume: <strong>{resumeAnalysis.filename}</strong>
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
                Upload your resume to get personalized skills analysis and recommendations.
              </p>
            </div>
            <a href="/resume-upload" className="btn-primary">
              Upload Resume
            </a>
          </div>
        </div>
      )}

      {/* Personalized Skills Analysis */}
      {skillsAnalysis && (
        <div className="card mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">{skillsAnalysis.totalSkills}</div>
              <div className="text-sm font-medium text-gray-900">Total Skills</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">{skillsAnalysis.strengths.length}</div>
              <div className="text-sm font-medium text-gray-900">Strong Areas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">{skillsAnalysis.weaknesses.length}</div>
              <div className="text-sm font-medium text-gray-900">Areas to Improve</div>
            </div>
          </div>

          {skillsAnalysis.categories && Object.keys(skillsAnalysis.categories).length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Your Skills by Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(skillsAnalysis.categories).map(([category, categorySkills]) => (
                  <div key={category} className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">{category}</h5>
                    <div className="flex flex-wrap gap-1">
                      {categorySkills.map((skill, index) => (
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

          {skillsAnalysis.marketDemand && Object.keys(skillsAnalysis.marketDemand).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Market Demand for Your Skills</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(skillsAnalysis.marketDemand).map(([skill, demand]) => (
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
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-stagger">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Demand Overview</h3>
          <Bar data={chartData} height={300} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills by Category</h3>
          <div className="space-y-4">
            {skills.slice(0, 5).map((skill) => (
              <div key={skill.name} className="flex items-center justify-between">
                <span className="font-medium">{skill.name}</span>
                <span className="text-primary-600">{skill.demand}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Skills Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skills.map((skill) => (
                <tr key={skill.name}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{skill.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{skill.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{skill.demand}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">${skill.avgSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{skill.jobCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkillsAnalysis;
