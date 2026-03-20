// Quick setup script to create default users with proper passwords
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

async function setup() {
    try {
        console.log('Setting up default users...');
        
        // Default password for both users: password123
        const defaultPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(defaultPassword, salt);
        
        // Check if users already exist
        const existingAdmin = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
        
        if (existingAdmin.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@school.com', passwordHash, 'incharge']
            );
            console.log('✅ Admin user created (username: admin, password: password123)');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
        
        const existingStaff = await pool.query('SELECT * FROM users WHERE username = $1', ['staff1']);
        
        if (existingStaff.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['staff1', 'staff1@school.com', passwordHash, 'staff']
            );
            console.log('✅ Staff user created (username: staff1, password: password123)');
        } else {
            console.log('ℹ️ Staff user already exists');
        }
        
        console.log('\n✅ Setup complete!');
        console.log('\nDefault credentials:');
        console.log('  Incharge: admin / password123');
        console.log('  Staff: staff1 / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup error:', error);
        process.exit(1);
    }
}

setup();