const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection without specifying database
const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'inba@2009',
});

async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database...');
        
        // Create database
        console.log('📦 Creating database...');
        await adminPool.query('CREATE DATABASE teacher_substitution;').catch(err => {
            if (err.code === '42P04') { // Database already exists
                console.log('ℹ️ Database already exists');
            } else {
                throw err;
            }
        });
        
        console.log('✅ Database created successfully');
        
        // Close admin pool and connect to the new database
        await adminPool.end();
        
        // Connect to the new database
        const dbPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'teacher_substitution',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'inba@2009',
        });
        
        // Read and execute schema
        console.log('📋 Creating tables...');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await dbPool.query(schema);
        console.log('✅ Tables created successfully');
        
        // Read and execute seed data
        console.log('🌱 Seeding data...');
        const seedPath = path.join(__dirname, 'database', 'seed.sql');
        const seedData = fs.readFileSync(seedPath, 'utf8');
        
        await dbPool.query(seedData);
        console.log('✅ Data seeded successfully');
        
        console.log('\n✅ Database initialization complete!');
        console.log('🚀 You can now run: npm start or node server.js');
        
        await dbPool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

initializeDatabase();
