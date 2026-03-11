const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { connectToDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://job-trend-analyzer-web.onrender.com', 'https://job-trend-analyzer.onrender.com']
    : 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/interviewer', require('./routes/interviewer'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/aptitude', require('./routes/aptitude'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler (only for API routes in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      console.log('🗄️ Database connected');
    } else {
      console.warn('⚠️ MONGODB_URI not set. Starting server without database. Routes requiring DB will fail.');
    }
  } catch (e) {
    console.error('⚠️ Database connection failed. Continuing without DB. Error:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Job Trend Analyzer API ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();
