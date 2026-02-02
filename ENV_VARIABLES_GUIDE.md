# 🔧 ENVIRONMENT VARIABLES GUIDE - VISUAL REFERENCE

**Project:** EatSmartDaily  
**Date:** January 29, 2026  
**Purpose:** Clear breakdown of Required, Recommended, and Optional variables

---

## 📊 QUICK OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│  TOTAL VARIABLES IN PROJECT: 35+                            │
├─────────────────────────────────────────────────────────────┤
│  🔴 REQUIRED (CRITICAL):        8 variables                 │
│  🟡 RECOMMENDED (IMPORTANT):    12 variables                │
│  🟢 OPTIONAL (NICE TO HAVE):    15+ variables               │
└─────────────────────────────────────────────────────────────┘
```

---

# 🔴 REQUIRED VARIABLES (MUST HAVE)

**❌ WITHOUT THESE, YOUR APP WON'T WORK**

| #   | Variable          | Example Value                                     | Purpose                                                          | Must Set |
| --- | ----------------- | ------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| 1   | `NODE_ENV`        | `production`                                      | Tell Node.js app is in production mode                           | ✅ YES   |
| 2   | `NEXTAUTH_URL`    | `https://yourdomain.com`                          | Your production domain for authentication                        | ✅ YES   |
| 3   | `NEXTAUTH_SECRET` | `random-32-char-string`                           | Secret key for session encryption (use: openssl rand -base64 32) | ✅ YES   |
| 4   | `DATABASE_URL`    | `mysql://user:pass@host:port/db?sslaccept=strict` | MySQL database connection string                                 | ✅ YES   |
| 5   | `SMTP_HOST`       | `smtp.sendgrid.net`                               | Email server hostname                                            | ✅ YES   |
| 6   | `SMTP_PORT`       | `587`                                             | Email server port                                                | ✅ YES   |
| 7   | `SMTP_USER`       | `apikey` (for SendGrid)                           | Email authentication username                                    | ✅ YES   |
| 8   | `SMTP_PASS`       | `SG.your_api_key_here`                            | Email authentication password                                    | ✅ YES   |

### ✂️ MINIMAL PRODUCTION .env (Copy & Paste)

```bash
# These 8 are MINIMUM for app to work
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-32-char-random-string-here
DATABASE_URL=mysql://user:password@host:port/dbname?sslaccept=strict
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key_here
```

---

# 🟡 RECOMMENDED VARIABLES (IMPORTANT)

**⚠️ APP WORKS WITHOUT THESE, BUT YOU SHOULD ADD THEM**

| #   | Variable                  | Example Value                     | Purpose                    | Why Recommended                          |
| --- | ------------------------- | --------------------------------- | -------------------------- | ---------------------------------------- |
| 1   | `CRON_SECRET`             | `random-32-char-string`           | Secret for scheduled jobs  | Critical for security of automated tasks |
| 2   | `SMTP_FROM_EMAIL`         | `noreply@yourdomain.com`          | Email sender address       | Users see professional sender address    |
| 3   | `SMTP_FROM_NAME`          | `Eat Smart Daily`                 | Email sender name          | Professional emails instead of generic   |
| 4   | `SMTP_SECURE`             | `false` (TLS)                     | Use TLS encryption         | Email security                           |
| 5   | `ADMIN_EMAIL`             | `admin@yourdomain.com`            | Admin contact email        | For contact form and admin notifications |
| 6   | `NEXT_PUBLIC_SITE_URL`    | `https://yourdomain.com`          | Your website URL (public)  | Used in sitemaps, canonical URLs         |
| 7   | `NEXT_PUBLIC_SENTRY_DSN`  | `https://key@sentry.io/projectid` | Error tracking DSN         | Monitor and fix errors in production     |
| 8   | `METRICS_API_TOKEN`       | `random-32-char-string`           | Token for metrics endpoint | Secure access to performance metrics     |
| 9   | `NEXT_PUBLIC_GA_ID`       | `G-XXXXXXXXXX`                    | Google Analytics ID        | Track user behavior and traffic          |
| 10  | `DATABASE_URL` (with SSL) | Add `?sslaccept=strict`           | Secure database connection | Encrypt database traffic                 |
| 11  | `REDIS_URL`               | `redis://host:6379`               | Redis caching service      | Faster performance, rate limiting        |
| 12  | `NEWSLETTER_API_KEY`      | `your_api_key_here`               | Newsletter service API     | If using external newsletter service     |

