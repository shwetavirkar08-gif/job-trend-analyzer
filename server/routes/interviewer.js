const express = require('express');
const router = express.Router();
const axios = require('axios');

// Providers for interviewer (separate from chatbot):
// 1) OpenAI (preferred if OPENAI_API_KEY is set)
// 2) OpenRouter (fallback if OPENROUTER_API_KEY is set)

// OpenAI
const openaiApiKey = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function openaiChat(messages, options = {}) {
  if (!openaiApiKey) return null;
  const payload = {
    model: OPENAI_MODEL,
    messages,
    max_tokens: options.max_tokens || 320,
    temperature: options.temperature ?? 0.6
  };
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });
  return resp.data?.choices?.[0]?.message?.content?.trim();
}

// OpenRouter (fallback)
// Docs: https://openrouter.ai/docs
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct';

async function openrouterChat(messages, options = {}) {
  if (!openrouterApiKey) return null;
  const payload = {
    model: OPENROUTER_MODEL,
    messages,
    max_tokens: options.max_tokens || 300,
    temperature: options.temperature ?? 0.7
  };
  const resp = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${openrouterApiKey}`,
      'Content-Type': 'application/json',
      // Optional headers per OpenRouter best practices
      'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'http://localhost',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'Vedika Interviewer'
    },
    timeout: 20000
  });
  return resp.data?.choices?.[0]?.message?.content?.trim();
}

// Single message endpoint compatible with client expectations
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let response = '';
    let usedAI = false;
    let modelName = null;

    // Prefer OpenAI first
    if (openaiApiKey) {
      try {
        const sys = 'You are a rigorous, fair technical interviewer. Ask one question at a time, be concise. For skills-test style, prefer objective checks.';
        const content = await openaiChat([
          { role: 'system', content: sys },
          { role: 'user', content: message }
        ], { max_tokens: 320, temperature: 0.6 });
        if (content) {
          response = content;
          usedAI = true;
          modelName = OPENAI_MODEL;
        }
      } catch (e) {
        console.error('OpenAI error:', e.message);
      }
    }

    // If OpenAI not available/successful, try OpenRouter
    if (!response && openrouterApiKey) {
      try {
        const sys = 'You are a rigorous, fair technical interviewer. Ask one question at a time, be concise. For skills-test style, prefer objective checks.';
        const content = await openrouterChat([
          { role: 'system', content: sys },
          { role: 'user', content: message }
        ], { max_tokens: 320, temperature: 0.6 });
        if (content) {
          response = content;
          usedAI = true;
          modelName = OPENROUTER_MODEL;
        }
      } catch (e) {
        console.error('OpenRouter error:', e.message);
      }
    }

    // If AI unavailable, return empty response so client falls back to deterministic bank
    return res.json({
      success: true,
      response: response || '',
      ai: usedAI,
      model: usedAI ? modelName : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Interviewer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


