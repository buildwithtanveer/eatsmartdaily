import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (!process.env.DATABASE_URL) {
      console.error("[PRISMA ERROR] DATABASE_URL is not defined in environment variables!");
    }
    console.log("[PRISMA] Initializing new PrismaClient...");
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