### ✂️ RECOMMENDED ADDITIONS (Copy & Paste)

```bash
# Add to the 8 required variables above
CRON_SECRET=your-32-char-random-string-here
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Eat Smart Daily
SMTP_SECURE=false
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=https://your_key@sentry.io/your_project_id
METRICS_API_TOKEN=your-32-char-random-string-here
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
REDIS_URL=redis://default:password@host:6379
NEWSLETTER_API_KEY=your_newsletter_api_key_here
```

---

# 🟢 OPTIONAL VARIABLES (NICE TO HAVE)

**✨ YOUR APP WORKS FINE WITHOUT THESE - ADD ONLY IF YOU USE THE SERVICE**

| #   | Variable                        | Example Value       | Purpose                        | When to Add                                  |
| --- | ------------------------------- | ------------------- | ------------------------------ | -------------------------------------------- |
| 1   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | `abc123xyz`         | Sanity CMS project ID          | Only if using Sanity CMS                     |
| 2   | `NEXT_PUBLIC_SANITY_DATASET`    | `production`        | Sanity dataset name            | Only if using Sanity CMS                     |
| 3   | `SANITY_API_TOKEN`              | `sk_production_...` | Sanity API token               | Only if using Sanity CMS                     |
| 4   | `AWS_ACCESS_KEY_ID`             | `AKIA...`           | AWS access key                 | Only if using AWS S3 for uploads             |
| 5   | `AWS_SECRET_ACCESS_KEY`         | `aws_secret_...`    | AWS secret key                 | Only if using AWS S3 for uploads             |
| 6   | `AWS_S3_BUCKET`                 | `mybucket-name`     | AWS S3 bucket name             | Only if using AWS S3 for uploads             |
| 7   | `AWS_S3_REGION`                 | `us-east-1`         | AWS S3 region                  | Only if using AWS S3 for uploads             |
| 8   | `SENTRY_ORG`                    | `your-org-slug`     | Sentry organization            | Optional: for source maps in Sentry          |
| 9   | `SENTRY_PROJECT`                | `project-name`      | Sentry project name            | Optional: for source maps in Sentry          |
| 10  | `SENTRY_AUTH_TOKEN`             | `sntrys_...`        | Sentry auth token              | Optional: for Sentry integration             |
| 11  | `GIT_COMMIT_SHA`                | `abc123def456`      | Git commit for version         | Optional: for tracking versions in Sentry    |
| 12  | `REDIS_SECRET`                  | `your_password`     | Redis password if needed       | Only if Redis requires authentication        |
| 13  | `UPSTASH_REDIS_REST_URL`        | `https://...`       | Upstash Redis URL              | Only if using Upstash instead of local Redis |
| 14  | `UPSTASH_REDIS_REST_TOKEN`      | `token_...`         | Upstash token                  | Only if using Upstash                        |
| 15  | `EMAIL_USER`                    | `email@example.com` | Legacy email user (deprecated) | Keep for backward compatibility              |
| 16  | `EMAIL_PASS`                    | `password`          | Legacy email pass (deprecated) | Keep for backward compatibility              |

### 📌 OPTIONAL GROUPS

#### **If Using Sanity CMS:**

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk_production_your_token
```

#### **If Using AWS S3 for Image Uploads:**

```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=aws_secret...
AWS_S3_BUCKET=mybucket
AWS_S3_REGION=us-east-1
AWS_S3_PREFIX=uploads/
```

#### **If Using Upstash Redis (Serverless):**

```bash
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

#### **If Using Local Redis:**

```bash
REDIS_URL=redis://default:password@localhost:6379
REDIS_SECRET=your_password_if_needed
```

---

# 📋 DECISION MATRIX

## How to Choose What to Include?

