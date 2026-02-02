"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

export async function getBackupSettings() {
  await requireAdmin();
  const settings = await prisma.siteSettings.findFirst({
    select: {
      autoBackupEnabled: true,
      autoBackupFrequency: true,
      lastAutoBackup: true,
    },
  });
  return settings || { autoBackupEnabled: false, autoBackupFrequency: "WEEKLY", lastAutoBackup: null };
}

export async function updateBackupSettings(enabled: boolean, frequency: string) {
  const session = await requireAdmin();
  
  const firstSettings = await prisma.siteSettings.findFirst();
  
  if (firstSettings) {
    await prisma.siteSettings.update({
      where: { id: firstSettings.id },
      data: {
        autoBackupEnabled: enabled,
        autoBackupFrequency: frequency,
      },
    });
    
    await logActivity(Number((session.user as any).id), "UPDATE_BACKUP_SETTINGS", "Settings", { enabled, frequency });
  } else {
    // Should not happen usually, but handle it
    await prisma.siteSettings.create({
      data: {
        autoBackupEnabled: enabled,
        autoBackupFrequency: frequency,
        siteName: "Eat Smart Daily", // Default required field
      },
    });
  }
  
  revalidatePath("/admin/tools");
  return { success: true };
}
