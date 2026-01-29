"use client";

/**
 * Enhanced Core Web Vitals Monitor
 * Tracks and reports Core Web Vitals metrics to monitoring services
 */

import { useEffect } from "react";

// Dynamically import web-vitals to avoid build issues in Turbopack
let onCLS: any = () => {};
let onINP: any = () => {};
let onFCP: any = () => {};
let onLCP: any = () => {};
let onTTFB: any = () => {};

if (typeof window !== \"undefined\") {
  try {
    const webVitals = require(\"web-vitals\");
    onCLS = webVitals.onCLS;
    onINP = webVitals.onINP;
    onFCP = webVitals.onFCP;
    onLCP = webVitals.onLCP;
    onTTFB = webVitals.onTTFB;
  } catch (e) {
    console.warn(\"web-vitals module not available\");
  }
}

interface CWVMetric {
  name: string;
  value: number;
  status: "good" | "needsImprovement" | "poor";
  rating?: string;
  delta?: number;
  id?: string;
}

const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (replaced FID)
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 600, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

/**
 * Determine metric status based on value and thresholds
 */
function getMetricStatus(
  metricName: string,
  value: number,
): "good" | "needsImprovement" | "poor" {
  const thresholds =
    METRIC_THRESHOLDS[metricName as keyof typeof METRIC_THRESHOLDS];
  if (!thresholds) return "good";

  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needsImprovement";
  return "poor";
}

/**
 * Send metric to analytics endpoint
 */
async function reportMetric(metric: Metric) {
  try {
    const enhancedMetric: CWVMetric = {
      name: metric.name,
      value: metric.value,
      status: getMetricStatus(metric.name, metric.value),
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    };

    // Send to your monitoring endpoint
    await fetch("/api/metrics/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...enhancedMetric,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      // Don't block page unload
      keepalive: true,
    }).catch((err) => {
      console.error("Failed to report metric:", err);
    });

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Core Web Vital:", {
        name: metric.name,
        value: metric.value.toFixed(2),
        status: enhancedMetric.status,
        rating: metric.rating,
      });
    }
  } catch (error) {
    console.error("Error reporting metric:", error);
  }
}

/**
 * Enhanced Core Web Vitals Monitor Component
 */
export function EnhancedWebVitalsMonitor() {
  useEffect(() => {
    // Track LCP (Largest Contentful Paint)
    onLCP((metric: Metric) => {
      reportMetric(metric);
    });

    // Track INP (Interaction to Next Paint - replaced FID)
    onINP((metric: Metric) => {
      reportMetric(metric);
    });

    // Track CLS (Cumulative Layout Shift)
    onCLS((metric: Metric) => {
      reportMetric(metric);
    });

    // Track TTFB (Time to First Byte)
    onTTFB((metric: Metric) => {
      reportMetric(metric);
    });

    // Track FCP (First Contentful Paint)
    onFCP((metric: Metric) => {
      reportMetric(metric);
    });
  }, []);

  return null; // This component doesn't render anything
}

export default EnhancedWebVitalsMonitor;
