#!/usr/bin/env node

/**
 * 🚀 Automatic Vercel Environment Setup
 * This script adds environment variables to your Vercel project
 * Requires: Vercel CLI installed and authenticated
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('\n🚀 Vercel Environment Variables Setup\n');
    console.log('=' .repeat(60));
    
    // Check if Vercel CLI is installed
    try {
        execSync('vercel --version', { stdio: 'ignore' });
    } catch (e) {
        console.log('\n❌ Vercel CLI not found!');
        console.log('\n📝 Install it first:');
        console.log('   npm install -g vercel\n');
        process.exit(1);
    }

    console.log('\n📋 Enter your Neon database credentials:\n');

    const dbHost = await question('Database Host (e.g., ep-xxx.neon.tech): ');
    const dbPort = await question('Database Port (default 5432): ') || '5432';
    const dbName = await question('Database Name (default: neondb): ') || 'neondb';
    const dbUser = await question('Database User (default: neondb_owner): ') || 'neondb_owner';
    const dbPassword = await question('Database Password: ');
    
    console.log('\n⏳ Adding environment variables to Vercel...\n');
    
    const vars = {
        'DB_HOST': dbHost,
        'DB_PORT': dbPort,
        'DB_NAME': dbName,
        'DB_USER': dbUser,
        'DB_PASSWORD': dbPassword,
        'NODE_ENV': 'production',
        'JWT_SECRET': 'f163975f7c0eebf75d176b8bfc65c73eb864ecc95927eab21646607cb4b68f27'
    };

    let successCount = 0;
    let failCount = 0;

    for (const [key, value] of Object.entries(vars)) {
        try {
            console.log(`  ⏳ Setting ${key}...`);
            execSync(`vercel env add ${key} ${value}`, { stdio: 'ignore' });
            console.log(`  ✅ ${key} added`);
            successCount++;
        } catch (e) {
            console.log(`  ❌ ${key} failed`);
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ ${successCount} variables added, ${failCount} failed\n`);

    if (failCount === 0) {
        console.log('🎉 All environment variables set!\n');
        console.log('📝 Next step: Redeploy your project\n');
        console.log('Command: vercel --prod\n');
    }

    rl.close();
}

setup().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
