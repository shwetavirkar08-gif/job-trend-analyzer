const express = require('express');
const router = express.Router();

// Mock analysis data
const marketAnalysis = {
  overallTrend: 'Growing',
  growthRate: 8.5,
  totalJobs: 125000,
  avgSalary: 92000,
  topIndustries: [
    { name: 'Technology', growth: 12.3, jobCount: 45000 },
    { name: 'Healthcare', growth: 9.8, jobCount: 32000 },
    { name: 'Finance', growth: 7.2, jobCount: 28000 },
    { name: 'Education', growth: 6.5, jobCount: 20000 }
  ],
  skillGaps: [
    { skill: 'Machine Learning', gap: 15.2, impact: 'High' },
    { skill: 'Cloud Architecture', gap: 12.8, impact: 'High' },
    { skill: 'Cybersecurity', gap: 18.5, impact: 'Critical' },
    { skill: 'Data Engineering', gap: 14.3, impact: 'High' }
  ]
};

// Get comprehensive market analysis
router.get('/market', (req, res) => {
  try {
    res.json({
      success: true,
      data: marketAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get salary analysis by skill
router.get('/salary', (req, res) => {
  try {
    const salaryData = [
      { skill: 'React', entry: 65000, mid: 85000, senior: 120000, lead: 150000 },
      { skill: 'Python', entry: 70000, mid: 90000, senior: 125000, lead: 160000 },
      { skill: 'Machine Learning', entry: 80000, mid: 110000, senior: 150000, lead: 200000 },
      { skill: 'Node.js', entry: 60000, mid: 82000, senior: 115000, lead: 145000 },
      { skill: 'Data Science', entry: 75000, mid: 95000, senior: 130000, lead: 170000 },
      { skill: 'AWS', entry: 70000, mid: 105000, senior: 140000, lead: 180000 }
    ];
    
    res.json({
      success: true,
      data: salaryData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get geographic analysis
router.get('/geographic', (req, res) => {
  try {
    const geographicData = [
      { city: 'San Francisco', avgSalary: 135000, jobCount: 18500, costOfLiving: 'Very High' },
      { city: 'New York', avgSalary: 125000, jobCount: 16200, costOfLiving: 'Very High' },
      { city: 'Seattle', avgSalary: 115000, jobCount: 12800, costOfLiving: 'High' },
      { city: 'Austin', avgSalary: 95000, jobCount: 9800, costOfLiving: 'Medium' },
      { city: 'Denver', avgSalary: 90000, jobCount: 8500, costOfLiving: 'Medium' },
      { city: 'Atlanta', avgSalary: 85000, jobCount: 7200, costOfLiving: 'Medium' }
    ];
    
    res.json({
      success: true,
      data: geographicData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get experience level analysis
router.get('/experience', (req, res) => {
  try {
    const experienceData = [
      { level: 'Entry Level (0-2 years)', avgSalary: 65000, jobCount: 25000, demand: 85 },
      { level: 'Mid Level (3-5 years)', avgSalary: 85000, jobCount: 45000, demand: 92 },
      { level: 'Senior Level (6-10 years)', avgSalary: 115000, jobCount: 35000, demand: 88 },
      { level: 'Lead/Principal (10+ years)', avgSalary: 150000, jobCount: 20000, demand: 95 }
    ];
    
    res.json({
      success: true,
      data: experienceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get skill combination analysis
router.get('/skill-combinations', (req, res) => {
  try {
    const skillCombinations = [
      { skills: ['React', 'Node.js'], demand: 98, avgSalary: 95000, jobCount: 12500 },
      { skills: ['Python', 'Machine Learning'], demand: 95, avgSalary: 110000, jobCount: 8900 },
      { skills: ['AWS', 'Docker'], demand: 92, avgSalary: 115000, jobCount: 7600 },
      { skills: ['Data Science', 'SQL'], demand: 90, avgSalary: 100000, jobCount: 10200 },
      { skills: ['JavaScript', 'TypeScript'], demand: 88, avgSalary: 85000, jobCount: 15800 }
    ];
    
    res.json({
      success: true,
      data: skillCombinations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get trend predictions
router.get('/predictions', (req, res) => {
  try {
    const predictions = [
      { skill: 'AI/ML', predictedGrowth: 25.5, timeframe: '2024-2025', confidence: 0.92 },
      { skill: 'Cybersecurity', predictedGrowth: 18.7, timeframe: '2024-2025', confidence: 0.89 },
      { skill: 'Cloud Computing', predictedGrowth: 15.3, timeframe: '2024-2025', confidence: 0.85 },
      { skill: 'Data Engineering', predictedGrowth: 20.1, timeframe: '2024-2025', confidence: 0.91 },
      { skill: 'DevOps', predictedGrowth: 12.8, timeframe: '2024-2025', confidence: 0.87 }
    ];
    
    res.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
