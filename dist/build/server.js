const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = require('./config/database');

// Test database connection
db.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/timetables', require('./routes/timetables'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/substitutions', require('./routes/substitutions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/config', require('./routes/config'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server - listens on all network interfaces (0.0.0.0)
// Access via: http://localhost:3000 or http://your-ip:3000 or http://your-domain.com:3000
app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    // Find local IP address
    for (const interfaceName in networkInterfaces) {
        for (const interface of networkInterfaces[interfaceName]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                localIP = interface.address;
                break;
            }
        }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 Holy Angels Substitution Server Started Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📱 Access your application via:');
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${localIP}:${PORT}`);
    console.log(`   API:      http://${localIP}:${PORT}/api\n`);
    console.log('🌐 Server is accessible on all network interfaces (0.0.0.0)');
    console.log('💡 Use the Network URL to access from other devices\n');
    console.log('📝 Make sure PostgreSQL is running and database is created!');
    console.log('═══════════════════════════════════════════════════════════\n');
});
