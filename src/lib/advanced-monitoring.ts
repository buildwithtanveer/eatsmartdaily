/**
 * Advanced Performance Monitoring
 * Tracks API response times, database query performance, and Core Web Vitals
 */

import { addSentryBreadcrumb, captureMessage } from "@/lib/sentry-config";

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceThresholds {
  warning: number; // ms
  critical: number; // ms
}

// Default thresholds for different operation types
const DEFAULT_THRESHOLDS: Record<string, PerformanceThresholds> = {
  api_route: { warning: 1000, critical: 3000 },
  database_query: { warning: 500, critical: 2000 },
  cache_operation: { warning: 100, critical: 500 },
  file_upload: { warning: 5000, critical: 15000 },
  image_processing: { warning: 2000, critical: 5000 },
  email_send: { warning: 3000, critical: 10000 },
};

// In-memory metrics storage (rolls over hourly)
const metricsBuffer: PerformanceMetric[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Record a performance metric
 */
export function recordMetric(
  name: string,
  duration: number,
  tags?: Record<string, string>,
) {
  const metric: PerformanceMetric = {
    name,
    duration,
    timestamp: Date.now(),
    tags,
  };

  // Add to buffer
  metricsBuffer.push(metric);

  // Keep buffer size reasonable
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift();
  }

  // Check thresholds
  const threshold = DEFAULT_THRESHOLDS[name] || DEFAULT_THRESHOLDS.api_route;

  if (duration >= threshold.critical) {
    captureMessage(
      `CRITICAL: ${name} took ${duration}ms (threshold: ${threshold.critical}ms)`,
      "error",
      {
        duration,
        threshold: threshold.critical,
        tags,
      },
    );

    addSentryBreadcrumb(
      `Performance: ${name} exceeded critical threshold`,
      "performance",
      "error",
      {
        duration,
        threshold: threshold.critical,
      },
    );
  } else if (duration >= threshold.warning) {
    addSentryBreadcrumb(
      `Performance: ${name} exceeded warning threshold`,
      "performance",
      "warning",
      {
        duration,
        threshold: threshold.warning,
      },
    );
  }

  return metric;
}

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>,
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    recordMetric(name, duration, tags);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordMetric(name, duration, { ...tags, error: "true" });
    throw error;
  }
}

/**
 * Measure synchronous function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>,
): T {
  const startTime = Date.now();

  try {
    const result = fn();
    const duration = Date.now() - startTime;
    recordMetric(name, duration, tags);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordMetric(name, duration, { ...tags, error: "true" });
    throw error;
  }
}

/**
 * Get performance metrics summary
 */
export function getMetricsSummary(last?: number): {
  totalMetrics: number;
  averageDuration: number;
  slowestOperations: PerformanceMetric[];
  operationsByName: Record<
    string,
    {
      count: number;
      avgDuration: number;
      minDuration: number;
      maxDuration: number;
    }
  >;
} {
  // Get metrics from last X seconds (default 5 minutes)
  const timeWindow = (last || 300) * 1000;
  const now = Date.now();
  const recentMetrics = metricsBuffer.filter(
    (m) => now - m.timestamp < timeWindow,
  );

  const totalMetrics = recentMetrics.length;
  const averageDuration =
    totalMetrics > 0
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalMetrics
      : 0;

  // Top 10 slowest operations
  const slowestOperations = [...recentMetrics]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Group by operation name
  const operationsByName: Record<
    string,
    {
      count: number;
      avgDuration: number;
      minDuration: number;
      maxDuration: number;
    }
  > = {};

  for (const metric of recentMetrics) {
    if (!operationsByName[metric.name]) {
      operationsByName[metric.name] = {
        count: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
      };
    }

    const stats = operationsByName[metric.name];
    stats.count++;
    stats.avgDuration += metric.duration;
    stats.minDuration = Math.min(stats.minDuration, metric.duration);
    stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
  }

  // Calculate averages
  for (const key in operationsByName) {
    operationsByName[key].avgDuration /= operationsByName[key].count;
  }

  return {
    totalMetrics,
    averageDuration,
    slowestOperations,
    operationsByName,
  };
}

/**
 * Clear metrics buffer
 */
export function clearMetrics() {
  metricsBuffer.length = 0;
}

/**
 * Middleware wrapper for API routes
 */
export async function withPerformanceMonitoring<T>(
  routeName: string,
  handler: () => Promise<T>,
): Promise<T> {
  return measureAsync(routeName, handler, { type: "api_route" });
}

/**
 * Database query wrapper with performance tracking
 */
export async function withDatabaseMonitoring<T>(
  queryName: string,
  query: () => Promise<T>,
): Promise<T> {
  return measureAsync(queryName, query, { type: "database_query" });
}

/**
 * Check if metrics indicate health issues
 */
export function checkPerformanceHealth(): {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const summary = getMetricsSummary(60); // Last 1 minute
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (summary.averageDuration > 500) {
    issues.push(
      `High average response time: ${Math.round(summary.averageDuration)}ms`,
    );
    recommendations.push("Review slow database queries and API endpoints");
  }

  // Check for critical threshold violations
  for (const [name, stats] of Object.entries(summary.operationsByName)) {
    const threshold = DEFAULT_THRESHOLDS[name] || DEFAULT_THRESHOLDS.api_route;
    if (stats.maxDuration > threshold.critical) {
      issues.push(
        `${name} exceeded critical threshold (${stats.maxDuration}ms)`,
      );
      recommendations.push(`Optimize ${name} operation`);
    }
  }

  return {
    isHealthy: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Export metrics for monitoring
 */
export function exportMetrics() {
  const summary = getMetricsSummary();
  return {
    timestamp: new Date().toISOString(),
    metrics: {
      total: summary.totalMetrics,
      averageDuration: Math.round(summary.averageDuration),
      slowestOperations: summary.slowestOperations.slice(0, 5).map((op) => ({
        name: op.name,
        duration: op.duration,
        timestamp: new Date(op.timestamp).toISOString(),
      })),
      operationTypes: Object.entries(summary.operationsByName).reduce(
        (acc, [name, stats]) => {
          acc[name] = {
            count: stats.count,
            avgDuration: Math.round(stats.avgDuration),
            minDuration: stats.minDuration,
            maxDuration: stats.maxDuration,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            count: number;
            avgDuration: number;
            minDuration: number;
            maxDuration: number;
          }
        >,
      ),
    },
    health: checkPerformanceHealth(),
  };
}
