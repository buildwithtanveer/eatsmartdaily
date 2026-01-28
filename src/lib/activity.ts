import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logActivity(
  userId: number | null,
  action: string,
  resource: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>
) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to prevent blocking main action
  }
}
