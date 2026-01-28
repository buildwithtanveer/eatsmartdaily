import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkUrl, extractLinks } from "@/lib/link-checker";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postIds } = await request.json();

    if (!postIds || !Array.isArray(postIds)) {
       return NextResponse.json({ error: "Invalid postIds" }, { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { id: true, title: true, slug: true, content: true },
    });

    const results = [];

    for (const post of posts) {
      if (!post.content) continue;
      
      const links = extractLinks(post.content);
      const brokenLinks = [];

      for (const link of links) {
        // Skip internal relative links and mailto
        if (link.startsWith("/") || link.startsWith("#") || link.startsWith("mailto:")) continue;
        
        // Also skip localhost for production safety if needed, but maybe user wants to check dev links?
        // Let's keep it simple.

        const status = await checkUrl(link);
        
        let isBroken = false;
        if (typeof status === "string") {
            isBroken = true; // "Error", "Timeout"
        } else if (status >= 400) {
            // 403 Forbidden might be bot protection, but technically it's not accessible.
            // We report it so user can verify.
            isBroken = true;
        }

        if (isBroken) {
          brokenLinks.push({
            url: link,
            status,
          });
        }
      }

      if (brokenLinks.length > 0) {
        results.push({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          brokenLinks,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Link check failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
