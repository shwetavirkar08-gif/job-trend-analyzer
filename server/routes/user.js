const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { authRequired } = require('../middleware/auth');
const { ObjectId } = require('mongodb');

function userProjection() {
  return { passwordHash: 0 };
}

// Get full user profile with analytics
router.get('/me', authRequired, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) }, { projection: userProjection() });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: serializeUser(user) });
  } catch (e) {
    console.error('Get profile error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Save resume analysis snapshot
router.put('/resume', authRequired, async (req, res) => {
  try {
    const { resumeAnalysis } = req.body || {};
    if (!resumeAnalysis) return res.status(400).json({ success: false, error: 'resumeAnalysis is required' });
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { resumeAnalysis, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Save resume error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update skill progress
router.put('/skill-progress', authRequired, async (req, res) => {
  try {
    const { skillName, progress } = req.body || {};
    if (!skillName || typeof progress !== 'number') return res.status(400).json({ success: false, error: 'skillName and numeric progress are required' });
    const db = getDb();
    const path = `skillProgress.${sanitizeKey(skillName)}`;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { [path]: Math.max(0, Math.min(100, progress)), updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Skill progress error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Append AI interview result
router.post('/interview-results', authRequired, async (req, res) => {
  try {
    const { score, total, responses } = req.body || {};
    if (typeof score !== 'number' || typeof total !== 'number') return res.status(400).json({ success: false, error: 'score and total are required' });
    const result = { score, total, responses: Array.isArray(responses) ? responses : [], createdAt: new Date() };
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $push: { interviewResults: result }, $set: { updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Interview result error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Append Aptitude result
router.post('/aptitude-results', authRequired, async (req, res) => {
  try {
    const { score, total, answers } = req.body || {};
    if (typeof score !== 'number' || typeof total !== 'number') return res.status(400).json({ success: false, error: 'score and total are required' });
    const result = { score, total, answers: Array.isArray(answers) ? answers : [], createdAt: new Date() };
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $push: { aptitudeResults: result }, $set: { updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Aptitude result error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Mark a LeetCode problem as solved
router.post('/leetcode/solved', authRequired, async (req, res) => {
  try {
    const { id, title, url, difficulty, tags, companies } = req.body || {};
    if (!id || !title || !url) return res.status(400).json({ success: false, error: 'id, title, url are required' });
    const record = { id, title, url, difficulty, tags: tags || [], companies: companies || [], solvedAt: new Date() };
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $addToSet: { leetcodeSolved: record }, $set: { updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) {
    console.error('LeetCode solved add error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Unmark solved
router.delete('/leetcode/solved/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $pull: { leetcodeSolved: { id } }, $set: { updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) {
    console.error('LeetCode solved remove error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

function sanitizeKey(key) {
  return key.replace(/\./g, '_');
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    resumeAnalysis: user.resumeAnalysis || null,
    skillProgress: user.skillProgress || {},
    interviewResults: user.interviewResults || [],
    aptitudeResults: user.aptitudeResults || [],
    leetcodeSolved: user.leetcodeSolved || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = router;


