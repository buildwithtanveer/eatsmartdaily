# Troubleshooting Guide

## If Pages Still Show 500 Errors After Deploy

### 1. Check Vercel Build Status

```
Go to Vercel Dashboard → Your Project → Deployments
```

**Look for:**

- ✅ Green checkmark = Build successful
- ❌ Red X = Build failed
- 🔄 Loading = Still building

**Common Build Errors:**

- "Module not found: Can't resolve 'web-vitals'" → Apply the fix in `src/components/EnhancedWebVitalsMonitor.tsx` ✅ (Already done)
- Prisma errors → Run `npx prisma generate` locally and commit

### 2. Check Vercel Runtime Logs

```
Deployments → (Select latest) → Logs tab
```

**Look for error patterns:**

```
Error: ECONNREFUSED - Can't connect to database
→ Fix: Set DATABASE_URL in Vercel Environment Variables

Error: 500 Internal Server Error
→ Look for stack trace - check database, API errors

PostNotFound: post not found
→ Ensure posts exist with status "PUBLISHED" in Railway DB
```

### 3. Test Locally First

```bash
npm run dev
# Visit http://localhost:3000/blog
```

If it works locally but fails in production:

- **Database Issue**: Check DATABASE_URL is set in Vercel
- **Missing Data**: Verify posts exist in Railway database
- **Build Issue**: Check Vercel build logs for warnings

### 4. Common Database Issues

**Symptoms:**

```
500 error on /blog, /category/*, /search
Posts work locally but not in production
```

**Fixes:**

Check DATABASE_URL format:

```
# Should be:
postgresql://user:password@host:5432/database

# NOT:
database_url (without postgresql://)
```

Test connection from Vercel:

1. Go to Vercel → Project Settings → Functions
2. Check logs for database errors

Verify posts exist:

```bash
# From your local terminal:
npx prisma studio
# Check that posts table has rows with status="PUBLISHED"
```

### 5. Specific Error Messages

| Error                             | Cause                | Solution                            |
| --------------------------------- | -------------------- | ----------------------------------- |
| `Module not found: web-vitals`    | Build error          | ✅ Already fixed                    |
| `PrismaClientInitializationError` | No DATABASE_URL      | Add to Vercel env vars              |
| `Cannot find post`                | Query returning null | Check post status is "PUBLISHED"    |
| `ECONNREFUSED`                    | Can't reach database | Check Railway credentials           |
| `EADDRINUSE`                      | Port already in use  | Unlikely in Vercel, check local dev |

---

## If Image Upload Still Fails After Deploy

### Issue 1: Upload Returns 503 Error

```json
{
  "error": "Upload service not configured. Please use external storage (AWS S3, Cloudinary, etc.)",
  "hint": "Configure UPLOAD_SERVICE_URL environment variable for production uploads"
}
```

**Fix:** This is expected. Choose one of the three options:

