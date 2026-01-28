import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

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
    const rateLimit = checkRateLimit(clientIp, "api_views");

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

    // Update view count
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
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
