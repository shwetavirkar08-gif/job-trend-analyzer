const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const natural = require('natural');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Common skills dictionary for analysis
const commonSkills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
  'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git',
  'Machine Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch',
  'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
  'C++', 'C#', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala'
];

// Extract skills from text using natural language processing
function extractSkills(text) {
  const words = text.toLowerCase().split(/\s+/);
  const foundSkills = [];
  
  commonSkills.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  // Remove duplicates
  return [...new Set(foundSkills)];
}

// Calculate experience level based on text analysis
function calculateExperienceLevel(text) {
  const experienceKeywords = {
    'entry': ['entry', 'junior', '0-2', '0-1', '1-2'],
    'mid': ['mid', 'intermediate', '2-5', '3-5', '3-7'],
    'senior': ['senior', 'lead', '5+', '7+', '10+', 'principal', 'architect']
  };
  
  const textLower = text.toLowerCase();
  
  for (const [level, keywords] of Object.entries(experienceKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      return level;
    }
  }
  
  return 'mid'; // Default to mid-level
}

// Upload and parse resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF content
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    
    // Extract information
    const skills = extractSkills(text);
    const experienceLevel = calculateExperienceLevel(text);
    
    // Basic text analysis
    const wordCount = text.split(/\s+/).length;
    const hasEducation = /education|university|college|degree|bachelor|master|phd/i.test(text);
    const hasExperience = /experience|work|employment|job|position/i.test(text);
    
    // Enhanced skill analysis
    const skillAnalysis = analyzeSkills(skills);
    const skillGaps = identifySkillGaps(skills);
    const upgradeRecommendations = generateUpgradeRecommendations(skills, experienceLevel);
    
    // Job matching based on skills
    const jobMatches = await getJobMatches(skills, experienceLevel);
    
    // Create comprehensive analysis result
    const analysis = {
      filename: req.file.originalname,
      fileSize: req.file.size,
      textLength: text.length,
      wordCount,
      skills: skills,
      skillAnalysis: skillAnalysis,
      skillGaps: skillGaps,
      upgradeRecommendations: upgradeRecommendations,
      experienceLevel,
      hasEducation,
      hasExperience,
      jobMatches: jobMatches,
      extractedText: text.substring(0, 500) + '...', // First 500 chars
      timestamp: new Date().toISOString()
    };
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Resume parsed and analyzed successfully',
      data: analysis
    });
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse resume',
      message: error.message
    });
  }
});

// Add new endpoint for resume builder
router.post('/builder', (req, res) => {
  try {
    const resumeData = req.body;
    
    // Validate required fields
    if (!resumeData.personalInfo || !resumeData.experience || !resumeData.education) {
      return res.status(400).json({
        success: false,
        error: 'Missing required resume sections'
      });
    }

    // Generate a unique ID for the resume
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock resume storage (in real app, this would go to database)
    const savedResume = {
      id: resumeId,
      ...resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    // Mock analysis of the built resume
    const analysis = {
      score: Math.floor(Math.random() * 30) + 70, // 70-100 score
      suggestions: [
        'Consider adding quantifiable achievements to experience section',
        'Include relevant certifications and training',
        'Add a professional summary at the top',
        'Ensure consistent formatting throughout'
      ],
      strengths: [
        'Clear work history progression',
        'Relevant technical skills listed',
        'Professional formatting'
      ],
      areasForImprovement: [
        'Add measurable accomplishments',
        'Include industry-specific keywords',
        'Consider adding a skills section'
      ]
    };

    res.json({
      success: true,
      message: 'Resume created successfully',
      data: {
        resume: savedResume,
        analysis: analysis
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create resume',
      details: error.message
    });
  }
});

// Get resume templates
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'modern',
        name: 'Modern Professional',
        description: 'Clean, contemporary design for Indian tech professionals',
        preview: 'modern-template.png',
        category: 'Technology'
      },
      {
        id: 'creative',
        name: 'Creative Portfolio',
        description: 'Bold design for creative and design roles in Indian companies',
        preview: 'creative-template.png',
        category: 'Creative'
      },
      {
        id: 'classic',
        name: 'Classic Corporate',
        description: 'Traditional format for Indian corporate environments',
        preview: 'classic-template.png',
        category: 'Corporate'
      },
      {
        id: 'minimal',
        name: 'Minimalist',
        description: 'Simple, focused design for any Indian industry',
        preview: 'minimal-template.png',
        category: 'Universal'
      },
      {
        id: 'indian-tech',
        name: 'Indian Tech',
        description: 'Optimized for Indian IT companies and startups',
        preview: 'indian-tech-template.png',
        category: 'Technology'
      }
    ];

    res.json({
      success: true,
      message: 'Resume templates retrieved successfully',
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates',
      details: error.message
    });
  }
});

