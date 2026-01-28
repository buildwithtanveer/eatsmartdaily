/**
 * Health Check Endpoint
 * Monitors application health, database connectivity, and critical systems
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: "ok" | "error";
      responseTime: number;
      message?: string;
    };
    memory: {
      status: "ok" | "warning";
      usage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        percentage: number;
      };
    };
    environment: {
      status: "ok" | "warning";
      configuredServices: string[];
      missingServices?: string[];
    };
  };
  version: string;
  environment: string;
}

/**
 * GET /api/health
 * Returns application health status and diagnostic information
 */
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const startTime = Date.now();
  const checkTimestamp = new Date().toISOString();

  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  const checks: HealthCheckResponse["checks"] = {
    database: { status: "ok", responseTime: 0 },
    memory: { status: "ok", usage: {} as any },
    environment: { status: "ok", configuredServices: [] },
  };

  // 1. Database Health Check
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;

    checks.database = {
      status: "ok",
      responseTime: dbResponseTime,
    };
  } catch (error) {
    checks.database = {
      status: "error",
      responseTime: Date.now() - startTime,
      message:
        error instanceof Error ? error.message : "Database connection failed",
    };
    overallStatus = "unhealthy";
  }

  // 2. Memory Health Check
  try {
    const memUsage = process.memoryUsage();
    const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    checks.memory = {
      status: heapPercentage > 90 ? "warning" : "ok",
      usage: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        percentage: Math.round(heapPercentage),
      },
    };

    if (checks.memory.status === "warning") {
      overallStatus = "degraded";
    }
  } catch (error) {
    checks.memory = {
      status: "warning",
      usage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        percentage: 0,
      },
    };
  }

  // 3. Environment Configuration Check
  try {
    const configuredServices: string[] = [];
    const missingServices: string[] = [];

    // Check critical environment variables
    const requiredEnvVars = [
      { name: "NEXTAUTH_SECRET", service: "Authentication" },
      { name: "DATABASE_URL", service: "Database" },
      { name: "NEXTAUTH_URL", service: "Next Auth" },
    ];

    const optionalEnvVars = [
      { name: "SENTRY_AUTH_TOKEN", service: "Sentry Error Tracking" },
      { name: "NEXT_PUBLIC_SENTRY_DSN", service: "Sentry Frontend" },
      { name: "GOOGLE_ANALYTICS_ID", service: "Google Analytics" },
      { name: "CRON_SECRET", service: "Scheduled Jobs" },
    ];

    // Check required vars
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar.name]) {
        configuredServices.push(envVar.service);
      } else {
        missingServices.push(envVar.service);
        overallStatus = "unhealthy";
      }
    }

    // Check optional vars
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar.name]) {
        configuredServices.push(envVar.service);
      }
    }

    checks.environment = {
      status: missingServices.length === 0 ? "ok" : "warning",
      configuredServices,
      missingServices: missingServices.length > 0 ? missingServices : undefined,
    };
  } catch (error) {
    checks.environment = {
      status: "warning",
      configuredServices: [],
    };
  }

  // Calculate response time
  const totalResponseTime = Date.now() - startTime;

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: checkTimestamp,
    uptime: process.uptime(),
    checks,
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  };

  // Return appropriate status code based on health
  const statusCode =
    overallStatus === "healthy"
      ? 200
      : overallStatus === "degraded"
        ? 503
        : 503;

  return NextResponse.json(response, { status: statusCode });
}
