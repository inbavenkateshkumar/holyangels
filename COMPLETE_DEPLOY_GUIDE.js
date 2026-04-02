#!/usr/bin/env node

/**
 * 🚀 Complete Vercel + Neon Setup Guide
 * This will get you deployed in 10 minutes
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║       🚀 COMPLETE DEPLOYMENT SETUP - 10 MINUTES MAX            ║
╚════════════════════════════════════════════════════════════════╝

📋 CHECKLIST:
  [ ] Step 1: Get Neon Database Credentials (2 min)
  [ ] Step 2: Add Environment Variables to Vercel (3 min)
  [ ] Step 3: Redeploy on Vercel (2 min)
  [ ] Step 4: Test Login Page (1 min)
  [ ] Step 5: Create Default Admin User (2 min)

════════════════════════════════════════════════════════════════

🔧 STEP 1: Create FREE Neon Database (2 minutes)

1. Visit: https://neon.tech
2. Click "Sign Up" (use GitHub or email)
3. Confirm email
4. Click "Create project" → Name: "holy-angels"
5. Create database (leave defaults)
6. You'll see a screen like:

   ┌─────────────────────────────────────┐
   │ Connection String                   │
   │ postgresql://user:password@         │
   │ host.neon.tech/database             │
   └─────────────────────────────────────┘

🔑 EXTRACT THESE VALUES:
   - Host: xxx.neon.tech (between @ and /)
   - User: neondb_owner (between :// and :)
   - Password: (between last : and @)
   - Database: neondb (at the end)
   - Port: 5432 (always this)

SAVE THESE! You'll need them next.

════════════════════════════════════════════════════════════════

🌐 STEP 2: Add to Vercel (3 minutes)

1. Go to: https://vercel.com/dashboard
2. Click: aihamss-tee2 project
3. Click: Settings → Environment Variables
4. Click "Add New" and enter EXACTLY:

  KEY              │ VALUE (from Neon above)
  ─────────────────┼──────────────────────────
  DB_HOST          │ xxx.neon.tech
  DB_PORT          │ 5432
  DB_NAME          │ neondb
  DB_USER          │ neondb_owner
  DB_PASSWORD      │ your_password_from_neon
  NODE_ENV         │ production
  JWT_SECRET       │ f163975f7c0eebf75d176b...

5. CLICK "SAVE" after each one!

❌ COMMON MISTAKES:
   - Forgetting to click SAVE
   - Extra spaces in values
   - Wrong copy-paste value

════════════════════════════════════════════════════════════════

🚀 STEP 3: Redeploy (2 minutes)

1. Still in Vercel dashboard
2. Click: "Deployments" tab
3. Find latest deployment (status might say "Error")
4. Click "..." menu → "Redeploy"
5. Wait for ✅ "Ready" status
6. When ready, click your domain to visit

════════════════════════════════════════════════════════════════

✅ STEP 4: Test (1 minute)

Visit your deployed app URL
Should show: 🔐 Login Page

If BLANK/ERROR:
   → Check Vercel Logs: Click deployment → Logs tab
   → Check if all 7 env vars are set

════════════════════════════════════════════════════════════════

👤 STEP 5: Create Admin User (2 minutes)

The default admin account may not exist. Run this:

  curl -X POST https://YOUR_URL/api/auth/register \\
    -H "Content-Type: application/json" \\
    -d '{
      "username": "admin",
      "email": "admin@holyangels.com",
      "password": "password123",
      "role": "incharge"
    }'

Replace YOUR_URL with your actual Vercel URL

✅ Then login with: admin / password123

════════════════════════════════════════════════════════════════

🆘 TROUBLESHOOTING

Problem: Still "loading..." or blank page
Solution:
  1. Check Vercel Logs for errors
  2. Verify all database env vars are CORRECT
  3. Do a hard refresh: Ctrl+Shift+Delete then reload

Problem: "Cannot connect to database"
Solution:
  1. DB_HOST might be wrong - check exact value from Neon
  2. Make sure Neon IP whitelist includes "0.0.0.0/0" (free tier auto-allows)

Problem: Login doesn't work
Solution:
  1. Run Step 5 (create admin user)
  2. Check server logs in Vercel Deployments

════════════════════════════════════════════════════════════════

📞 STILL STUCK?

Send me:
1. Your Vercel project URL
2. Any error messages from Vercel Logs
3. Your environment variable list (without passwords!)

════════════════════════════════════════════════════════════════
`);
