/**
 * Post Version History API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

/**
 * GET /api/admin/posts/[id]/versions
 * Get version history for a post
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const postId = parseInt(id);

    // Check if user has access to this post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "EDITOR" &&
      post.authorId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const versions = await prisma.postVersion.findMany({
      where: { postId },
      include: {
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ versions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post versions:", error);
    if (error instanceof Error) {
      captureException(error, { context: "fetch_post_versions" });
    }
    return NextResponse.json(
      { error: "Failed to fetch post versions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/posts/[id]/versions
 * Create a new version (save current post state)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const postId = parseInt(id);
    const { changeDescription } = await request.json();

    // Check if user has access to this post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        title: true,
        content: true,
        excerpt: true,
        status: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (
      user.role !== "ADMIN" &&
      user.role !== "EDITOR" &&
      post.authorId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create version
    const version = await prisma.postVersion.create({
      data: {
        postId,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || undefined,
        status: post.status as any,
        createdBy: user.id,
        changeDescription: changeDescription || undefined,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "post_version_created",
        resource: `post_${postId}`,
        details: changeDescription || "Post version saved",
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Version saved successfully", version },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating post version:", error);
    if (error instanceof Error) {
      captureException(error, { context: "create_post_version" });
    }
    return NextResponse.json(
      { error: "Failed to create post version" },
      { status: 500 },
    );
  }
}
