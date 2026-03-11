import React, { useMemo, useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Briefcase, Activity, MapPin } from 'lucide-react';
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

const JobTrends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await axios.get('/api/jobs/trends');
        setTrends(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trends:', error);
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const gridColor = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(100, 116, 139, 0.2)';
  const tickColor = isDark ? '#e5e7eb' : '#334155';
  const titleColor = isDark ? '#f3f4f6' : '#0f172a';
  const legendColor = isDark ? '#e5e7eb' : '#0f172a';

  const demandChartData = {
    labels: trends.map(skill => skill.skill),
    datasets: [
      {
        label: 'Demand Score',
        data: trends.map(skill => skill.demand),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const growthChartData = {
    labels: trends.map(skill => skill.skill),
    datasets: [
      {
        label: 'Growth Rate (%)',
        data: trends.map(skill => skill.growth),
        backgroundColor: trends.map((_, index) => 
          `hsl(${200 + index * 30}, 70%, 60%)`
        ),
        borderColor: trends.map((_, index) => 
          `hsl(${200 + index * 30}, 70%, 50%)`
        ),
        borderWidth: 1,
      },
    ],
  };

  const salaryChartData = {
    labels: trends.map(skill => skill.skill),
    datasets: [
      {
        label: 'Average Salary (₹)',
        data: trends.map(skill => skill.avgSalary),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
    ],
  };

  const jobCountChartData = {
    labels: trends.map(skill => skill.skill),
    datasets: [
      {
        data: trends.map(skill => skill.jobCount),
        backgroundColor: trends.map((_, index) => 
          `hsl(${280 + index * 40}, 70%, 60%)`
        ),
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
        labels: { color: legendColor },
      },
      title: {
        display: true,
        text: 'Indian Job Market Trends Analysis',
        color: titleColor,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: tickColor },
      },
      x: { grid: { color: 'transparent' }, ticks: { color: tickColor } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: legendColor },
      },
      title: {
        display: true,
        text: 'Job Distribution by Skill in India',
        color: titleColor,
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
        <h1 className="text-3xl font-bold text-gray-900">Indian Job Market Trends</h1>
        <p className="text-gray-600 mt-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Real-time analysis of job market demands and skill requirements in India
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Skills</p>
              <p className="text-2xl font-bold text-gray-900">{trends.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Demand</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(trends.reduce((sum, skill) => sum + skill.demand, 0) / trends.length)}%
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(trends.reduce((sum, skill) => sum + skill.avgSalary, 0) / trends.length).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {trends.reduce((sum, skill) => sum + skill.jobCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Indian Cities Info */}
      <div className="card mb-8 animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Indian Tech Hubs</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'].map((city) => (
            <div key={city} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{city}</div>
              <div className="text-xs text-gray-600">Tech Hub</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-stagger">
        {/* Demand Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Demand Trends in India</h3>
          <Line data={demandChartData} options={chartOptions} height={300} />
        </div>

        {/* Growth Rate Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Rate by Skill</h3>
          <Bar data={growthChartData} options={chartOptions} height={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-stagger">
        {/* Salary Analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Salary by Skill (₹)</h3>
          <Bar data={salaryChartData} options={chartOptions} height={300} />
        </div>

        {/* Job Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Distribution</h3>
          <Doughnut data={jobCountChartData} options={doughnutOptions} height={300} />
        </div>
      </div>

      {/* Detailed Skills Table */}
      <div className="card animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Skills Analysis for Indian Market</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Salary (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trends.map((skill) => (
                <tr 
                  key={skill.skill}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSkill(skill)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{skill.skill}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{skill.demand}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${skill.demand}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      skill.growth > 15 ? 'text-green-600' : 
                      skill.growth > 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      +{skill.growth}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">₹{skill.avgSalary.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{skill.jobCount.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedSkill.skill}</h3>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Demand Score:</span>
                <span className="font-medium">{selectedSkill.demand}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth Rate:</span>
                <span className="font-medium">+{selectedSkill.growth}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Salary:</span>
                <span className="font-medium">₹{selectedSkill.avgSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Jobs:</span>
                <span className="font-medium">{selectedSkill.jobCount.toLocaleString()}</span>
              </div>
              {selectedSkill.indianCompanies && (
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-600 mb-2">Top Indian Companies:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkill.indianCompanies.map((company, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTrends;
