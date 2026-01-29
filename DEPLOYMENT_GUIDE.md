# Quick Deployment Guide - Production Ready

## Immediate Actions Required

### 1. Deploy the Bug Fixes

```bash
git add -A
git commit -m "Fix: Turbopack web-vitals import and Vercel upload handling"
git push
```

Monitor Vercel deployment and check:

- ✅ Build completes without Turbopack errors
- ✅ `/blog` returns posts (no 500 error)
- ✅ `/category/recipes` returns category posts (no 500 error)
- ✅ `/search?q=test` returns search results (no 500 error)

### 2. Verify Database Connection

In Vercel Dashboard:

1. Go to your project
2. Settings → Environment Variables
3. Verify `DATABASE_URL` exists and points to Railway

If not set:

```
DATABASE_URL="postgresql://user:password@railway-host:5432/database"
```

### 3. Choose & Implement Upload Solution

**Quick Decision Tree:**

- Free & Easy → Use **Cloudinary** ✅
- AWS User → Use **AWS S3**
- Want Everything in One Platform → Use **Supabase**

---

## Option 1: Cloudinary (5 minutes - Recommended)

### Step 1: Setup Cloudinary

```bash
# Visit https://cloudinary.com/users/register/free
# Sign up with email
# Go to Dashboard → Copy:
# - Cloud Name
# - API Key
# - API Secret
```

### Step 2: Install Package

```bash
npm install cloudinary next-cloudinary
```

### Step 3: Add Environment Variables

Create/update `.env.local`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Also add to Vercel (Project Settings → Environment Variables):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Step 4: Create New Upload Handler

Create file: `src/app/api/upload-cloudinary/route.ts`

```typescript
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 },
    );
  }

  try {
    const buffer = await file.arrayBuffer();

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "eatsmartdaily",
          resource_type: "auto",
          quality: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(Buffer.from(buffer));
    });

    return NextResponse.json({
      url: (result as any).secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

### Step 5: Update Admin Upload Component

Find where file upload happens in admin and change:

```typescript
// Old
const res = await fetch("/api/upload", { method: "POST", body: formData });

// New
const res = await fetch("/api/upload-cloudinary", {
  method: "POST",
  body: formData,
});
```

### Step 6: Deploy

```bash
git add -A
git commit -m "Add Cloudinary upload support"
git push
```

**Done!** Images will now upload and persist in Cloudinary.

---

## Option 2: AWS S3

### Step 1: Setup AWS

1. Create AWS account
2. Create S3 bucket (e.g., `eatsmartdaily-uploads`)
3. Get Access Key & Secret Key from IAM

### Step 2: Install SDK

```bash
npm install @aws-sdk/client-s3
```

### Step 3: Environment Variables

`.env.local` and Vercel:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=eatsmartdaily-uploads
AWS_S3_REGION=us-east-1
```

### Step 4: Create Upload Handler

Create: `src/app/api/upload-s3/route.ts`

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 },
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    const webpBuffer = await sharp(buffer)
      .resize(1200)
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${uuidv4()}.webp`;
    const key = `uploads/${fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: webpBuffer,
        ContentType: "image/webp",
      }),
    );

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

### Step 5: Deploy

```bash
git add -A
git commit -m "Add AWS S3 upload support"
git push
```

---

## Option 3: Supabase Storage

### Step 1: Setup Supabase

1. Go to https://supabase.com
2. Create new project
3. Go to Storage → Create new bucket `uploads`
4. Get URL and key from Settings

### Step 2: Install SDK

```bash
npm install @supabase/supabase-js
```

### Step 3: Environment Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Create Upload Handler

Create: `src/app/api/upload-supabase/route.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 },
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    const webpBuffer = await sharp(buffer)
      .resize(1200)
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${uuidv4()}.webp`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, webpBuffer, {
        contentType: "image/webp",
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("uploads")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

---

## Testing Upload (All Options)

1. Deploy code
2. Go to Admin Dashboard → Media
3. Try uploading an image
4. Should see URL and image displayed
5. Visit the URL directly - should load the image

---

## Rollback Plan (If Issues Occur)

```bash
# If build fails
git revert HEAD
git push

# Check Vercel deployment status
# Wait for automatic revert deployment

# Then investigate errors in Vercel logs
```

---

## Success Checklist

- [ ] Build passes without Turbopack errors
- [ ] `/blog` page loads and shows posts
- [ ] `/category/recipes` page loads and shows posts
- [ ] `/search?q=test` page loads and shows results
- [ ] `/api/upload` returns error about external storage
- [ ] Image upload working with chosen storage service
- [ ] Images persist after page refresh
- [ ] Database connection working (Railway)

---

## Support Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://railway.app/documentation
