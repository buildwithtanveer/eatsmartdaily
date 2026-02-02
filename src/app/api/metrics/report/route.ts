/**
 * Core Web Vitals Metrics Reporting Endpoint
 * Collects and stores Core Web Vitals metrics from clients
 */

import { NextResponse } from "next/server";

interface MetricReport {
  name: string;
  value: number;
  status: "good" | "needsImprovement" | "poor";
  rating: string;
  delta: number;
  id: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

// In-memory storage for metrics (in production, use a database)
const metricsStore: MetricReport[] = [];
const MAX_STORED_METRICS = 1000;

function isAuthorized(request: Request) {
  const secret = process.env.METRICS_API_TOKEN;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const token = request.headers.get("x-metrics-token");
  return token === secret;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const metric: MetricReport = await request.json();

    // Validate metric data
    if (
      !metric.name ||
      metric.value === undefined ||
      !metric.status ||
      !metric.timestamp
    ) {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 },
      );
    }

    const storedMetric: MetricReport = {
      ...metric,
      url: process.env.NODE_ENV === "production" ? "" : metric.url,
      userAgent: process.env.NODE_ENV === "production" ? "" : metric.userAgent,
    };

    // Store metric
    metricsStore.push(storedMetric);

    // Keep store size manageable
    if (metricsStore.length > MAX_STORED_METRICS) {
      metricsStore.shift();
    }

    // Log concerning metrics
    if (storedMetric.status === "poor") {
      console.warn(`❌ Poor Core Web Vital detected:`, {
        metric: storedMetric.name,
        value: storedMetric.value,
        url: storedMetric.url,
        timestamp: storedMetric.timestamp,
      });
    }

    return NextResponse.json(
      { success: true, metric: storedMetric.name },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error reporting metric:", error);
    return NextResponse.json(
      { error: "Failed to report metric" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get metrics summary
  const recentMetrics =
    process.env.NODE_ENV === "production"
      ? metricsStore.slice(-20).map((m) => ({
          name: m.name,
          value: m.value,
          status: m.status,
          rating: m.rating,
          delta: m.delta,
          id: m.id,
          timestamp: m.timestamp,
        }))
      : metricsStore.slice(-20);

  const summary = {
    totalMetrics: metricsStore.length,
    byStatus: {
      good: metricsStore.filter((m) => m.status === "good").length,
      needsImprovement: metricsStore.filter(
        (m) => m.status === "needsImprovement",
      ).length,
      poor: metricsStore.filter((m) => m.status === "poor").length,
    },
    byMetric: {} as Record<
      string,
      {
        count: number;
        avg: number;
        good: number;
        needsImprovement: number;
        poor: number;
      }
    >,
    recentMetrics,
  };

  // Calculate stats by metric type
  for (const metric of metricsStore) {
    if (!summary.byMetric[metric.name]) {
      summary.byMetric[metric.name] = {
        count: 0,
        avg: 0,
        good: 0,
        needsImprovement: 0,
        poor: 0,
      };
    }

    const stats = summary.byMetric[metric.name];
    stats.count++;
    stats.avg += metric.value;

    if (metric.status === "good") stats.good++;
    else if (metric.status === "needsImprovement") stats.needsImprovement++;
    else if (metric.status === "poor") stats.poor++;
  }

  // Calculate averages
  for (const key in summary.byMetric) {
    summary.byMetric[key].avg /= summary.byMetric[key].count;
  }

  return NextResponse.json(summary, { status: 200 });
}