- [Cloudinary (Easiest)](#cloudinary-setup)
- [AWS S3 (Most Features)](#aws-s3-setup)
- [Supabase (Most Integrated)](#supabase-setup)

### Issue 2: Upload Works But Images Don't Appear

**If using Cloudinary/S3/Supabase:**

- Check image URL is accessible (copy URL, paste in browser)
- Verify environment variables are set in Vercel
- Check CORS settings if using S3

### Issue 3: "Network Error" When Uploading

Check:

1. API endpoint exists: `curl https://eatsmartdaily.vercel.app/api/upload-cloudinary`
   - Should return 405 (since POST requires file)
   - Not 404 (which means endpoint doesn't exist)

2. Authentication working:
   - Are you logged in as Admin/Editor/Author?
   - Check session token in browser DevTools → Application → Cookies

3. File size too large:
   - Vercel function timeout: 60 seconds
   - File upload limit: 4.5 MB
   - Try with smaller file (< 2 MB)

---

## Cloudinary Setup

### Verify Installation

```bash
npm list cloudinary
# Should show: cloudinary@^latest
```

### Check Environment Variables

In Vercel Dashboard:

```
Settings → Environment Variables
```

Should have:

```
✅ CLOUDINARY_CLOUD_NAME = dxxxxxxxxxx
✅ CLOUDINARY_API_KEY = 123456789
✅ CLOUDINARY_API_SECRET = xxxxxxxxxxxxx
```

### Test Upload Endpoint

```bash
curl -X POST https://eatsmartdaily.vercel.app/api/upload-cloudinary \
  -H "Cookie: __Secure-next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/test-image.jpg"
```

**Expected response:**

```json
{
  "url": "https://res.cloudinary.com/dxxxxxxxxxx/image/upload/..."
}
```

---

## AWS S3 Setup

### Verify Credentials

Check Vercel environment variables have:

```
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ AWS_S3_BUCKET
✅ AWS_S3_REGION
```

### Check S3 Permissions

AWS access key must have permissions:

- s3:PutObject
- s3:GetObject

### Test Upload

```bash
# Test S3 connection
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx \
  aws s3 ls s3://your-bucket-name/ --region us-east-1
```

---

## Supabase Setup

### Verify Credentials

```
✅ SUPABASE_URL = https://your-project.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY = eyJ...
```

### Check Storage Bucket

1. Supabase Dashboard → Storage
2. Should have "uploads" bucket
3. Check bucket is public (or update policies)

### Test Connection

```bash
# Visit Supabase dashboard and check Storage → uploads
# You should see uploaded files appear in real-time
```

---

## Database Verification

### Connect to Railway

1. Go to Railway dashboard
2. Select your database
3. Click "Connect"
4. Use connection string in local terminal:

```bash
psql "postgresql://user:password@host:5432/dbname"
```

### Check Posts Exist

```sql
SELECT id, title, slug, status FROM "Post" LIMIT 5;
```

**Should return:**

- At least 1 row
- status = 'PUBLISHED'

### Check Categories Exist

```sql
SELECT id, name, slug FROM "Category" LIMIT 5;
```

### If No Data

1. Add posts/categories from admin dashboard locally
2. Or run seed script:

```bash
npx prisma db seed
```

---

## Vercel Deployment Checklist

Before deploying, verify:

### Code Changes

- [ ] Fixed `EnhancedWebVitalsMonitor.tsx` ✅
- [ ] Fixed upload API ✅
- [ ] No TypeScript errors: `npm run build`
- [ ] No ESLint errors: `npm run lint`

### Environment Variables (Vercel)

- [ ] `DATABASE_URL` - Railway connection string
- [ ] `NEXTAUTH_SECRET` - Random secret
- [ ] `NEXTAUTH_URL` - https://eatsmartdaily.vercel.app
- [ ] Upload service credentials (if using Cloudinary/S3/Supabase)

### Database

- [ ] Railway database has posts with status="PUBLISHED"
- [ ] Categories exist
- [ ] Can connect from local machine

### After Deployment

- [ ] Build succeeds (no errors)
- [ ] `/blog` page loads
- [ ] `/category/recipes` page loads
- [ ] `/search?q=test` page loads
- [ ] Upload API returns proper error (503 until external storage configured)

---

## Emergency Rollback

If production is broken and you need to revert:

```bash
# Option 1: Revert last commit
git revert HEAD
git push

# Option 2: Reset to known good commit
git log --oneline  # Find good commit hash
git revert <good-hash>..HEAD
git push

# Option 3: Use Vercel deployment history
# Go to Vercel Dashboard → Deployments
# Click "..." on previous good deployment
# Select "Rollback to this deployment"
```

---

## Getting Help

If issues persist:

1. **Check Vercel Logs**:
   - Go to Deployments → Click latest → Logs
   - Copy full error message

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for JavaScript errors

3. **Check Network Tab**:
   - Open DevTools → Network
   - Reload page
   - Look for failed requests (red)
   - Check response for error messages

4. **Enable Debug Logging**:
   - Add to `.env.local`:

   ```
   DEBUG=prisma:*
   LOG_LEVEL=debug
   ```

   - Rebuild and test

5. **Contact Support**:
   - Vercel: https://vercel.com/support
   - Railway: https://railway.app/support
   - Storage Service (Cloudinary/AWS/Supabase)
