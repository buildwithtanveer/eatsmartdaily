"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export interface NotificationCounts {
  pendingComments: number;
  total: number;
}

export async function getNotificationCounts(): Promise<NotificationCounts> {
  try {
    await requirePermission(["ADMIN", "EDITOR"]);

    const pendingComments = await prisma.comment.count({
      where: { status: "PENDING" },
    });

    return {
      pendingComments,
      total: pendingComments,
    };
  } catch (error) {
    console.error("Failed to fetch notification counts:", error);
    return { pendingComments: 0, total: 0 };
  }
}
