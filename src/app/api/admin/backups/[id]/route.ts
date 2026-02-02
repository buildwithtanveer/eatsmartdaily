/**
 * Backup Restore API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

/**
 * GET /api/admin/backups/[id]
 * Download a backup as JSON
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number | string; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const backupId = parseInt(id);
    const backup = await prisma.backup.findUnique({ where: { id: backupId } });

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    // Check status endpoint for polling
    const url = new URL(request.url);
    if (url.searchParams.get("check") === "true") {
      return NextResponse.json({
        status: backup.status,
        progress: (backup as any).progress ?? 0,
        filename: backup.filename,
        errorMessage: backup.errorMessage
      });
    }

    if (backup.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Backup is not completed yet" },
        { status: 400 },
      );
    }

    // Check if content is saved in the database (new method)
    if ((backup as any).content) {
      return new NextResponse((backup as any).content, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${backup.filename}"`,
        },
      });
    }

    // Fallback: Generate backup payload based on type (legacy method)
    const type = backup.type;
    const backupData: any = {};

    if (type === "FULL" || type === "POSTS_ONLY") {
      backupData.posts = await prisma.post.findMany({
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          tags: true,
          comments: true,
          versions: true,
        },
      });
      backupData.categories = await prisma.category.findMany();
      backupData.tags = await prisma.tag.findMany();
    }

    if (type === "FULL" || type === "DATABASE_ONLY") {
      backupData.users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          bio: true,
          jobTitle: true,
        },
      });
      backupData.comments = await prisma.comment.findMany();
      backupData.settings = await prisma.siteSettings.findFirst();
      backupData.ads = await prisma.ad.findMany();
      backupData.redirects = await prisma.redirect.findMany();
    }

    // Minimal incremental support: export posts updated after backup creation
    if (type === "INCREMENTAL") {
      backupData.posts = await prisma.post.findMany({
        where: { updatedAt: { gt: backup.createdAt } },
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          tags: true,
          comments: true,
          versions: true,
        },
      });
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      exportType: type,
      backupId: backup.id,
      filename: backup.filename,
      description: backup.description || undefined,
      data: backupData,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${backup.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading backup:", error);
    if (error instanceof Error) {
      captureException(error, { context: "download_backup" });
    }
    return NextResponse.json(
      { error: "Failed to download backup" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/backups/[id]
 * Delete a backup
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: string | number; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = Number(user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const backupId = parseInt(id);

    await prisma.backup.delete({
      where: { id: backupId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "backup_deleted",
        resource: `backup_${backupId}`,
        details: "Backup file deleted",
        userId: userId,
      },
    });

    return NextResponse.json(
      { message: "Backup deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting backup:", error);
    if (error instanceof Error) {
      captureException(error, { context: "delete_backup" });
    }
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 },
    );
  }
}
