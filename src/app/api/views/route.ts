import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { createHash } from "crypto";

// We use "nodejs" runtime because standard Prisma Client doesn't support Edge runtime
// without an accelerator. This is still performant for this use case.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "";

    // Ignore bots, crawlers, and spiders to ensure accurate analytics
    if (
      /bot|crawl|spider|google|bing|slurp|duckduckgo|baidu|yandex/i.test(ua)
    ) {
      return new NextResponse("ignored", { status: 204 });
    }

    // Rate limiting: Max 100 view requests per 10 seconds per IP
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(clientIp, "api_views");

    if (!rateLimit.allowed) {
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter || 10),
        },
      });
    }

    const body = await req.json();
    const { postId } = body;

    if (!postId || typeof postId !== "number") {
      return new NextResponse(JSON.stringify({ error: "Invalid postId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate postId exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return new NextResponse(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create IP hash for visitor tracking (privacy preserving)
    const ipHash = createHash("sha256").update(clientIp).digest("hex");
    
    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Transaction to update all stats safely
    await prisma.$transaction(async (tx) => {
      // 1. Increment Post view count
      await tx.post.update({
        where: { id: postId },
        data: { views: { increment: 1 } },
      });

      // 2. Get or create DailyStat for today
      let dailyStat = await tx.dailyStat.findUnique({
        where: { date: today },
      });

      if (!dailyStat) {
        dailyStat = await tx.dailyStat.create({
          data: { date: today, views: 0, visitors: 0 },
        });
      }

      // 3. Check if this visitor has already visited today
      const existingVisitor = await tx.dailyVisitor.findUnique({
        where: {
          statId_ipHash: {
            statId: dailyStat.id,
            ipHash: ipHash,
          },
        },
      });

      const isNewVisitor = !existingVisitor;

      // 4. Update DailyStat
      await tx.dailyStat.update({
        where: { id: dailyStat.id },
        data: {
          views: { increment: 1 },
          visitors: isNewVisitor ? { increment: 1 } : undefined,
        },
      });

      // 5. Record visitor if new
      if (isNewVisitor) {
        await tx.dailyVisitor.create({
          data: {
            statId: dailyStat.id,
            ipHash: ipHash,
          },
        });
      }
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("View tracking error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
