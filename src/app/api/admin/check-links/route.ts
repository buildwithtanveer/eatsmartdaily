import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkUrl, extractLinks } from "@/lib/link-checker";
import { z } from "zod";

const CheckLinksSchema = z.object({
  postIds: z.array(z.number().int()).min(1).max(200),
});

type BrokenLink = { url: string; status: number | string };
type LinkCheckResult = {
  postId: number;
  postTitle: string;
  postSlug: string;
  brokenLinks: BrokenLink[];
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = CheckLinksSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { postIds } = validation.data;

    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { id: true, title: true, slug: true, content: true },
    });

    const results: LinkCheckResult[] = [];

    for (const post of posts) {
      if (!post.content) continue;
      
      const links = extractLinks(post.content).slice(0, 50);
      const brokenLinks: BrokenLink[] = [];

      const concurrency = 5;
      const queue = [...links];
      const workers = Array.from({ length: Math.min(concurrency, queue.length) }).map(async () => {
        while (queue.length) {
          const link = queue.shift();
          if (!link) break;

          const status = await checkUrl(link);

          const isBroken = typeof status === "string" ? true : status >= 400;

          if (isBroken) {
            brokenLinks.push({ url: link, status });
          }
        }
      });
      await Promise.all(workers);

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
