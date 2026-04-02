#!/usr/bin/env node

/**
 * ✅ Vercel Deployment Setup Helper
 * Generates JWT secret and validates configuration
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('\n🚀 Vercel Setup Helper\n');
console.log('=' .repeat(50));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ Generated JWT Secret:');
console.log(`   ${jwtSecret}`);
console.log('\n📝 Store this in Vercel → Settings → Environment Variables');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('\n✅ .env file exists');
} else {
    console.log('\n⚠️  No .env file found. Creating from template...');
    const exampleEnv = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    fs.writeFileSync(envPath, exampleEnv);
    console.log('   ✅ .env created from .env.example');
    console.log('   📝 Edit .env with your database credentials');
}

// Check required dependencies
console.log('\n📦 Checking dependencies...');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const required = ['express', 'pg', 'jsonwebtoken', 'dotenv', 'cors', 'serverless-http'];
const missing = required.filter(dep => !pkg.dependencies[dep]);

if (missing.length === 0) {
    console.log('   ✅ All dependencies present');
} else {
    console.log(`   ⚠️  Missing: ${missing.join(', ')}`);
    console.log('   Run: npm install');
}

// Provide next steps
console.log('\n' + '='.repeat(50));
console.log('\n📋 Next Steps:\n');
console.log('1️⃣  Create PostgreSQL database:');
console.log('    → Go to https://neon.tech (free tier)');
console.log('    → Create project, copy credentials\n');

console.log('2️⃣  Add environment variables to Vercel:');
console.log('    → Project Settings → Environment Variables');
console.log('    → Add: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
console.log('    → Add: NODE_ENV=production');
console.log('    → Add: JWT_SECRET= ' + jwtSecret + '\n');

console.log('3️⃣  Redeploy:');
console.log('    → Deployments → Latest → Redeploy\n');

console.log('4️⃣  Test: Visit your Vercel URL');
console.log('    Login with: admin / password123\n');

console.log('✅ Setup helper complete!\n');
