/**
 * Post Preview Token API
 * Generate and manage preview tokens for sharing unpublished posts
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";
import crypto from "crypto";

/**
 * POST /api/admin/posts/[id]/preview-token
 * Generate a preview token for sharing unpublished posts
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
    const { expiresInHours = 48 } = await request.json();

    // Check if user has access to this post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, status: true },
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

    // Generate unique token
    const previewToken = crypto.randomBytes(32).toString("hex");
    const previewExpiresAt = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000,
    );

    // Update post with token
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        previewToken,
        previewExpiresAt,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "preview_token_generated",
        resource: `post_${postId}`,
        details: `Preview token generated, expires in ${expiresInHours} hours`,
        userId: user.id,
      },
    });

    const previewUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/preview/${previewToken}`;

    return NextResponse.json(
      {
        message: "Preview token generated",
        previewToken,
        previewUrl,
        expiresAt: previewExpiresAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating preview token:", error);
    if (error instanceof Error) {
      captureException(error, { context: "generate_preview_token" });
    }
    return NextResponse.json(
      { error: "Failed to generate preview token" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/posts/[id]/preview-token
 * Revoke preview token
 */
export async function DELETE(
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

    // Revoke token
    await prisma.post.update({
      where: { id: postId },
      data: {
        previewToken: null,
        previewExpiresAt: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "preview_token_revoked",
        resource: `post_${postId}`,
        details: "Preview token revoked",
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Preview token revoked" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error revoking preview token:", error);
    if (error instanceof Error) {
      captureException(error, { context: "revoke_preview_token" });
    }
    return NextResponse.json(
      { error: "Failed to revoke preview token" },
      { status: 500 },
    );
  }
}
