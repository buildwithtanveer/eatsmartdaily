/**
 * Backup Management API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

/**
 * GET /api/admin/backups
 * List all backups
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user as { role: string }).role ||
      (session.user as { role: string }).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({ backups }, { status: 200 });
  } catch (error) {
    console.error("Error fetching backups:", error);
    if (error instanceof Error) {
      captureException(error, { context: "fetch_backups" });
    }
    return NextResponse.json(
      { error: "Failed to fetch backups" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/backups
 * Create a new backup
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { type = "FULL", description } = await request.json();

    // Create backup record
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `backup_${type.toLowerCase()}_${timestamp}.json`;

    const backup = await prisma.backup.create({
      data: {
        filename,
        type,
        description,
        status: "PENDING",
        size: BigInt(0),
        createdBy: user.id,
      },
    });

    // Queue backup job in background
    queueBackupJob(backup.id, type, user.id);

    return NextResponse.json(
      {
        message: "Backup created successfully",
        backupId: backup.id,
        filename: backup.filename,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating backup:", error);
    if (error instanceof Error) {
      captureException(error, { context: "create_backup" });
    }
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 },
    );
  }
}

/**
 * Queue backup job to run in the background
 */
function queueBackupJob(backupId: number, type: string, userId: number) {
  // Run backup asynchronously
  (async () => {
    try {
      const startTime = Date.now();

      // Update status to IN_PROGRESS
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: "IN_PROGRESS" },
      });

      // Prepare backup data based on type
      let backupData: any = {};

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

      backupData.exportedAt = new Date().toISOString();
      backupData.exportType = type;

      const backupJson = JSON.stringify(backupData, null, 2);
      const size = BigInt(backupJson.length);

      // Save backup status
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          size: size,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: "backup_created",
          resource: `backup_${backupId}`,
          details: `Backup completed in ${Date.now() - startTime}ms`,
          userId: userId,
        },
      });
    } catch (error) {
      console.error("Error during backup:", error);

      // Update status to FAILED
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      if (error instanceof Error) {
        captureException(error, { context: "backup_job", backupId });
      }
    }
  })();
}