// Get resume analysis history (mock data)
router.get('/history', (req, res) => {
  try {
    const mockHistory = [
      {
        id: 1,
        filename: 'resume_john_doe.pdf',
        skills: ['React', 'Node.js', 'JavaScript'],
        experienceLevel: 'senior',
        uploadedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        filename: 'resume_jane_smith.pdf',
        skills: ['Python', 'Machine Learning', 'Data Science'],
        experienceLevel: 'mid',
        uploadedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: mockHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enhanced skill analysis function
function analyzeSkills(skills) {
  const skillCategories = {
    'Frontend': ['React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript'],
    'Backend': ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go'],
    'Database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server'],
    'Cloud': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
    'AI/ML': ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch', 'Data Science'],
    'DevOps': ['Jenkins', 'GitLab CI', 'Ansible', 'Puppet', 'Chef', 'Docker'],
    'Mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin']
  };

  const analysis = {
    totalSkills: skills.length,
    categories: {},
    strengths: [],
    weaknesses: [],
    marketDemand: {}
  };

  // Categorize skills
  skills.forEach(skill => {
    for (const [category, categorySkills] of Object.entries(skillCategories)) {
      if (categorySkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
        if (!analysis.categories[category]) {
          analysis.categories[category] = [];
        }
        analysis.categories[category].push(skill);
        break;
      }
    }
  });

  // Identify strengths and weaknesses
  Object.entries(analysis.categories).forEach(([category, categorySkills]) => {
    if (categorySkills.length >= 2) {
      analysis.strengths.push(`${category}: ${categorySkills.length} skills`);
    } else if (categorySkills.length === 0) {
      analysis.weaknesses.push(`${category}: No skills`);
    }
  });

  // Market demand analysis (mock data)
  const marketDemandData = {
    'React': 95, 'Python': 92, 'Machine Learning': 88, 'Node.js': 85,
    'Data Science': 90, 'AWS': 87, 'Java': 89, 'Angular': 78,
    'DevOps': 86, 'Cybersecurity': 91
  };

  skills.forEach(skill => {
    const demand = marketDemandData[skill] || 70;
    analysis.marketDemand[skill] = demand;
  });

  return analysis;
}

// Identify skill gaps based on market trends
function identifySkillGaps(currentSkills) {
  const highDemandSkills = [
    'Machine Learning', 'Data Science', 'AWS', 'DevOps', 'Cybersecurity',
    'React', 'Python', 'Node.js', 'Java', 'Docker', 'Kubernetes'
  ];

  const gaps = highDemandSkills.filter(skill => 
    !currentSkills.some(currentSkill => 
      currentSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  return gaps.map(skill => ({
    skill: skill,
    priority: getSkillPriority(skill),
    reason: getSkillGapReason(skill),
    learningTime: getLearningTime(skill),
    salaryImpact: getSalaryImpact(skill)
  }));
}

// Get skill priority level
function getSkillPriority(skill) {
  const highPriority = ['Machine Learning', 'Data Science', 'AWS', 'Cybersecurity'];
  const mediumPriority = ['DevOps', 'Docker', 'Kubernetes', 'React'];
  
  if (highPriority.includes(skill)) return 'high';
  if (mediumPriority.includes(skill)) return 'medium';
  return 'low';
}

// Get skill gap reasoning
function getSkillGapReason(skill) {
  const reasons = {
    'Machine Learning': 'AI/ML boom in Indian market, 45% growth',
    'Data Science': 'High demand in Indian analytics companies',
    'AWS': 'Cloud adoption growing rapidly in India',
    'DevOps': 'Essential for modern software development',
    'Cybersecurity': 'Critical need in digital transformation',
    'React': 'Most popular frontend framework in Indian startups',
    'Python': 'High demand in AI/ML and data science',
    'Docker': 'Containerization essential for modern deployments',
    'Kubernetes': 'Growing demand in cloud-native companies',
    'Java': 'Essential for Indian enterprise software'
  };
  
  return reasons[skill] || 'Growing demand in tech sector';
}

// Get estimated learning time
function getLearningTime(skill) {
  const learningTimes = {
    'Machine Learning': '3-6 months',
    'Data Science': '4-8 months',
    'AWS': '2-4 months',
    'DevOps': '3-5 months',
    'Cybersecurity': '4-6 months',
    'React': '2-3 months',
    'Python': '2-4 months',
    'Docker': '1-2 months',
    'Kubernetes': '2-3 months',
    'Java': '3-5 months'
  };
  
  return learningTimes[skill] || '2-4 months';
}

// Get salary impact
function getSalaryImpact(skill) {
  const impacts = {
    'Machine Learning': '25-40% increase',
    'Data Science': '20-35% increase',
    'AWS': '15-30% increase',
    'DevOps': '20-35% increase',
    'Cybersecurity': '30-45% increase',
    'React': '15-25% increase',
    'Python': '20-30% increase',
    'Docker': '15-25% increase',
    'Kubernetes': '20-30% increase',
    'Java': '15-25% increase'
  };
  
  return impacts[skill] || '15-25% increase';
}

// Generate upgrade recommendations
function generateUpgradeRecommendations(currentSkills, experienceLevel) {
  const recommendations = [];
  
  // Based on experience level
  if (experienceLevel === 'entry') {
    recommendations.push({
      type: 'Foundation',
      skills: ['JavaScript', 'HTML/CSS', 'Git', 'Basic SQL'],
      reason: 'Essential foundation for any tech career',
      priority: 'high'
    });
  } else if (experienceLevel === 'mid') {
    recommendations.push({
      type: 'Specialization',
      skills: ['React/Node.js', 'Database Design', 'API Development'],
      reason: 'Focus on full-stack development',
      priority: 'high'
    });
  } else if (experienceLevel === 'senior') {
    recommendations.push({
      type: 'Leadership',
      skills: ['System Design', 'Architecture', 'Team Leadership'],
      reason: 'Prepare for senior/lead roles',
      priority: 'medium'
    });
  }
  
  // Based on current skills
  if (currentSkills.includes('JavaScript') && !currentSkills.includes('TypeScript')) {
    recommendations.push({
      type: 'Skill Enhancement',
      skills: ['TypeScript'],
      reason: 'TypeScript is becoming standard in modern development',
      priority: 'medium'
    });
  }
  
  if (currentSkills.includes('Python') && !currentSkills.includes('Machine Learning')) {
    recommendations.push({
      type: 'Career Growth',
      skills: ['Machine Learning', 'Data Science'],
      reason: 'AI/ML skills highly valued in Indian market',
      priority: 'high'
    });
  }
  
  return recommendations;
}

// Get job matches based on skills
async function getJobMatches(skills, experienceLevel) {
  // Mock job data - in real app, this would query a job database
  const allJobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TCS',
      location: 'Mumbai, Maharashtra',
      salary: '₹12,00,000 - ₹15,00,000',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      matchScore: 0,
      experience: 'senior'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'Infosys',
      location: 'Bangalore, Karnataka',
      salary: '₹10,00,000 - ₹13,00,000',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
      matchScore: 0,
      experience: 'mid'
    },
    {
      id: 3,
      title: 'Machine Learning Engineer',
      company: 'Wipro',
      location: 'Hyderabad, Telangana',
      salary: '₹13,00,000 - ₹16,00,000',
      requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS'],
      matchScore: 0,
      experience: 'senior'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'HCL',
      location: 'Pune, Maharashtra',
      salary: '₹11,00,000 - ₹14,00,000',
      requiredSkills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
      matchScore: 0,
      experience: 'mid'
    },
    {
      id: 5,
      title: 'Data Scientist',
      company: 'Tech Mahindra',
      location: 'Chennai, Tamil Nadu',
      salary: '₹12,00,000 - ₹15,00,000',
      requiredSkills: ['Python', 'Data Science', 'SQL', 'Machine Learning'],
      matchScore: 0,
      experience: 'mid'
    },
    {
      id: 6,
      title: 'Java Developer',
      company: 'Cognizant',
      location: 'Delhi, NCR',
      salary: '₹9,00,000 - ₹12,00,000',
      requiredSkills: ['Java', 'Spring Boot', 'Hibernate', 'MySQL'],
      matchScore: 0,
      experience: 'mid'
    },
    {
      id: 7,
      title: 'Frontend Developer',
      company: 'Mindtree',
      location: 'Bangalore, Karnataka',
      salary: '₹8,00,000 - ₹11,00,000',
      requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
      matchScore: 0,
      experience: 'entry'
    },
    {
      id: 8,
      title: 'Backend Developer',
      company: 'L&T Infotech',
      location: 'Mumbai, Maharashtra',
      salary: '₹9,00,000 - ₹12,00,000',
      requiredSkills: ['Java', 'Spring', 'Hibernate', 'PostgreSQL'],
      matchScore: 0,
      experience: 'mid'
    }
  ];

  // Calculate match scores
  const jobsWithScores = allJobs.map(job => {
    const skillMatches = job.requiredSkills.filter(requiredSkill =>
      skills.some(skill => skill.toLowerCase().includes(requiredSkill.toLowerCase()))
    );
    
    const skillMatchPercentage = (skillMatches.length / job.requiredSkills.length) * 100;
    const experienceMatch = experienceLevel === job.experience ? 20 : 
                           (experienceLevel === 'mid' && job.experience === 'senior') ? 10 : 0;
    
    const totalScore = Math.min(100, skillMatchPercentage + experienceMatch);
    
    return {
      ...job,
      matchScore: Math.round(totalScore),
      matchedSkills: skillMatches,
      missingSkills: job.requiredSkills.filter(skill => 
        !skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      )
    };
  });

  // Sort by match score (highest first)
  return jobsWithScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10); // Return top 10 matches
}

module.exports = router;
