import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import slugify from "slugify";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const PostCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional().default(""),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  featuredImage: z.string().optional().nullable(),
  showInSlider: z.boolean().optional(),
  showInPopular: z.boolean().optional(),
  showInLatest: z.boolean().optional().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  categoryId: z.number().int().optional().nullable(),
});

// GET all posts
export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      featuredImageAlt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
      author: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(posts);
}

// CREATE post
export async function POST(req: Request) {
  // Rate limiting
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "api_posts");

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = PostCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
  }

  const data = validation.data;

  const slug = slugify(data.title, { lower: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorId = Number((session.user as any).id);

  if (isNaN(authorId)) {
    return NextResponse.json({ error: "Invalid user session: missing ID" }, { status: 400 });
  }

  // Handle slug uniqueness
  let uniqueSlug = slug;
  let counter = 1;
  while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: uniqueSlug,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      focusKeyword: data.focusKeyword,
      featuredImage: data.featuredImage ? data.featuredImage.trim().replace(/^[`'"]+|[`'"]+$/g, "") : null,
      showInSlider: data.showInSlider || false,
      showInPopular: data.showInPopular || false,
      showInLatest: data.showInLatest,
      status: data.status,
      authorId, // Use logged-in user ID
      categoryId: data.categoryId || null,
      publishedAt:
        data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(post);
}
