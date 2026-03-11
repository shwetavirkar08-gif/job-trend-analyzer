import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Briefcase, Activity, MapPin, Users, Building, Globe, FileText, Upload } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useResume } from '../context/ResumeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MarketInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use global resume context
  const { resumeAnalysis, skillsAnalysis, lastUpdated } = useResume();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get('/api/jobs/trends');
        setInsights(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const salaryTrendData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Average Tech Salary (₹)',
        data: [650000, 680000, 720000, 780000, 850000, 920000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const cityComparisonData = {
    labels: ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'],
    datasets: [
      {
        label: 'Average Salary (₹)',
        data: [950000, 980000, 920000, 890000, 850000, 820000],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
    ],
  };

  const skillDemandData = {
    labels: insights?.map(skill => skill.skill) || [],
    datasets: [
      {
        data: insights?.map(skill => skill.demand) || [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Indian Tech Market Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Skill Demand Distribution in India',
      },
    },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Indian Market Insights</h1>
        <p className="text-gray-600 mt-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Comprehensive analysis of Indian job market trends and opportunities
        </p>
      </div>

      {/* Resume Analysis Status */}
      {resumeAnalysis ? (
        <div className="card mb-6 bg-blue-50 border-blue-200 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">Personalized Market Insights</h3>
              <p className="text-blue-700">
                Showing market insights relevant to your uploaded resume: <strong>{resumeAnalysis.filename}</strong>
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
                Upload your resume to get personalized market insights and trends relevant to your profile.
              </p>
            </div>
            <a href="/resume-upload" className="btn-primary">
              Upload Resume
            </a>
          </div>
        </div>
      )}

      {/* Personalized Market Insights */}
      {skillsAnalysis && skillsAnalysis.marketDemand && (
        <div className="card mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Your Skills Market Demand
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(skillsAnalysis.marketDemand).map(([skill, demand]) => (
              <div key={skill} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{skill}</span>
                  <span className="text-sm font-medium text-blue-600">{demand}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${demand}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">
                  {demand >= 90 ? 'Very High Demand' : 
                   demand >= 80 ? 'High Demand' : 
                   demand >= 70 ? 'Moderate Demand' : 'Lower Demand'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Market Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Market Growth</p>
              <p className="text-2xl font-bold text-gray-900">+18.5%</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900">₹9.2L</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tech Workforce</p>
              <p className="text-2xl font-bold text-gray-900">5.4M+</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">IT Companies</p>
              <p className="text-2xl font-bold text-gray-900">15K+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Indian Tech Hubs */}
      <div className="card mb-8 animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-primary-600" />
          Top Indian Tech Hubs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { city: 'Bangalore', companies: '5000+', focus: 'Startups & MNCs' },
            { city: 'Mumbai', companies: '3500+', focus: 'Finance & E-commerce' },
            { city: 'Delhi NCR', companies: '4000+', focus: 'Government & IT' },
            { city: 'Hyderabad', companies: '2500+', focus: 'IT Services' },
            { city: 'Pune', companies: '2000+', focus: 'Automotive & IT' },
            { city: 'Chennai', companies: '1800+', focus: 'Manufacturing & IT' }
          ].map((hub) => (
            <div key={hub.city} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{hub.city}</div>
              <div className="text-xs text-gray-600">{hub.companies}</div>
              <div className="text-xs text-gray-500 mt-1">{hub.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-stagger">
        {/* Salary Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Trends (2019-2024)</h3>
          <Line data={salaryTrendData} options={chartOptions} height={300} />
        </div>

        {/* City Comparison */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary by City</h3>
          <Bar data={cityComparisonData} options={chartOptions} height={300} />
        </div>
      </div>

      {/* Skill Demand Chart */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Demand Distribution</h3>
        <div className="max-w-2xl mx-auto">
          <Doughnut data={skillDemandData} options={doughnutOptions} height={300} />
        </div>
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emerging Trends</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">AI/ML Adoption</span>
              <span className="text-sm text-blue-600">+45%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Remote Work</span>
              <span className="text-sm text-green-600">+32%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Cloud Migration</span>
              <span className="text-sm text-purple-600">+28%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Cybersecurity</span>
              <span className="text-sm text-orange-600">+38%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Indian IT Companies</h3>
          <div className="space-y-3">
            {[
              { name: 'TCS', revenue: '₹1.9L Cr', employees: '6.1L+' },
              { name: 'Infosys', revenue: '₹1.4L Cr', employees: '3.4L+' },
              { name: 'Wipro', revenue: '₹90K Cr', employees: '2.5L+' },
              { name: 'HCL', revenue: '₹85K Cr', employees: '2.2L+' },
              { name: 'Tech Mahindra', revenue: '₹45K Cr', employees: '1.5L+' }
            ].map((company) => (
              <div key={company.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                  <div className="text-xs text-gray-600">{company.revenue} revenue</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">{company.employees}</div>
                  <div className="text-xs text-gray-600">employees</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future Outlook */}
      <div className="card animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Outlook (2024-2026)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">25%</div>
            <div className="text-sm font-medium text-gray-900">Expected Salary Growth</div>
            <div className="text-xs text-gray-600 mt-1">Driven by AI/ML demand</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">3.2M+</div>
            <div className="text-sm font-medium text-gray-900">New Tech Jobs</div>
            <div className="text-xs text-gray-600 mt-1">By 2026</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">₹15L</div>
            <div className="text-sm font-medium text-gray-900">Avg Senior Salary</div>
            <div className="text-xs text-gray-600 mt-1">For 5+ years experience</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
