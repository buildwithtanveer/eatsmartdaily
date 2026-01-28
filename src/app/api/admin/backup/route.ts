import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      users,
      posts,
      categories,
      tags,
      postTags,
      comments,
      siteSettings,
      ads,
      redirects,
      activityLogs,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.post.findMany(),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.postTag.findMany(),
      prisma.comment.findMany(),
      prisma.siteSettings.findMany(),
      prisma.ad.findMany(),
      prisma.redirect.findMany(),
      prisma.activityLog.findMany(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users,
        posts,
        categories,
        tags,
        postTags,
        comments,
        siteSettings,
        ads,
        redirects,
        activityLogs,
      },
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup failed:", error);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
