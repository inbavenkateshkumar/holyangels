const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = require('./config/database');

if (!process.env.VERCEL || process.env.DB_HOST) {
    db.query('SELECT NOW()', (err, result) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
        } else {
            console.log('✅ Database connected successfully');
        }
    });
} else {
    console.log('ℹ️ Skipping DB connectivity test on Vercel (no DB env configured)');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/timetables', require('./routes/timetables'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/substitutions', require('./routes/substitutions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/config', require('./routes/config'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

const serverless = require('serverless-http');
if (process.env.VERCEL) {
    module.exports = serverless(app);
} else {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
