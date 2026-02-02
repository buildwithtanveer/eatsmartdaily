/**
 * Performance Metrics Endpoint
 * Returns real-time performance metrics and system health
 */

import { NextResponse } from "next/server";
import { exportMetrics } from "@/lib/advanced-monitoring";
import { getMetricsSummary } from "@/lib/advanced-monitoring";

export const dynamic = "force-dynamic";

/**
 * GET /api/metrics
 * Returns performance metrics and monitoring data
 */
export async function GET(request: Request) {
  const token = request.headers.get("x-metrics-token");
  const metricsSecret = process.env.METRICS_API_TOKEN;

  if (process.env.NODE_ENV === "production" && !metricsSecret) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  if (!metricsSecret || !token || token !== metricsSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const metrics = exportMetrics();

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to retrieve metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
