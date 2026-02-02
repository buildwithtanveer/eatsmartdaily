/**
 * Comments API - Support for nested/threaded comments
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitizer";
import { captureException } from "@/lib/sentry-config";

/**
 * GET /api/posts/[id]/comments
 * Get all comments for a post (including nested replies)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    // Get top-level comments with their replies
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    if (error instanceof Error) {
      captureException(error, { context: "fetch_comments" });
    }
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/posts/[id]/comments
 * Create a new comment or reply to a comment
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const postId = parseInt(id);
    const { content, parentId } = await request.json();

    // Validate post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sanitize content
    const sanitizedContent = sanitizeHtml(content);

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 },
      );
    }

    let authorId: number | null = null;
    let authorName = "";
    let authorEmail = "";

    // If logged in, use session user
    if (session?.user) {
      const user = session.user as {
        id?: number;
        name?: string;
        email?: string;
      };
      authorId = user.id || null;
      authorName = user.name || "";
      authorEmail = user.email || "";
    }

    // If replying to a comment, validate parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 },
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        postId,
        name: authorName || "Anonymous",
        email: authorEmail,
        ...(authorId && { userId: authorId }),
        ...(parentId && { parentId: parseInt(parentId) }),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Notify if it's a reply (future: send email to parent comment author)
    if (parentId) {
      await prisma.activityLog.create({
        data: {
          action: "comment_replied",
          resource: `post_${postId}`,
          details: `New reply to comment ${parentId}`,
          userId: authorId || undefined,
        },
      });
    } else {
      await prisma.activityLog.create({
        data: {
          action: "comment_created",
          resource: `post_${postId}`,
          details: "New comment on post",
          userId: authorId || undefined,
        },
      });
    }

    return NextResponse.json(
      { message: "Comment created successfully", comment },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof Error) {
      captureException(error, { context: "create_comment" });
    }
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
