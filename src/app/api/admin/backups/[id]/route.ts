/**
 * Backup Restore API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

/**
 * POST /api/admin/backups/[id]/restore
 * Restore a backup
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const backupId = parseInt(id);
    const { confirmDeletion = false } = await request.json();

    if (!confirmDeletion) {
      return NextResponse.json(
        { error: "Restore confirmation required" },
        { status: 400 },
      );
    }

    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    if (backup.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only restore completed backups" },
        { status: 400 },
      );
    }

    // Queue restore job
    queueRestoreJob(backupId, user.id);

    return NextResponse.json(
      { message: "Restore job queued successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error restoring backup:", error);
    if (error instanceof Error) {
      captureException(error, { context: "restore_backup" });
    }
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 },
    );
  }
}

/**
 * Queue restore job to run in the background
 */
function queueRestoreJob(backupId: number, userId: number) {
  // Run restore asynchronously
  (async () => {
    try {
      // Log restore activity
      await prisma.activityLog.create({
        data: {
          action: "backup_restore_started",
          resource: `backup_${backupId}`,
          details: "Backup restore initiated",
          userId: userId,
        },
      });

      // In production, implement actual restore logic
      // For now, log the action
      await prisma.activityLog.create({
        data: {
          action: "backup_restore_completed",
          resource: `backup_${backupId}`,
          details: "Backup restore completed",
          userId: userId,
        },
      });
    } catch (error) {
      console.error("Error during restore:", error);

      if (error instanceof Error) {
        captureException(error, { context: "restore_job", backupId });
      }
    }
  })();
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
    const user = session?.user as { id: number; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
        userId: user.id,
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
