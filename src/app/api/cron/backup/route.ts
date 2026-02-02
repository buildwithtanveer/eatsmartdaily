import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processBackupInBackground } from "@/lib/backup-processor";

export async function GET(request: Request) {
  try {
    // Check authentication (CRON_SECRET)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Support both Bearer token and query param "key"
    const isAuthorized = 
      (!cronSecret) || // Open if no secret configured (dev)
      (key === cronSecret) || 
      (authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findFirst();

    if (!settings?.autoBackupEnabled) {
      return NextResponse.json({ message: "Auto-backup disabled" }, { status: 200 });
    }

    const frequency = settings.autoBackupFrequency || "WEEKLY";
    const lastBackup = settings.lastAutoBackup;

    const now = new Date();
    let shouldRun = false;

    if (!lastBackup) {
      shouldRun = true;
    } else {
      const diff = now.getTime() - new Date(lastBackup).getTime();
      const hours = diff / (1000 * 60 * 60);

      if (frequency === "DAILY" && hours >= 24) {
        shouldRun = true;
      } else if (frequency === "WEEKLY" && hours >= 168) { // 7 * 24
        shouldRun = true;
      }
    }

    if (shouldRun) {
      // Create backup record
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `autobackup_${frequency.toLowerCase()}_${timestamp}.json`;

      const backup = await prisma.backup.create({
        data: {
          filename,
          type: "FULL",
          description: `Automated ${frequency} Backup`,
          status: "IN_PROGRESS",
          size: BigInt(0),
          createdBy: 1, // System user or Admin (using ID 1 as default admin)
          progress: 0
        },
      });

      // Update lastAutoBackup immediately to prevent double runs
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { lastAutoBackup: now },
      });

      // Trigger background process
      processBackupInBackground(backup.id, "FULL", 1).catch(err => 
        console.error("Auto-backup background process failed:", err)
      );

      return NextResponse.json({ 
        message: "Backup started", 
        backupId: backup.id 
      });
    }

    return NextResponse.json({ message: "Not due yet", nextRun: "Calculated based on frequency" });

  } catch (error) {
    console.error("Cron Backup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
