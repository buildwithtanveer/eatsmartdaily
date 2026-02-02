
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

export async function processBackupInBackground(backupId: number, type: string, userId: number) {
  try {
    const startTime = Date.now();
    const backupData: any = {};

    // Update progress: Started
    await prisma.backup.update({
      where: { id: backupId },
      data: { progress: 10 }
    });

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
      // Update progress: Posts fetched
      await prisma.backup.update({
        where: { id: backupId },
        data: { progress: 30 }
      });

      backupData.categories = await prisma.category.findMany();
      backupData.tags = await prisma.tag.findMany();
      
      // Update progress: Categories/Tags fetched
      await prisma.backup.update({
        where: { id: backupId },
        data: { progress: 40 }
      });
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
      // Update progress: Users fetched
      await prisma.backup.update({
        where: { id: backupId },
        data: { progress: 60 }
      });

      backupData.comments = await prisma.comment.findMany();
      backupData.settings = await prisma.siteSettings.findFirst();
      backupData.ads = await prisma.ad.findMany();
      backupData.redirects = await prisma.redirect.findMany();
      
      // Update progress: Others fetched
      await prisma.backup.update({
        where: { id: backupId },
        data: { progress: 80 }
      });
    }

    // Construct final payload
    const backupRecord = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!backupRecord) throw new Error("Backup record not found");

    const payload = {
      exportedAt: new Date().toISOString(),
      exportType: type,
      backupId: backupId,
      filename: backupRecord.filename,
      description: backupRecord.description || undefined,
      data: backupData,
    };

    // Serialize with BigInt support
    const backupJson = JSON.stringify(payload, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    , 2);
    
    const size = BigInt(backupJson.length);

    // Update progress: Saving
    await prisma.backup.update({
      where: { id: backupId },
      data: { progress: 90 }
    });

    // Save backup status AND CONTENT
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        size: size,
        content: backupJson,
        progress: 100
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

  } catch (processError) {
    console.error(`[Backup Job ${backupId}] Failed during processing:`, processError);
    
    // Update status to FAILED
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: "FAILED",
        errorMessage:
          processError instanceof Error ? processError.message : "Unknown error",
        progress: 0
      },
    });

    if (processError instanceof Error) {
      captureException(processError, { context: "create_backup_process", backupId });
    }
  }
}
