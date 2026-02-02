/**
 * Backup Restore API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { captureException } from "@/lib/sentry-config";
import { restoreBackup } from "@/lib/backup-service";
import { prisma } from "@/lib/prisma";

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
    const user = session?.user as { id: string | number; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = Number(user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const backupId = parseInt(id);
    const { confirmDeletion = false } = await request.json();

    if (!confirmDeletion) {
      return NextResponse.json(
        { error: "Restore confirmation required" },
        { status: 400 },
      );
    }

    // Perform synchronous restore
    try {
      const stats = await restoreBackup(backupId, userId);
      
      return NextResponse.json(
        { 
          message: "Restore completed successfully",
          stats: stats
        },
        { status: 200 },
      );

    } catch (restoreError) {
      console.error(`[Backup Restore ${backupId}] Failed:`, restoreError);
      
      // Log failure
       await prisma.activityLog.create({
        data: {
          action: "backup_restore_failed",
          resource: `backup_${backupId}`,
          details: `Restore failed: ${restoreError instanceof Error ? restoreError.message : "Unknown error"}`,
          userId: userId,
        },
      });

      if (restoreError instanceof Error) {
        captureException(restoreError, { context: "restore_process", backupId });
      }

      return NextResponse.json(
        { error: restoreError instanceof Error ? restoreError.message : "Restore failed" },
        { status: 500 },
      );
    }

  } catch (error) {
    console.error("Error restoring backup:", error);
    if (error instanceof Error) {
      captureException(error, { context: "restore_backup" });
    }
    return NextResponse.json(
      { error: "Failed to initiate restore" },
      { status: 500 },
    );
  }
}
