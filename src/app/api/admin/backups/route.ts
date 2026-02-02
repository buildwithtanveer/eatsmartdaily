/**
 * Backup Management API
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

import { processBackupInBackground } from "@/lib/backup-processor";

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

    const serializedBackups = backups.map((backup) => ({
      ...backup,
      size: backup.size.toString(),
    }));

    return NextResponse.json({ backups: serializedBackups }, { status: 200 });
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
    const user = session?.user as { id: string | number; role: string } | undefined;

    if (!session || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = Number(user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { type = "FULL", description } = await request.json();

    // Create backup record
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `backup_${type.toLowerCase()}_${timestamp}.json`;

    // Initialize backup record with IN_PROGRESS status
    const backup = await prisma.backup.create({
      data: {
        filename,
        type,
        description,
        status: "IN_PROGRESS",
        size: BigInt(0),
        createdBy: userId,
        progress: 0
      },
    });

    // Start background processing WITHOUT await
    processBackupInBackground(backup.id, type, userId).catch(err => {
        console.error("Background backup failed to start:", err);
    });

    return NextResponse.json(
      {
        message: "Backup started successfully",
        backupId: backup.id,
        filename: backup.filename,
        status: "IN_PROGRESS"
      },
      { status: 202 },
    );

  } catch (error) {
    console.error("Error creating backup:", error);
    if (error instanceof Error) {
      captureException(error, { context: "create_backup_init" });
    }
    return NextResponse.json(
      { error: "Failed to initiate backup" },
      { status: 500 },
    );
  }
}
