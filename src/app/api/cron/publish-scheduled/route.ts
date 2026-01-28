import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // CRITICAL: CRON_SECRET is REQUIRED - not optional
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not configured");
    return NextResponse.json(
      { error: "CRON endpoint not configured" },
      { status: 500 },
    );
  }

  // Verify authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("Unauthorized CRON access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find posts that are SCHEDULED and past their publish time
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        publishedAt: {
          lte: now,
        },
      },
    });

    if (postsToPublish.length > 0) {
      // Update them to PUBLISHED
      await prisma.post.updateMany({
        where: {
          id: { in: postsToPublish.map((p) => p.id) },
        },
        data: {
          status: "PUBLISHED",
        },
      });

      console.log(`Published ${postsToPublish.length} scheduled posts.`);
    }

    return NextResponse.json({
      success: true,
      publishedCount: postsToPublish.length,
      posts: postsToPublish.map((p) => p.title),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