```
START HERE → Do you need this feature?

┌─────────────────────────────────────────────────────────────┐
│ 1. AUTHENTICATION & DATABASE?                               │
│    YES → Add 8 REQUIRED variables                           │
│                                                              │
│ 2. WANT ERROR TRACKING IN PRODUCTION?                       │
│    YES → Add NEXT_PUBLIC_SENTRY_DSN (RECOMMENDED)           │
│    NO  → Skip it                                            │
│                                                              │
│ 3. WANT ANALYTICS & TRAFFIC DATA?                           │
│    YES → Add NEXT_PUBLIC_GA_ID (RECOMMENDED)                │
│    NO  → Skip it                                            │
│                                                              │
│ 4. WANT FASTER PERFORMANCE WITH CACHING?                    │
│    YES → Add REDIS_URL (RECOMMENDED)                        │
│    NO  → Works fine, but slower                             │
│                                                              │
│ 5. USING AWS FOR FILE UPLOADS?                              │
│    YES → Add AWS_* variables (OPTIONAL)                     │
│    NO  → Use local uploads (/public/uploads)                │
│                                                              │
│ 6. USING SANITY CMS?                                        │
│    YES → Add NEXT_PUBLIC_SANITY_* (OPTIONAL)                │
│    NO  → Use database posts only                            │
└─────────────────────────────────────────────────────────────┘
```

---

# 🎯 RECOMMENDED PRODUCTION SETUP

### For Small to Medium Sites (Start Here)

**Use these 20 variables:**

```bash
# ========== REQUIRED (8) ==========
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=random-32-char-string
DATABASE_URL=mysql://user:pass@host:port/db?sslaccept=strict
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_key_here

# ========== RECOMMENDED (12) ==========
CRON_SECRET=random-32-char-string
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Eat Smart Daily
SMTP_SECURE=false
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/id
METRICS_API_TOKEN=random-32-char-string
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
REDIS_URL=redis://default:pass@host:6379
```

---

### For Enterprise/Large Scale

**Use all 32 variables (required + recommended + selected optional):**

```bash
# All 20 from above, plus:
SENTRY_ORG=your-org
SENTRY_PROJECT=project
SENTRY_AUTH_TOKEN=sntrys_token
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=aws_secret...
AWS_S3_BUCKET=bucket
AWS_S3_REGION=us-east-1
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=token
```

---

# ✅ VARIABLE VALIDATION CHECKLIST

Use this to verify your production setup:

```
🔴 REQUIRED (All 8 must be set)
─────────────────────────────────────────
☐ NODE_ENV = "production"
☐ NEXTAUTH_URL = "https://yourdomain.com"
☐ NEXTAUTH_SECRET = 32+ characters
☐ DATABASE_URL = valid MySQL connection
☐ SMTP_HOST = valid SMTP server
☐ SMTP_PORT = 587 or 465
☐ SMTP_USER = valid username/apikey
☐ SMTP_PASS = valid password

🟡 RECOMMENDED (Should have these)
─────────────────────────────────────────
☐ CRON_SECRET = 32+ characters
☐ SMTP_FROM_EMAIL = noreply@yourdomain.com
☐ ADMIN_EMAIL = your email
☐ NEXT_PUBLIC_SITE_URL = https://yourdomain.com
☐ NEXT_PUBLIC_SENTRY_DSN = from sentry.io
☐ NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX (if using GA)
☐ METRICS_API_TOKEN = 32+ characters
☐ REDIS_URL = if using Redis

🟢 OPTIONAL (Add only if using)
─────────────────────────────────────────
☐ AWS_* = if using S3
☐ NEXT_PUBLIC_SANITY_* = if using Sanity
☐ UPSTASH_* = if using Upstash
```

---

# 🚀 QUICK START TEMPLATE

### Copy this to your `.env.production` file:

```bash
# ============================================
# REQUIRED - MUST CONFIGURE (No defaults!)
# ============================================

NODE_ENV=production
NEXTAUTH_URL=https://YOURDOMAINHERE.com
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.YOUR_SENDGRID_API_KEY_HERE

# ============================================
# RECOMMENDED - STRONGLY SUGGESTED
# ============================================

CRON_SECRET=GENERATE_WITH_openssl_rand_-base64_32
SMTP_FROM_EMAIL=noreply@YOURDOMAINHERE.com
SMTP_FROM_NAME=Your Site Name
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_SITE_URL=https://YOURDOMAINHERE.com
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@sentry.io/YOUR_PROJECT_ID
METRICS_API_TOKEN=GENERATE_WITH_openssl_rand_-base64_32
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# ============================================
# OPTIONAL - ONLY IF YOU USE THESE SERVICES
# ============================================

# REDIS_URL=redis://default:password@host:6379
# NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_S3_BUCKET=your-bucket-name
```

