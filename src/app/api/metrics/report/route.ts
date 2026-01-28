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

export async function POST(request: Request) {
  try {
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

    // Store metric
    metricsStore.push(metric);

    // Keep store size manageable
    if (metricsStore.length > MAX_STORED_METRICS) {
      metricsStore.shift();
    }

    // Log concerning metrics
    if (metric.status === "poor") {
      console.warn(`❌ Poor Core Web Vital detected:`, {
        metric: metric.name,
        value: metric.value,
        url: metric.url,
        timestamp: metric.timestamp,
      });
    }

    return NextResponse.json(
      { success: true, metric: metric.name },
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

export async function GET() {
  // Get metrics summary
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
    recentMetrics: metricsStore.slice(-20),
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
