import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function TestDBPage() {
  let dbStatus = "Checking...";
  let errorDetail = null;
  let dataSummary = null;

  try {
    // 1. Test SiteSettings
    const settings = await prisma.siteSettings.findFirst();
    
    // 2. Test Posts
    const postsCount = await prisma.post.count();
    const firstPost = await prisma.post.findFirst({
        include: { author: true, category: true }
    });

    // 3. Test individual slug (matching the failing one in screenshot)
    const specificSlug = "10-superfoods-every-day";
    const specificPost = await prisma.post.findUnique({
        where: { slug: specificSlug },
        include: { author: true, category: true }
    });

    // 3. Test Ads
    const adsCount = await prisma.ad.count();

    dbStatus = "Connected ✅";
    dataSummary = {
        settingsFound: !!settings,
        postsCount,
        firstPostTitle: firstPost?.title || "None",
        firstPostHasAuthor: !!firstPost?.author,
        firstPostHasCategory: !!firstPost?.category,
        specificPostFound: !!specificPost,
        adsCount
    };

  } catch (error: any) {
    dbStatus = "Failed ❌";
    errorDetail = error.message;
    console.error("DB Connection Error:", error);
  }

  return (
    <div className="p-8 font-mono">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <div className={`p-4 rounded border ${dbStatus.includes("Failed") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
        <p className="text-xl">{dbStatus}</p>
      </div>

      {errorDetail && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded overflow-auto">
          <h2 className="font-bold">Error Details:</h2>
          <pre>{errorDetail}</pre>
        </div>
      )}

      {dataSummary && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Data Summary:</h2>
          <ul className="list-disc pl-5">
            <li>Site Settings Found: {dataSummary.settingsFound ? "Yes" : "No"}</li>
            <li>Total Posts: {dataSummary.postsCount}</li>
            <li>First Post: {dataSummary.firstPostTitle}</li>
            <li>First Post Has Author: {dataSummary.firstPostHasAuthor ? "Yes" : "No"}</li>
            <li>First Post Has Category: {dataSummary.firstPostHasCategory ? "Yes" : "No"}</li>
            <li>Specific Post Found (10-superfoods): {dataSummary.specificPostFound ? "Yes" : "No"}</li>
            <li>Total Ads: {dataSummary.adsCount}</li>
          </ul>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Database URL (masked): {process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ":***@") : "Not Set"}</p>
      </div>
    </div>
  );
}