---

# 📊 COMPARISON TABLE: What You MUST vs CAN Skip

| Service            | Required                | Recommended    | Optional            | Impact if Missing     |
| ------------------ | ----------------------- | -------------- | ------------------- | --------------------- |
| **Authentication** | ✅ NEXTAUTH_URL, SECRET | -              | -                   | 🔴 App won't work     |
| **Database**       | ✅ DATABASE_URL         | With SSL       | -                   | 🔴 App won't work     |
| **Email**          | ✅ SMTP (all 4)         | SMTP*FROM*\*   | EMAIL_USER (legacy) | 🔴 Can't send emails  |
| **Scheduled Jobs** | -                       | ✅ CRON_SECRET | -                   | 🟡 Jobs won't work    |
| **Error Tracking** | -                       | ✅ SENTRY_DSN  | SENTRY_ORG, TOKEN   | 🟡 Can't track errors |
| **Analytics**      | -                       | ✅ GA_ID       | -                   | 🟡 No analytics       |
| **Performance**    | -                       | ✅ REDIS_URL   | UPSTASH\_\*         | 🟡 Slower caching     |
| **File Uploads**   | -                       | -              | ✅ AWS\_\*          | 🟢 Uses local storage |
| **CMS**            | -                       | -              | ✅ SANITY\_\*       | 🟢 Use DB posts only  |

---

# 🎓 LEARNING PATHS

## Path 1: Minimum Setup (Dev/Test)

```
Add 8 REQUIRED variables → App runs
```

## Path 2: Standard Setup (Small Site)

```
Add 8 REQUIRED + 8 RECOMMENDED → Production ready
```

## Path 3: Advanced Setup (Large Site)

```
Add 8 REQUIRED + 12 RECOMMENDED + Optional services
```

---

# 📞 VARIABLE SOURCES

| Variable               | Where to Get                   | Time to Get |
| ---------------------- | ------------------------------ | ----------- |
| NEXTAUTH_SECRET        | Run: `openssl rand -base64 32` | < 1 min     |
| DATABASE_URL           | Railway/PlanetScale/AWS        | 5-10 min    |
| SMTP credentials       | SendGrid/Gmail/AWS SES         | 5-10 min    |
| CRON_SECRET            | Run: `openssl rand -base64 32` | < 1 min     |
| NEXT_PUBLIC_SENTRY_DSN | sentry.io project settings     | 5 min       |
| NEXT_PUBLIC_GA_ID      | Google Analytics property      | 5 min       |
| NEXT_PUBLIC_SITE_URL   | Your domain                    | < 1 min     |
| AWS credentials        | AWS IAM dashboard              | 10 min      |
| Sanity credentials     | sanity.io project settings     | 5 min       |

---

**Total Setup Time:** 30-45 minutes with all recommended variables ⏱️

**Total Setup Time:** 10-15 minutes with just required variables ⚡

---

# 🎯 FINAL ANSWER TO YOUR QUESTION

## EXACT LIST TO COPY

### ✅ Put these in production (20 variables):

1. NODE_ENV
2. NEXTAUTH_URL
3. NEXTAUTH_SECRET
4. DATABASE_URL
5. SMTP_HOST
6. SMTP_PORT
7. SMTP_USER
8. SMTP_PASS
9. CRON_SECRET
10. SMTP_FROM_EMAIL
11. ADMIN_EMAIL
12. NEXT_PUBLIC_SITE_URL
13. NEXT_PUBLIC_SENTRY_DSN
14. METRICS_API_TOKEN
15. NEXT_PUBLIC_GA_ID
16. REDIS_URL
17. NEXT_PUBLIC_SITE_URL
18. SMTP_FROM_NAME
19. SMTP_SECURE
20. NEWSLETTER_API_KEY (optional)

### ❌ DON'T include these (they're optional):

- AWS\_\* (unless you use S3)
- SANITY\_\* (unless you use Sanity CMS)
- UPSTASH\_\* (unless you use Upstash)
- EMAIL_USER, EMAIL_PASS (legacy, deprecated)
- GIT_COMMIT_SHA (only for Sentry versioning)
- SENTRY\_\* (only for Sentry advanced setup)

---

**Keep this file handy when setting up production!** 🚀
