const { Pool } = require('pg');
require('dotenv').config();

// Demo mode: Use in-memory storage when database is not available
const demoMode = !process.env.DB_HOST && process.env.VERCEL;
let demoStore = {
    users: [
        { id: 1, username: 'admin', email: 'admin@holyangels.com', password_hash: '$2a$10$example', role: 'incharge' },
        { id: 2, username: 'staff1', email: 'staff@holyangels.com', password_hash: '$2a$10$example', role: 'staff' }
    ],
    teachers: [],
    timetables: [],
    attendance: [],
    substitutions: [],
    notifications: []
};

let pool;

if (demoMode) {
    console.log('⚠️  Running in DEMO MODE - Database not configured');
    console.log('📝 To use real database, set DB_HOST environment variable');
    
    // Create a mock pool for demo mode
    pool = {
        query: async (sql, params) => {
            // Mock database responses for demo
            console.log('[DEMO]', sql);
            return { rows: [], rowCount: 0 };
        }
    };
} else {
    pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'teacher_substitution',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.DB_SSL === 'true' ? true : false
    });

    pool.on('connect', () => {
        console.log('✅ Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
        console.error('❌ Database error:', err);
    });
}

module.exports = pool;
module.exports.demoMode = demoMode;
module.exports.demoStore = demoStore;
