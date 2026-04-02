const express = require('express');
const cors = require('cors');
require('dotenv').config();
const serverless = require('serverless-http');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (optional on Vercel if env not set)
const db = require('../config/database');

// Status check
app.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    mode: process.env.VERCEL ? 'production' : 'development',
    demoMode: db.demoMode || false
  });
});

if (process.env.DB_HOST && !db.demoMode) {
  db.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ Database connected successfully');
    }
  });
}

// API routes (mounted without /api prefix, since Vercel maps /api/* to this function)
app.use('/auth', require('../routes/auth'));
app.use('/teachers', require('../routes/teachers'));
app.use('/timetables', require('../routes/timetables'));
app.use('/attendance', require('../routes/attendance'));
app.use('/substitutions', require('../routes/substitutions'));
app.use('/dashboard', require('../routes/dashboard'));
app.use('/notifications', require('../routes/notifications'));
app.use('/config', require('../routes/config'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serverless API is running' });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

module.exports = serverless(app);
