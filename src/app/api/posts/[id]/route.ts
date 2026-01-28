import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import slugify from "slugify";

// GET
export async function GET(
  _: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
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

  const data = await req.json();

  const slug = slugify(data.title, { lower: true });

  const post = await prisma.post.update({
    where: { id: Number(params.id) },
    data: {
      title: data.title,
      slug,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      focusKeyword: data.focusKeyword,
      featuredImage: data.featuredImage || null,
      showInSlider: data.showInSlider !== undefined ? data.showInSlider : undefined,
      showInPopular: data.showInPopular !== undefined ? data.showInPopular : undefined,
      showInLatest: data.showInLatest !== undefined ? data.showInLatest : undefined,
      status: data.status,
      categoryId: data.categoryId || null,
      publishedAt:
        data.status === "PUBLISHED" ? (data.publishedAt ?? new Date()) : null,
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
