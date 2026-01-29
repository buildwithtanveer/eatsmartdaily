# Production Issues & Fixes - EatSmartDaily

## Issues Identified

### 1. **500 Errors on Blog, Categories, and Search Pages**

**Root Cause:** Turbopack build issue with `web-vitals` module import

**Problem:**

- The `web-vitals` package was imported using ES6 import syntax at the top level
- Turbopack couldn't resolve this dependency during production build
- This caused the build to fail or the app to serve broken pages

**Location:** `src/components/EnhancedWebVitalsMonitor.tsx`

**Fix Applied:**

- Changed from static ES6 import to dynamic require with proper null checks
- Added runtime checks to ensure code only runs in browser environment
- Wrapped in try-catch to gracefully handle import failures

**Before:**

```tsx
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from "web-vitals";
```

**After:**

```tsx
let onCLS: any = () => {};
let onINP: any = () => {};
let onFCP: any = () => {};
let onLCP: any = () => {};
let onTTFB: any = () => {};

if (typeof window !== "undefined") {
  try {
    const webVitals = require("web-vitals");
    onCLS = webVitals.onCLS;
    onINP = webVitals.onINP;
    onFCP = webVitals.onFCP;
    onLCP = webVitals.onLCP;
    onTTFB = webVitals.onTTFB;
  } catch (e) {
    console.warn("web-vitals module not available");
  }
}
```

---

### 2. **Image Upload Failing in Production**

**Root Cause:** Vercel has ephemeral (temporary) storage

**Problem:**

- The upload API saves files to `public/uploads` directory
- On Vercel, the filesystem is ephemeral - files are deleted between deployments
- Files uploaded during a session won't be available on the next request
- This breaks image uploads in the admin dashboard

**Location:** `src/app/api/upload/route.ts`

**Fix Applied:**

- Added environment detection to identify production vs local
- Prevented filesystem writes on Vercel production
- Provided clear error message guiding users to external storage solutions

**Before:**

```typescript
// Always tried to save to filesystem
const uploadDir = path.join(process.cwd(), "public/uploads");
const outputPath = path.join(uploadDir, fileName);
await sharp(buffer).resize(1200).webp({ quality: 80 }).toFile(outputPath);
```

**After:**

```typescript
const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

if (isProduction && process.env.VERCEL) {
  // Production on Vercel: File system is ephemeral
  return NextResponse.json(
    {
      error:
        "Upload service not configured. Please use external storage (AWS S3, Cloudinary, etc.)",
      hint: "Configure UPLOAD_SERVICE_URL environment variable for production uploads",
    },
    { status: 503 },
  );
}

// Local development: Use filesystem (unchanged)
```

---

## What You Need To Do

### Step 1: Rebuild and Deploy

```bash
npm run build
# Deploy to Vercel
git push
```

This should fix the 500 errors on blog/category/search pages.

### Step 2: Fix Image Uploads (CRITICAL)

The upload API now detects Vercel and prevents filesystem writes. You have three options:

#### Option A: Use AWS S3 (Recommended for Production)

1. Create an AWS account and S3 bucket
2. Install: `npm install @aws-sdk/client-s3`
3. Add to `.env.local`:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
```

4. Update upload route to use AWS SDK:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_S3_REGION });
const key = `uploads/${fileName}`;

await s3.send(
  new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/webp",
  }),
);

const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
return NextResponse.json({ url });
```

#### Option B: Use Cloudinary (Easier, Free Tier Available)

1. Sign up at https://cloudinary.com (free tier supports ~75,000 media assets)
2. Get your Cloud Name, API Key, and API Secret
3. Add to `.env.local`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Update upload route:

```typescript
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadResult = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.v2.uploader.upload_stream(
    { resource_type: "auto", folder: "eatsmartdaily" },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    },
  );
  uploadStream.end(buffer);
});

return NextResponse.json({ url: uploadResult.secure_url });
```

#### Option C: Use Supabase Storage

1. Create a Supabase project at https://supabase.com
2. Create a bucket for uploads
3. Add to `.env.local`:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Database Connection Verification

The 500 errors might also be related to database connection issues. Check:

1. **Railway database connection string** is set in Vercel environment:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `DATABASE_URL` is set correctly with Railway credentials

2. **Test connection**:

```bash
npx prisma db push
npx prisma generate
```

3. **Check Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Deployments → View Logs
   - Look for database connection errors

---

## API Endpoints Status

After fixes, these should work:

| Endpoint           | Status                    | Issue                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| `/api/posts`       | ✅ Should work now        | Was failing due to build error                    |
| `/api/categories`  | ✅ Should work now        | Was failing due to build error                    |
| `/blog`            | ✅ Should work now        | Calls `getBlogPosts()` - needs DB connection      |
| `/category/[slug]` | ✅ Should work now        | Calls `getCategoryBySlug()` - needs DB connection |
| `/search?q=...`    | ✅ Should work now        | Calls `searchPosts()` - needs DB connection       |
| `/api/upload`      | ⚠️ Needs external storage | Now detects Vercel and prevents filesystem writes |

---

## Debugging Steps If Issues Persist

1. **Check Vercel Build Logs**:
   - No build errors about `web-vitals` should appear

2. **Check Vercel Runtime Logs**:
   - Look for database connection errors
   - Look for 500 error stack traces

3. **Test Locally First**:

   ```bash
   npm run dev
   # Visit http://localhost:3000/blog
   # Check browser console for errors
   ```

4. **Check Database**:
   - Connect to Railway and verify posts exist
   - Verify posts have `status: "PUBLISHED"`

5. **Enable Debugging**:
   - Add to `next.config.ts`:
   ```typescript
   logging: {
     fetches: {
       fullUrl: true,
     }
   }
   ```

---

## Files Modified

- `src/components/EnhancedWebVitalsMonitor.tsx` - Fixed web-vitals import
- `src/app/api/upload/route.ts` - Added Vercel detection and proper error handling

## Next Steps

1. ✅ Apply the code fixes (already done)
2. ⏳ Rebuild and redeploy to Vercel
3. ⏳ Test `/blog`, `/category/recipes`, etc.
4. ⏳ Implement external storage solution for uploads
5. ⏳ Update `.env` variables on Vercel for storage service

---

## Important Notes

- **Database Connection**: Ensure `DATABASE_URL` is correctly set in Vercel environment
- **Ephemeral Storage**: Always use external storage services on Vercel for persistent files
- **Environment Variables**: Set all necessary env vars in Vercel dashboard under Project Settings → Environment Variables
- **Build Logs**: Monitor Vercel build logs during deployment for any issues
