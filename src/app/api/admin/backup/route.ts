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
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          jobTitle: true,
          bio: true,
          credentials: true,
          createdAt: true,
        },
      }),
      prisma.post.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          metaTitle: true,
          metaDescription: true,
          focusKeyword: true,
          featuredImage: true,
          status: true,
          publishedAt: true,
          authorId: true,
          categoryId: true,
          createdAt: true,
          isFeatured: true,
          updatedAt: true,
          references: true,
          reviewerId: true,
          showInLatest: true,
          showInPopular: true,
          showInSlider: true,
          excerpt: true,
          faq: true,
          featuredImageAlt: true,
          shareCount: true,
          views: true,
          allowComments: true,
        },
      }),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.postTag.findMany(),
      prisma.comment.findMany(),
      prisma.siteSettings.findMany({
        select: {
          id: true,
          siteName: true,
          siteDescription: true,
          contactEmail: true,
          socialFacebook: true,
          socialTwitter: true,
          socialInstagram: true,
          socialPinterest: true,
          socialYoutube: true,
          googleAnalyticsId: true,
          ezoicId: true,
          footerLogo: true,
          googleSearchConsole: true,
          headerLogo: true,
          logoHeight: true,
          logoSubheading: true,
          logoWidth: true,
          useDefaultLogoSize: true,
          adsTxt: true,
          googleAdSenseId: true,
          maintenanceMode: true,
          autoBackupEnabled: true,
          autoBackupFrequency: true,
          lastAutoBackup: true,
          spamKeywords: true,
        },
      }),
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
