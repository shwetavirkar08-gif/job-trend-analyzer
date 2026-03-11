const express = require('express');
const router = express.Router();

// Mock skills database
const skillsDatabase = {
  'React': {
    category: 'Frontend',
    demand: 95,
    avgSalary: 850000, // In INR
    relatedSkills: ['JavaScript', 'TypeScript', 'Redux', 'Next.js'],
    jobCount: 15420,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Python': {
    category: 'Backend',
    demand: 92,
    avgSalary: 900000, // In INR
    relatedSkills: ['Django', 'Flask', 'Pandas', 'NumPy'],
    jobCount: 18250,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Machine Learning': {
    category: 'AI/ML',
    demand: 88,
    avgSalary: 1100000, // In INR
    relatedSkills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
    jobCount: 8950,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Node.js': {
    category: 'Backend',
    demand: 85,
    avgSalary: 820000, // In INR
    relatedSkills: ['JavaScript', 'Express.js', 'MongoDB', 'REST API'],
    jobCount: 12340,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Data Science': {
    category: 'Analytics',
    demand: 90,
    avgSalary: 950000, // In INR
    relatedSkills: ['Python', 'SQL', 'Statistics', 'Visualization'],
    jobCount: 11200,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'AWS': {
    category: 'Cloud',
    demand: 87,
    avgSalary: 1050000, // In INR
    relatedSkills: ['DevOps', 'Docker', 'Kubernetes', 'Lambda'],
    jobCount: 9870,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Java': {
    category: 'Backend',
    demand: 89,
    avgSalary: 880000, // In INR
    relatedSkills: ['Spring Boot', 'Hibernate', 'Maven', 'JUnit'],
    jobCount: 15600,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Angular': {
    category: 'Frontend',
    demand: 78,
    avgSalary: 780000, // In INR
    relatedSkills: ['TypeScript', 'RxJS', 'Angular Material', 'NgRx'],
    jobCount: 8900,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'DevOps': {
    category: 'Infrastructure',
    demand: 86,
    avgSalary: 980000, // In INR
    relatedSkills: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI'],
    jobCount: 7600,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  },
  'Cybersecurity': {
    category: 'Security',
    demand: 91,
    avgSalary: 1200000, // In INR
    relatedSkills: ['Network Security', 'Penetration Testing', 'Security Auditing', 'Compliance'],
    jobCount: 5400,
    indianCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant']
  }
};

// Get skills analysis
router.get('/analysis', (req, res) => {
  try {
    const skills = Object.keys(skillsDatabase).map(skill => ({
      name: skill,
      ...skillsDatabase[skill]
    }));
    
    res.json({
      success: true,
      data: skills,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NOTE: Do NOT place dynamic routes before specific ones to avoid shadowing

// Get skills by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const skills = Object.entries(skillsDatabase)
      .filter(([_, skillData]) => skillData.category.toLowerCase() === category.toLowerCase())
      .map(([skillName, skillData]) => ({
        name: skillName,
        ...skillData
      }));
    
    res.json({
      success: true,
      data: skills,
      category: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get top skills by demand
router.get('/top/demand', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const skills = Object.entries(skillsDatabase)
      .sort(([_, a], [__, b]) => b.demand - a.demand)
      .slice(0, parseInt(limit))
      .map(([skillName, skillData]) => ({
        name: skillName,
        ...skillData
      }));
    
    res.json({
      success: true,
      data: skills,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get skills by salary range
router.get('/salary/:min/:max', (req, res) => {
  try {
    const { min, max } = req.params;
    const minSalary = parseInt(min);
    const maxSalary = parseInt(max);
    
    const skills = Object.entries(skillsDatabase)
      .filter(([_, skillData]) => 
        skillData.avgSalary >= minSalary && skillData.avgSalary <= maxSalary
      )
      .map(([skillName, skillData]) => ({
        name: skillName,
        ...skillData
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary);
    
    res.json({
      success: true,
      data: skills,
      salaryRange: { min: minSalary, max: maxSalary }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add new endpoint for skill suggestions
router.get('/suggestions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Practical and actionable skill suggestions based on Indian market trends
    const skillSuggestions = {
      userId,
      timestamp: new Date().toISOString(),
      suggestions: [
        {
          category: 'Core Programming Skills',
          skills: [
            { 
              name: 'Python', 
              reason: 'Essential for AI/ML, web development, and automation. 95% of Indian tech companies require Python skills.', 
              priority: 'high',
              timeToLearn: '2-3 months',
              salaryImpact: '+₹2-3 LPA',
              learningPlatforms: [
                { name: 'NPTEL (Free)', url: 'https://nptel.ac.in/courses/106/105/106105183/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/python' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/complete-python-bootcamp/' },
                { name: 'Great Learning', url: 'https://www.greatlearning.in/python-for-machine-learning' }
              ]
            },
            { 
              name: 'JavaScript', 
              reason: 'Required for 90% of web development jobs in India. Essential for both frontend and backend.', 
              priority: 'high',
              timeToLearn: '1-2 months',
              salaryImpact: '+₹1.5-2.5 LPA',
              learningPlatforms: [
                { name: 'freeCodeCamp (Free)', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/javascript' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/javascript-training-course' }
              ]
            },
            { 
              name: 'Java', 
              reason: 'Critical for enterprise applications. 80% of Indian IT companies use Java for backend development.', 
              priority: 'high',
              timeToLearn: '3-4 months',
              salaryImpact: '+₹2-4 LPA',
              learningPlatforms: [
                { name: 'NPTEL (Free)', url: 'https://nptel.ac.in/courses/106/105/106105183/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/java-programming' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/java-tutorial/' },
                { name: 'Great Learning', url: 'https://www.greatlearning.in/java-programming' }
              ]
            }
          ]
        },
        {
          category: 'Web Development Framework',
          skills: [
            { 
              name: 'React.js', 
              reason: 'Most in-demand frontend framework. 70% of Indian startups and MNCs use React for web applications.', 
              priority: 'high',
              timeToLearn: '2-3 months',
              salaryImpact: '+₹2-3.5 LPA',
              learningPlatforms: [
                { name: 'React Official (Free)', url: 'https://react.dev/learn' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/react' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/' },
                { name: 'freeCodeCamp (Free)', url: 'https://www.freecodecamp.org/news/learn-react-js-in-this-crash-course/' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/react-js-training-course' }
              ]
            },
            { 
              name: 'Node.js', 
              reason: 'Essential for full-stack development. 60% of Indian web companies use Node.js for backend.', 
              priority: 'high',
              timeToLearn: '2-3 months',
              salaryImpact: '+₹2-3 LPA',
              learningPlatforms: [
                { name: 'Node.js Official (Free)', url: 'https://nodejs.org/en/learn/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/server-side-nodejs' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/nodejs-the-complete-guide/' },
                { name: 'freeCodeCamp (Free)', url: 'https://www.freecodecamp.org/news/learn-node-js-completely-and-practice-with-examples/' },
                { name: 'Great Learning', url: 'https://www.greatlearning.in/node-js-course' }
              ]
            }
          ]
        },
        {
          category: 'Cloud & DevOps',
          skills: [
            { 
              name: 'AWS', 
              reason: 'Leading cloud platform in India. 75% of Indian companies use AWS. High demand for certified professionals.', 
              priority: 'high',
              timeToLearn: '3-4 months',
              salaryImpact: '+₹3-5 LPA',
              learningPlatforms: [
                { name: 'AWS Training (Free)', url: 'https://aws.amazon.com/training/' },
                { name: 'Coursera', url: 'https://www.coursera.org/specializations/aws-cloud' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/aws-solutions-architect-training' },
                { name: 'Great Learning', url: 'https://www.greatlearning.in/aws-cloud-practitioner' }
              ]
            },
            { 
              name: 'Docker', 
              reason: 'Containerization is essential for modern development. 65% of Indian companies use Docker.', 
              priority: 'medium',
              timeToLearn: '1-2 months',
              salaryImpact: '+₹1.5-2.5 LPA',
              learningPlatforms: [
                { name: 'Docker Official (Free)', url: 'https://docs.docker.com/get-started/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/docker-kubernetes' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/docker-mastery/' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/docker-training-course' }
              ]
            }
          ]
        },
        {
          category: 'Data & AI',
          skills: [
            { 
              name: 'Machine Learning', 
              reason: 'AI/ML is booming in India. 85% of Indian tech companies are investing in AI/ML projects.', 
              priority: 'high',
              timeToLearn: '4-6 months',
              salaryImpact: '+₹4-6 LPA',
              learningPlatforms: [
                { name: 'NPTEL (Free)', url: 'https://nptel.ac.in/courses/106/105/106105183/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/machine-learning' },
                { name: 'edX', url: 'https://www.edx.org/learn/machine-learning' },
                { name: 'Great Learning', url: 'https://www.greatlearning.in/machine-learning-course' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/machine-learning-course' }
              ]
            },
            { 
              name: 'Data Science', 
              reason: 'High demand in Indian analytics companies. Every major Indian company has data science teams.', 
              priority: 'high',
              timeToLearn: '4-6 months',
              salaryImpact: '+₹3-5 LPA',
              learningPlatforms: [
                { name: 'NPTEL (Free)', url: 'https://nptel.ac.in/courses/106/105/106105183/' },
                { name: 'Coursera', url: 'https://www.coursera.org/specializations/jhu-data-science' },
                { name: 'edX', url: 'https://www.edx.org/learn/data-science' },
                { name: 'Great Learning', url: 'https://www.greatlearning.in/data-science-course' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/data-science-course' }
              ]
            }
          ]
        },
        {
          category: 'Database & Tools',
          skills: [
            { 
              name: 'SQL', 
              reason: 'Essential for data management. 95% of Indian companies require SQL skills for data analysis.', 
              priority: 'high',
              timeToLearn: '1-2 months',
              salaryImpact: '+₹1-2 LPA',
              learningPlatforms: [
                { name: 'freeCodeCamp (Free)', url: 'https://www.freecodecamp.org/learn/relational-database/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/sql-for-data-science' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/sql-for-data-analysis/' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/sql-training-course' }
              ]
            },
            { 
              name: 'Git & GitHub', 
              reason: 'Version control is mandatory for all development jobs. 100% of Indian tech companies use Git.', 
              priority: 'high',
              timeToLearn: '2-4 weeks',
              salaryImpact: '+₹0.5-1 LPA',
              learningPlatforms: [
                { name: 'GitHub (Free)', url: 'https://docs.github.com/en/get-started' },
                { name: 'freeCodeCamp (Free)', url: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/' },
                { name: 'Udemy', url: 'https://www.udemy.com/course/git-complete/' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/git-training-course' }
              ]
            }
          ]
        },
        {
          category: 'Soft Skills',
          skills: [
            { 
              name: 'Communication Skills', 
              reason: 'Critical for Indian IT sector. 90% of job interviews assess communication skills.', 
              priority: 'high',
              timeToLearn: 'Ongoing',
              salaryImpact: '+₹1-2 LPA',
              learningPlatforms: [
                { name: 'Coursera', url: 'https://www.coursera.org/learn/communication-skills' },
                { name: 'edX', url: 'https://www.edx.org/learn/communication' },
                { name: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning/topics/communication' },
                { name: 'Simplilearn', url: 'https://www.simplilearn.com/communication-skills-training' }
              ]
            },
            { 
              name: 'Problem Solving', 
              reason: 'Essential for technical interviews. 80% of Indian tech companies test problem-solving skills.', 
              priority: 'high',
              timeToLearn: 'Ongoing',
              salaryImpact: '+₹1-3 LPA',
              learningPlatforms: [
                { name: 'LeetCode (Free)', url: 'https://leetcode.com/' },
                { name: 'HackerRank (Free)', url: 'https://www.hackerrank.com/' },
                { name: 'GeeksforGeeks (Free)', url: 'https://www.geeksforgeeks.org/' },
                { name: 'Coursera', url: 'https://www.coursera.org/learn/problem-solving' }
              ]
            }
          ]
        }
      ],
      marketInsights: {
        topGrowingSkills: ['AI/ML', 'Cybersecurity', 'Cloud Native', 'Data Engineering', 'Full Stack Development'],
        salaryImpact: 'Skills in AI/ML can increase salary by 25-40% in Indian market',
        learningPath: 'Focus on emerging technologies for career growth in Indian tech sector',
        immediateActions: [
          'Start with Python or JavaScript as foundation',
          'Learn React.js for frontend development',
          'Get AWS certification for cloud skills',
          'Practice coding on LeetCode/HackerRank',
          'Build portfolio projects on GitHub'
        ]
      }
    };

    res.json({
      success: true,
      message: 'Skill suggestions generated successfully',
      data: skillSuggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate skill suggestions',
      details: error.message
    });
  }
});

// Get skill details by name (placed after specific routes to prevent shadowing)
router.get('/:skillName', (req, res) => {
  try {
    const { skillName } = req.params;
    const skill = skillsDatabase[skillName];
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        name: skillName,
        ...skill
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
// Also export the skills database for internal use (e.g., chatbot)
module.exports.skillsDatabase = skillsDatabase;
