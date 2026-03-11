const express = require('express');
const router = express.Router();
const { skillsDatabase } = require('./skills');
const axios = require('axios');

// Together AI client (simple fetch wrapper)
const togetherApiKey = process.env.TOGETHER_API_KEY;
async function togetherChat(messages, options = {}) {
  if (!togetherApiKey) return null;
  const payload = {
    model: process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    messages,
    max_tokens: options.max_tokens || 300,
    temperature: options.temperature ?? 0.7
  };
  const resp = await axios.post('https://api.together.xyz/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${togetherApiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });
  return resp.data?.choices?.[0]?.message?.content?.trim();
}

// Chatbot responses database
const chatbotResponses = {
  greetings: [
    "Hello! I'm your AI career assistant. How can I help you today?",
    "Hi there! I'm here to help with your career development. What would you like to know?",
    "Welcome! I can assist you with resume analysis, job matching, and skill development."
  ],
  
  resume_help: [
    "To upload your resume:\n1. Go to the 'Resume Upload' page\n2. Click 'Choose File' and select your PDF resume\n3. Click 'Upload & Analyze'\n4. Wait for the analysis to complete\n\nYour resume will be analyzed for skills, experience level, and job matches. The results will be available across all tabs!",
    "Uploading a resume is easy! Just visit the Resume Upload page, select your PDF file, and click analyze. The system will extract your skills and match you with relevant jobs."
  ],
  
  job_matching: [
    "To find matching jobs:\n1. Upload your resume first (if not done already)\n2. Go to the 'Job Matching' page\n3. View personalized job recommendations based on your skills\n4. Use filters to narrow down results\n5. Click 'Apply' to go to the job application page\n\nJobs are ranked by match score - higher scores mean better fits!",
    "Job matching works best when you upload your resume first. The system analyzes your skills and experience to find the most relevant opportunities for you."
  ],
  
  skill_suggestions: [
    "For skill suggestions:\n1. Upload your resume to get personalized recommendations\n2. Go to 'Skill Suggestions' page\n3. View skill gaps and upgrade recommendations\n4. Track your progress for each skill using the progress bars\n5. Add new skills to track manually\n6. Click learning platform links to start learning\n\nFocus on high-priority skills first for maximum impact!",
    "Skill suggestions are personalized based on your resume analysis. You can track your progress and find learning resources for each recommended skill."
  ],
  
  market_insights: [
    "To view market insights:\n1. Go to 'Market Insights' page\n2. View general market trends and salary data\n3. If you've uploaded a resume, see personalized market demand for your skills\n4. Check which skills are in high demand\n5. Use this data to prioritize your skill development\n\nMarket insights help you make informed career decisions!",
    "Market insights show you current industry trends, salary data, and demand for specific skills. This helps you make informed decisions about your career development."
  ],
  
  progress_tracking: [
    "To track skill progress:\n1. Go to 'Skill Suggestions' page\n2. Find the 'Skill Progress Tracking' section\n3. Use + and - buttons to update your progress\n4. Add new skills to track using the input field\n5. Progress is automatically saved and persists across sessions\n6. Completed skills show a green checkmark\n\nTrack your progress to stay motivated and see your growth!",
    "Progress tracking helps you stay motivated and see your skill development over time. You can manually update your progress and add new skills to track."
  ],
  
  general_help: [
    "I can help you with:\n\n📄 **Resume Analysis**: Upload and analyze your resume for skills and experience\n💼 **Job Matching**: Find jobs that match your profile\n🎯 **Skill Suggestions**: Get personalized skill recommendations\n📊 **Market Insights**: View industry trends and demand\n📈 **Progress Tracking**: Monitor your skill development\n\nTry asking about any of these features or use the quick reply buttons below!",
    "I'm your AI career assistant! I can help with resume analysis, job matching, skill suggestions, market insights, and progress tracking. What would you like to know?"
  ]
};

// Utility: craft skill explanation
function explainSkill(skillName) {
  const skill = skillsDatabase && skillsDatabase[skillName];
  if (!skill) return null;
  const lines = [];
  lines.push(`Skill: ${skillName}`);
  if (skill.category) lines.push(`Category: ${skill.category}`);
  if (typeof skill.demand === 'number') lines.push(`Market demand: ${skill.demand}/100`);
  if (Array.isArray(skill.relatedSkills) && skill.relatedSkills.length) {
    lines.push(`Related skills: ${skill.relatedSkills.join(', ')}`);
  }
  if (typeof skill.avgSalary === 'number') lines.push(`Avg salary (India): ₹${skill.avgSalary.toLocaleString('en-IN')}`);
  if (typeof skill.jobCount === 'number') lines.push(`Approx job count: ${skill.jobCount.toLocaleString('en-IN')}`);
  lines.push('Where it is used:');
  const usage = {
    'Frontend': 'Building user interfaces and SPAs for web/mobile.',
    'Backend': 'APIs, services, and business logic on the server.',
    'AI/ML': 'Data analysis, modeling, and intelligent applications.',
    'Analytics': 'Insights, dashboards, and data-driven decisions.',
    'Cloud': 'Infrastructure, deployments, scalability and reliability.',
    'Security': 'Protecting systems, data, and networks from threats.',
    'Infrastructure': 'Automation, CI/CD, and system reliability.',
  };
  lines.push(`- ${usage[skill.category] || 'Various real-world projects across domains.'}`);
  return lines.join('\n');
}

// Get chatbot response
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = message.toLowerCase();
    let response = '';
    let usedAI = false;

    // Try Together AI first if configured
    if (togetherApiKey) {
      try {
        const sys = `You are a daily life assistant AI who is friendly and helpful.`;
        const content = await togetherChat([
          { role: 'system', content: sys },
          { role: 'user', content: message }
        ], { max_tokens: 300, temperature: 0.7 });
        if (content) {
          response = content;
          usedAI = true;
        }
      } catch (e) {
        console.error('Together AI error:', e.message);
      }
    }

    // If AI not used or returned nothing, fallback to intents + canned responses
    if (!response) {
      let responseType = 'general';
      if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
        responseType = 'greetings';
      } else if (userMessage.includes('upload') || userMessage.includes('resume')) {
        responseType = 'resume_help';
      } else if (userMessage.includes('job') || userMessage.includes('match') || userMessage.includes('find')) {
        responseType = 'job_matching';
      } else if (userMessage.includes('skill') || userMessage.includes('suggestion')) {
        responseType = 'skill_suggestions';
      } else if (userMessage.includes('market') || userMessage.includes('trend')) {
        responseType = 'market_insights';
      } else if (userMessage.includes('progress') || userMessage.includes('track')) {
        responseType = 'progress_tracking';
      } else if (userMessage.includes('help')) {
        responseType = 'general_help';
      }

      // Skill explanation intent
      const skillMatch = userMessage.match(/explain\s+([a-zA-Z\-\.\s\+\#]+)/) || userMessage.match(/what\s+is\s+([a-zA-Z\-\.\s\+\#]+)/);
      if (skillMatch && skillMatch[1]) {
        const maybeSkill = skillMatch[1].trim().replace(/\?$/, '');
        const candidates = Object.keys(skillsDatabase || {});
        const found = candidates.find(s => s.toLowerCase() === maybeSkill.toLowerCase());
        const explanation = explainSkill(found || maybeSkill);
        if (explanation) {
          response = explanation + '\n\nTip: Ask me for learning resources for this skill.';
        }
      }

      // Learning resources intent
      if (!response && (userMessage.includes('learn') || userMessage.includes('resource'))) {
        const candidates = Object.keys(skillsDatabase || {});
        const found = candidates.find(s => userMessage.includes(s.toLowerCase()));
        if (found) {
          response = `Learning resources for ${found} (popular platforms):\n- NPTEL / SWAYAM (Free)\n- Coursera\n- Udemy\n- Great Learning\n- freeCodeCamp (for web)\n\nSearch tip: Use our Search Web with keywords "${found}" to find roles requiring it.`;
        }
      }

      if (!response) {
        const responses = chatbotResponses[responseType] || chatbotResponses.general_help;
        response = responses[Math.floor(Math.random() * responses.length)];
      }
    }

    res.json({
      success: true,
      response,
      ai: usedAI,
      model: usedAI ? (process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo') : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Internal server error',
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    });
  }
});

// Get quick reply suggestions
router.get('/quick-replies', (req, res) => {
  try {
    const quickReplies = [
      { text: "How to upload resume?", icon: "FileText" },
      { text: "Find matching jobs", icon: "Briefcase" },
      { text: "Skill suggestions", icon: "Target" },
      { text: "Market trends", icon: "TrendingUp" },
      { text: "Track skill progress", icon: "Target" }
    ];

    res.json({
      success: true,
      quickReplies
    });
  } catch (error) {
    console.error('Quick replies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
 
// Streaming AI responses via SSE
router.post('/stream', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!togetherApiKey) {
      return res.status(400).json({ error: 'AI is not configured' });
    }

    const model = process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-AI-Model', model);

    // Send meta first
    res.write(`event: meta\n`);
    res.write(`data: ${JSON.stringify({ model })}\n\n`);

    const payload = {
      model,
      messages: [
        { role: 'system', content: 'You are a daily life assistant AI who is friendly and helpful.' },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
      stream: true
    };

    const upstream = await axios.post('https://api.together.xyz/v1/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream',
      timeout: 0
    });

    let buffer = '';
    upstream.data.on('data', (chunk) => {
      try {
        buffer += chunk.toString();
        const parts = buffer.split(/\n\n/);
        buffer = parts.pop() || '';
        for (const part of parts) {
          const lines = part.split(/\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const json = trimmed.replace(/^data:\s*/, '');
            if (!json || json === '[DONE]') continue;
            try {
              const payload = JSON.parse(json);
              const delta = payload?.choices?.[0]?.delta?.content || payload?.choices?.[0]?.message?.content || '';
              if (delta) {
                res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
              }
            } catch (_) {
              // ignore parse errors on keep-alives
            }
          }
        }
      } catch (err) {
        console.error('Stream parse error:', err.message);
      }
    });

    upstream.data.on('end', () => {
      res.write('event: end\n');
      res.write('data: END\n\n');
      res.end();
    });

    upstream.data.on('error', (err) => {
      console.error('Upstream stream error:', err.message);
      try {
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
      } finally {
        res.end();
      }
    });
  } catch (error) {
    console.error('Streaming endpoint error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      try {
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify({ error: 'internal_error' })}\n\n`);
      } finally {
        res.end();
      }
    }
  }
});
