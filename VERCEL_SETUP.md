# ✅ Vercel Deployment Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Free PostgreSQL Database

**Option A: Neon (Recommended - Easiest)**
1. Go to https://neon.tech
2. Click "Sign Up" (free tier)
3. Create project → name: `holy-angels-db`
4. Copy these values:
   - **Host**: `xxx.neon.tech`
   - **Database**: `neondb` 
   - **User**: `neondb_owner`
   - **Password**: (save from email)

**Option B: Render.com**
1. Go to https://render.com
2. Create PostgreSQL database
3. Copy connection string credentials

---

### Step 2: Initialize Database Locally

Run this command (replace with your credentials):
```bash
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB_NAME -f database/schema.sql
```

When prompted for password, paste your database password.

---

### Step 3: Add Environment Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Click on project: **aihamss-tee2**
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

```
NODE_ENV          = production
JWT_SECRET        = use_a_random_long_string_here_12345678901234567890
DB_HOST           = (from Neon/Render)
DB_PORT           = 5432
DB_NAME           = (from Neon/Render)
DB_USER           = (from Neon/Render)
DB_PASSWORD       = (from Neon/Render)
```

5. Click **Save** for each one

---

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click latest deployment
3. Click **"Redeploy"**
4. Wait for ✅ "Ready"

---

### Step 5: Test It

Once deployed, visit your URL and you should see the login page!

Default credentials:
- Username: `admin`
- Password: `password123`

---

## 🐛 Troubleshooting

**"Database connection failed"**
- Check environment variables are correct
- Verify database is running
- Check IP whitelist (Neon: allow all IPs on free tier)

**"Page not loading"**
- Check redeploy completed successfully
- Clear browser cache (Ctrl+Shift+Delete)
- Check Vercel logs for errors

**"Cannot read property of undefined"**
- Verify all 7 environment variables are set
- No extra spaces in variable values

---

## ✅ Deployment Checklist

- [ ] Database created and running
- [ ] Schema initialized (tables created)
- [ ] 7 Environment variables added to Vercel
- [ ] Project redeployed
- [ ] Can access URL without errors
- [ ] Can login with admin/password123

**Ready to deploy? Gather your database info and follow Step 3 above!**
