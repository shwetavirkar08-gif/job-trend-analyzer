const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: '/',
  });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }
    const db = getDb();
    const users = db.collection('users');
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { insertedId } = await users.insertOne(user);
    const token = jwt.sign({ uid: insertedId.toString(), email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
    setAuthCookie(res, token);
    res.json({ success: true, token, user: { id: insertedId.toString(), name: user.name, email: user.email } });
  } catch (e) {
    console.error('Signup error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign({ uid: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
    setAuthCookie(res, token);
    res.json({ success: true, token, user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('auth_token', { path: '/' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const db = getDb();
      const user = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(payload.uid) }, { projection: { passwordHash: 0 } });
      if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      res.json({ success: true, user: { id: user._id.toString(), name: user.name, email: user.email } });
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;


