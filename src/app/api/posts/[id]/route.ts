import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import slugify from "slugify";
import { z } from "zod";

const PostUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  content: z.string().optional().default(""),
  metaTitle: z.string().trim().max(300).optional().nullable(),
  metaDescription: z.string().trim().max(500).optional().nullable(),
  focusKeyword: z.string().trim().max(200).optional().nullable(),
  featuredImage: z.string().trim().optional().nullable(),
  featuredImageAlt: z.string().trim().max(300).optional().nullable(),
  showInSlider: z.boolean().optional(),
  showInPopular: z.boolean().optional(),
  showInLatest: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).optional(),
  categoryId: z.number().int().optional().nullable(),
  publishedAt: z.union([z.string().datetime(), z.date()]).optional().nullable(),
  excerpt: z.string().trim().max(1000).optional().nullable(),
});

// GET
export async function GET(
  _: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      focusKeyword: true,
      featuredImage: true,
      featuredImageAlt: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.status !== "PUBLISHED") {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || !role || role === "USER") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
  }

  return NextResponse.json(post);
}

// UPDATE
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = PostUpdateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const data = validation.data;

  const baseSlug = slugify(data.title, { lower: true });
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (
    await prisma.post.findFirst({
      where: { slug: uniqueSlug, id: { not: Number(params.id) } },
      select: { id: true },
    })
  ) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const post = await prisma.post.update({
    where: { id: Number(params.id) },
    data: {
      title: data.title,
      slug: uniqueSlug,
      content: data.content,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      focusKeyword: data.focusKeyword || null,
      featuredImage: data.featuredImage
        ? data.featuredImage.trim().replace(/^[`'"]+|[`'"]+$/g, "")
        : null,
      featuredImageAlt: data.featuredImageAlt || null,
      showInSlider: data.showInSlider !== undefined ? data.showInSlider : undefined,
      showInPopular: data.showInPopular !== undefined ? data.showInPopular : undefined,
      showInLatest: data.showInLatest !== undefined ? data.showInLatest : undefined,
      allowComments: data.allowComments !== undefined ? data.allowComments : undefined,
      status: data.status,
      categoryId: data.categoryId || null,
      publishedAt:
        data.status === "PUBLISHED"
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : null,
      excerpt: data.excerpt || null,
    },
  });

  return NextResponse.json(post);
}

// DELETE
export async function DELETE(
  _: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.post.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ success: true });
}
