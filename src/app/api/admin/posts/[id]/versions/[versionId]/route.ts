/**
 * Restore Post Version API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

/**
 * POST /api/admin/posts/[id]/versions/[versionId]/restore
 * Restore a specific version of a post
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  try {
    const { id, versionId } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const postId = parseInt(id);
    const versionIdNum = parseInt(versionId);

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

    // Get the version to restore
    const version = await prisma.postVersion.findUnique({
      where: { id: versionIdNum },
    });

    if (!version || version.postId !== postId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Save current state as a new version before restoring
    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { title: true, content: true, excerpt: true, status: true },
    });

    if (currentPost) {
      await prisma.postVersion.create({
        data: {
          postId,
          title: currentPost.title,
          content: currentPost.content,
          excerpt: currentPost.excerpt || undefined,
          status: currentPost.status as any,
          createdBy: user.id,
          changeDescription: `Auto-backup before restoring to version from ${new Date(version.createdAt).toLocaleString()}`,
        },
      });
    }

    // Restore the version
    const restoredPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: version.title,
        content: version.content,
        excerpt: version.excerpt || undefined,
        status: version.status as any,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "post_version_restored",
        resource: `post_${postId}`,
        details: `Restored to version from ${new Date(version.createdAt).toLocaleString()}`,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Version restored successfully", post: restoredPost },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error restoring post version:", error);
    if (error instanceof Error) {
      captureException(error, { context: "restore_post_version" });
    }
    return NextResponse.json(
      { error: "Failed to restore post version" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/posts/[id]/versions/[versionId]
 * Delete a specific version
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  try {
    const { id, versionId } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const postId = parseInt(id);
    const versionIdNum = parseInt(versionId);

    // Check if user has access
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

    // Delete the version
    await prisma.postVersion.delete({
      where: { id: versionIdNum },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "post_version_deleted",
        resource: `post_${postId}`,
        details: "Post version deleted",
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Version deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting post version:", error);
    if (error instanceof Error) {
      captureException(error, { context: "delete_post_version" });
    }
    return NextResponse.json(
      { error: "Failed to delete post version" },
      { status: 500 },
    );
  }
}
