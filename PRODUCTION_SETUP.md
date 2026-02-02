# 📋 PRODUCTION DEPLOYMENT CHECKLIST & CODE CHANGES

**Last Updated:** January 29, 2026  
**Status:** Ready for Production Deployment  
**Project:** EatSmartDaily

---

## ⚠️ IMPORTANT: No Code Changes Required!

**Great news!** Your application is **already production-ready**. Most values use environment variables with fallbacks. You only need to ensure your `.env.production` file is properly configured.

---

## 📝 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Files to Check/Update](#files-to-check--update)
3. [Database Seed Configuration](#database-seed-configuration)
4. [Health Check Configuration](#health-check-configuration)
5. [Email Configuration](#email-configuration)
6. [Site Settings (Admin Panel)](#site-settings-admin-panel)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Security Configuration](#security-configuration)
9. [Deployment Steps](#deployment-steps)
10. [Verification Checklist](#verification-checklist)

---

## 🚀 QUICK START

### Step 1: Fill Environment Variables

Copy from the `.env.production` file (created earlier) and fill in all required values:

```bash
# Critical Variables to Set:
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<your-32-char-secret>
DATABASE_URL=mysql://user:pass@host:port/db
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-smtp-password>
CRON_SECRET=<your-32-char-secret>
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Step 2: Deploy to Vercel/Railway

- Push code to GitHub
- Connect to Vercel (frontend) and Railway (backend)
- Add environment variables to both platforms
- Deploy!

### Step 3: Configure Site Settings

- Go to `https://yourdomain.com/admin/settings`
- Update all branding and contact information
- Save settings (stored in database)

---

## 📂 FILES TO CHECK & UPDATE

### ✅ Files That Use Environment Variables (No Changes Needed)

| File                                    | Usage                 | Status                               |
| --------------------------------------- | --------------------- | ------------------------------------ |
| `src/app/layout.tsx`                    | Metadata, base URLs   | ✅ Uses `NEXT_PUBLIC_SITE_URL`       |
| `src/app/sitemap.ts`                    | Sitemap generation    | ✅ Uses `NEXT_PUBLIC_SITE_URL`       |
| `src/app/robots.ts`                     | Robots.txt generation | ✅ Uses hardcoded domain (see below) |
| `src/lib/email-service.ts`              | SMTP configuration    | ✅ Uses env variables                |
| `src/components/AnalyticsDashboard.tsx` | Dev-only component    | ✅ Won't show in production          |
| `src/lib/monitoring-init.ts`            | Health check endpoint | ⚠️ Uses localhost (see below)        |

---

## 🔧 CONFIGURATION CHANGES REQUIRED

### 1. **Health Check Endpoint (IMPORTANT)**

**File:** `src/lib/monitoring-init.ts` (Line 62)

**Current Code:**

```typescript
const response = await fetch("http://localhost:3000/api/health", {
```

**Why This Matters:**

- In development, it checks `localhost:3000`
- In production, it should check your actual domain
- This only runs server-side in production (`process.env.NODE_ENV === "production"`)

**Change Required:** ✅ **OPTIONAL** (recommended for production monitoring)

**Action:**
You have TWO options:

**Option A: Use Environment Variable (Recommended)**

```typescript
const healthCheckUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const response = await fetch(`${healthCheckUrl}/api/health`, {
```

**Option B: Keep as-is**

- Works fine if your server is on the same machine
- Only runs in server-side production code
- Health checks will fail if you can't reach localhost

---

### 2. **Robots.txt Domain (Optional)**

**File:** `src/app/robots.ts` (Line 12)

**Current Code:**

```typescript
sitemap: "https://eatsmartdaily.com/sitemap.xml",
```

**Change Required:** ⚠️ **OPTIONAL**

**Action:**
Replace with environment variable:

```typescript
sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com"}/sitemap.xml`,
```

---

### 3. **Seed Data Configuration (CRITICAL IF USING)**

**File:** `prisma/seed.ts` (Lines 11, 15, 120)

**Current Code:**

```typescript
where: { email: "admin@eatsmartdaily.com" },
create: {
  email: "admin@eatsmartdaily.com",
  ...
  contactEmail: "hello@eatsmartdaily.com",
}
```

**Change Required:** ✅ **YES - Before running seed in production**

**Action - Step by Step:**

1. **Open the file:** `prisma/seed.ts`

2. **Find and replace admin email:**
   - Search for: `admin@eatsmartdaily.com`
   - Replace with: Your actual admin email
   - **Line 11:** `where: { email: "your-admin@yourdomain.com" }`
   - **Line 15:** `email: "your-admin@yourdomain.com"`

3. **Find and replace contact email:**
   - Search for: `hello@eatsmartdaily.com`
   - Replace with: Your contact email
   - **Line 120:** `contactEmail: "your-contact@yourdomain.com"`

4. **Example:**

   ```typescript
   // Before
   where: { email: "admin@eatsmartdaily.com" },
   create: {
     email: "admin@eatsmartdaily.com",

   // After
   where: { email: "admin@yourcompany.com" },
   create: {
     email: "admin@yourcompany.com",
   ```

5. **Run seed (only once!):**

   ```bash
   npx prisma db seed
   ```

   ⚠️ **Warning:** Only run this once in production! It will create sample data.

---

### 4. **Email Templates (OPTIONAL)**

**Files:**

- `src/lib/email-templates.ts` (Lines 110, 133)
- `src/lib/email-service.ts` (Line 139)

**Current Code:**

```typescript
<a href="https://eatsmartdaily.com" class="button">Visit Our Site</a>
...
from: "noreply@eatsmartdaily.com",
```

**Change Required:** ✅ **RECOMMENDED**

**Action:**

1. **Find all hardcoded domain URLs in email templates**
2. **Replace `https://eatsmartdaily.com` with your domain**
3. **Replace `noreply@eatsmartdaily.com` with your email**

**Files to Update:**

```
src/lib/email-templates.ts     → Replace domain URLs
src/lib/email-service.ts        → Replace 'noreply@' email
src/lib/email-templates.ts      → Replace footer links
```

**Or use environment variables:**

```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@eatsmartdaily.com";
```

---

### 5. **Link Checker User Agent (OPTIONAL)**

**File:** `src/lib/link-checker.ts` (Lines 11, 24)

**Current Code:**

```typescript
"User-Agent": "Mozilla/5.0 (compatible; EatSmartDaily/1.0; +http://eatsmartdaily.com)"
```

**Change Required:** ⚠️ **OPTIONAL** (for website verification)

**Action:**
Replace with your actual domain:

```typescript
"User-Agent": `Mozilla/5.0 (compatible; YourSite/1.0; +${process.env.NEXT_PUBLIC_SITE_URL})`
```

---

## 📧 EMAIL CONFIGURATION

### What You Need to Do:

1. **Choose an email provider:**
   - SendGrid (recommended) ✅
   - Gmail
   - AWS SES
   - Mailgun
   - Your own SMTP server

2. **Get credentials and fill `.env.production`:**

   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.your_key_here
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   EMAIL_USER=noreply@yourdomain.com
   EMAIL_PASS=your_password
   ```

3. **Test sending email:**
   - Use the admin panel to send a test newsletter
   - Check `/api/health` endpoint for email service status

---

## 🗄️ DATABASE SEED CONFIGURATION

### When to Run Seed:

1. **FIRST TIME ONLY:**

   ```bash
   npx prisma db seed
   ```

   Creates: Admin user + Sample categories + Sample posts

2. **Do NOT run again** (will create duplicates using `upsert`)

3. **Update seed data before running:**
   - Change admin email
   - Change contact email
   - Update sample post content

---

## 💚 SITE SETTINGS (ADMIN PANEL)

### After Deployment:

1. **Go to:** `https://yourdomain.com/admin/login`
2. **Login with:** Email from seed data (e.g., `admin@yourdomain.com`)
3. **Password:** From your deployment logs (default: `admin123` from seed)
4. **Update Settings Page:**
   - Site Name
   - Site Description
   - Contact Email
   - Social Media Links
   - Google Analytics ID
   - Google AdSense ID
   - Logos
   - Footer content

**All settings stored in database** (no code changes needed!)

---

## 📊 MONITORING & ANALYTICS

### Services to Configure:

1. **Google Analytics:**
   - Get Measurement ID from Google Analytics
   - Add to `.env.production`: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
   - Add to admin settings

2. **Sentry (Error Tracking):**
   - Create project at https://sentry.io
   - Get DSN
   - Add to `.env.production`: `NEXT_PUBLIC_SENTRY_DSN=https://...`

3. **Google AdSense (Optional):**
   - Get Publisher ID
   - Add to admin settings (Site Settings)

---

## 🔐 SECURITY CONFIGURATION

### Required for Production:

1. **Generate Secure Secrets (Run this command):**

   ```bash
   openssl rand -base64 32
   ```

   Run 3 times and paste results into:
   - `NEXTAUTH_SECRET`
   - `CRON_SECRET`
   - `CSRF_TOKEN_SECRET`

2. **Enable HTTPS:**
   - Vercel: Automatic ✅
   - Railway: Automatic ✅

3. **Configure CORS (if needed):**
   - Frontend domain: `NEXTAUTH_URL`
   - Backend domain: Match in Railway

4. **Rate Limiting:**
   - Configured in `src/lib/ratelimit.ts`
   - No changes needed (uses sensible defaults)

5. **CSRF Protection:**
   - Enabled by default
   - Uses `CSRF_TOKEN_SECRET`

---

## 🚢 DEPLOYMENT STEPS

### Step 1: Prepare Code Changes

```bash
# 1. Update monitoring-init.ts (optional but recommended)
# 2. Update robots.ts (optional)
# 3. Update seed.ts with your emails
# 4. Update email templates with your domain
# 5. Commit all changes
git add .
git commit -m "Production configuration"
git push
```

### Step 2: Configure Environment Variables

#### For Vercel (Frontend):

```bash
Settings → Environment Variables → Add:
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- DATABASE_URL
- REDIS_URL (if using)
- NEXT_PUBLIC_SENTRY_DSN
- NEXT_PUBLIC_GA_ID
- CRON_SECRET
- METRICS_API_TOKEN
```

#### For Railway (Backend):

```bash
Add all variables from .env.production
Including secrets and database URLs
```

### Step 3: Deploy

```bash
# Vercel auto-deploys on git push
# Or manually trigger deployment in Vercel dashboard
```

### Step 4: Run Database Migrations

```bash
# Railway: Connect via SSH or use console
npx prisma migrate deploy

# Or seed (only once!)
npx prisma db seed
```

### Step 5: Verify Deployment

```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Check sitemap
https://yourdomain.com/sitemap.xml

# Check robots.txt
https://yourdomain.com/robots.txt
```

---

## ✅ VERIFICATION CHECKLIST

### Pre-Deployment

- [ ] `.env.production` file created and filled
- [ ] All secrets generated (32+ characters)
- [ ] Email credentials obtained
- [ ] Database created and accessible
- [ ] NEXTAUTH_URL matches your domain
- [ ] HTTPS enabled on domain

### Code Changes

- [ ] `prisma/seed.ts` updated with your emails
- [ ] `src/lib/monitoring-init.ts` updated (optional)
- [ ] `src/app/robots.ts` updated (optional)
- [ ] Email templates updated with your domain
- [ ] All changes committed to git

### Post-Deployment

- [ ] Frontend deployed on Vercel ✅
- [ ] Backend deployed on Railway ✅
- [ ] `/api/health` responds with "healthy"
- [ ] `/sitemap.xml` loads correctly
- [ ] Login page works
- [ ] Admin dashboard loads
- [ ] Settings page loads and saves
- [ ] Email sending works (test in admin)
- [ ] Analytics (Sentry) connected
- [ ] Google Analytics tracking
- [ ] HTTPS working (green lock)
- [ ] Homepage loads without errors
- [ ] Blog page loads posts
- [ ] Contact form submits
- [ ] Cron jobs can be triggered

### Performance

- [ ] Lighthouse score > 80
- [ ] Core Web Vitals in green
- [ ] No console errors
- [ ] No Sentry errors
- [ ] Page load time < 3s

---

## 🆘 TROUBLESHOOTING

### Issue: Health Check Fails

**File:** `src/lib/monitoring-init.ts` line 62

**Problem:** Pointing to `localhost:3000` in production

**Solution:**

```typescript
// Change from:
const response = await fetch("http://localhost:3000/api/health", {

// To:
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const response = await fetch(`${baseUrl}/api/health`, {
```

### Issue: Emails Not Sending

**Check:**

1. `/api/health` shows email service status
2. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are correct
3. Email provider allows the sender domain

### Issue: Sentry Not Tracking Errors

**Check:**

1. `NEXT_PUBLIC_SENTRY_DSN` is set
2. `NODE_ENV=production`
3. Check Sentry dashboard for ingestion settings

### Issue: Analytics Not Tracking

**Check:**

1. `NEXT_PUBLIC_GA_ID` is set correctly
2. Google Analytics property created
3. 24 hours passed for GA to show data

### Issue: Database Connection Failed

**Check:**

1. `DATABASE_URL` is correct format
2. Database is running and accessible
3. Firewall allows connection
4. Credentials are correct

---

## 📚 REFERENCE

### Key Environment Variables

```
NEXTAUTH_URL              → Your production domain (CRITICAL)
NEXTAUTH_SECRET           → 32+ char random string (CRITICAL)
DATABASE_URL              → MySQL connection string (CRITICAL)
SMTP_HOST                 → Email server (CRITICAL)
SMTP_PORT                 → Email port, usually 587
SMTP_USER                 → Email username/apikey
SMTP_PASS                 → Email password
SMTP_FROM_EMAIL           → Sender email address
CRON_SECRET               → For scheduled jobs (CRITICAL)
NEXT_PUBLIC_SENTRY_DSN    → Error tracking
NEXT_PUBLIC_GA_ID         → Google Analytics
NEXT_PUBLIC_SITE_URL      → Your domain (used in sitemap)
```

### Key Files

```
.env.production            → Environment variables (SECRET - don't commit)
src/app/layout.tsx         → Metadata and base URLs
src/lib/email-service.ts   → Email configuration
prisma/schema.prisma       → Database schema
prisma/seed.ts             → Sample data
src/lib/monitoring-init.ts → Health checks
```

---

## 🎉 YOU'RE READY!

Your application is **production-ready**. Just:

1. ✅ Fill `.env.production` with real values
2. ✅ Update a few email/domain references
3. ✅ Deploy to Vercel + Railway
4. ✅ Configure site settings via admin panel
5. ✅ Run verification checklist

**Questions?** Check the DEPLOYMENT.md file or review these changes step-by-step.
