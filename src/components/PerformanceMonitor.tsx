"use client";

import { useEffect, useState } from "react";
import {
  calculatePerformanceScore,
  getPerformanceRecommendations,
  CORE_WEB_VITALS_TARGETS,
  type PerformanceMetrics,
} from "@/lib/performance";

interface PerformanceMonitorState {
  metrics: PerformanceMetrics;
  score: number;
  recommendations: string[];
  status: "good" | "needs-improvement" | "poor";
}

/**
 * PerformanceMonitor Component
 * Tracks Core Web Vitals and provides real-time performance monitoring
 * Visible only in development mode
 */
export default function PerformanceMonitor(): null {
  const [performanceData, setPerformanceData] =
    useState<PerformanceMonitorState | null>(null);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "development" ||
      typeof window === "undefined"
    ) {
      return;
    }

    // Get navigation timing
    const navigationStart = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (!navigationStart) return;

    const metrics: PerformanceMetrics = {
      pageLoadTime: navigationStart.loadEventEnd - navigationStart.fetchStart,
      domContentLoaded:
        navigationStart.domContentLoadedEventEnd - navigationStart.fetchStart,
      firstContentfulPaint: undefined,
      ttfb: navigationStart.responseStart - navigationStart.fetchStart,
    };

    // Get FCP (First Contentful Paint)
    const fcpEntries = performance.getEntriesByType("paint");
    const fcp = fcpEntries.find(
      (entry) => entry.name === "first-contentful-paint",
    );
    if (fcp) {
      metrics.firstContentfulPaint = fcp.startTime;
    }

    // Get LCP (Largest Contentful Paint) using PerformanceObserver
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
          };

          const lcpValue = lastEntry.renderTime
            ? lastEntry.renderTime
            : (lastEntry as any).loadTime;
          if (lcpValue) {
            metrics.lcp = lcpValue;
            updatePerformanceData();
          }
        });

        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // Get CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsValue += (entry as any).value;
          }
          metrics.cls = clsValue;
          updatePerformanceData();
        });

        clsObserver.observe({ entryTypes: ["layout-shift"] });

        // Get FID/INP (First/Interaction Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            processingDuration?: number;
          };

          if (lastEntry.processingDuration) {
            metrics.fid = lastEntry.processingDuration;
            updatePerformanceData();
          }
        });

        fidObserver.observe({
          entryTypes: ["first-input", "largest-contentful-paint"],
        });

        // Set initial metrics
        updatePerformanceData();

        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        };
      } catch (error) {
        console.error("Performance monitoring error:", error);
      }
    }

    function updatePerformanceData() {
      const score = calculatePerformanceScore(metrics);
      const recommendations = getPerformanceRecommendations(metrics);

      let status: "good" | "needs-improvement" | "poor" = "good";
      if (
        (metrics.lcp &&
          metrics.lcp > CORE_WEB_VITALS_TARGETS.lcp.needsImprovement) ||
        (metrics.fid &&
          metrics.fid > CORE_WEB_VITALS_TARGETS.fid.needsImprovement) ||
        (metrics.cls &&
          metrics.cls > CORE_WEB_VITALS_TARGETS.cls.needsImprovement)
      ) {
        status = "poor";
      } else if (
        (metrics.lcp && metrics.lcp > CORE_WEB_VITALS_TARGETS.lcp.good) ||
        (metrics.fid && metrics.fid > CORE_WEB_VITALS_TARGETS.fid.good) ||
        (metrics.cls && metrics.cls > CORE_WEB_VITALS_TARGETS.cls.good)
      ) {
        status = "needs-improvement";
      }

      setPerformanceData({
        metrics,
        score,
        recommendations,
        status,
      });

      // Log performance data in development
      console.log("[Performance Monitor]", {
        score,
        metrics,
        status,
        recommendations,
      });
    }
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== "development" || !performanceData) {
    return null;
  }

  return null; // Silent monitoring - use console for debugging
}

/**
 * Hook to use performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const navigationStart = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (!navigationStart) return;

    const data: PerformanceMetrics = {
      pageLoadTime: navigationStart.loadEventEnd - navigationStart.fetchStart,
      domContentLoaded:
        navigationStart.domContentLoadedEventEnd - navigationStart.fetchStart,
      ttfb: navigationStart.responseStart - navigationStart.fetchStart,
    };

    setMetrics(data);
  }, []);

  return {
    metrics,
    score: calculatePerformanceScore(metrics),
    recommendations: getPerformanceRecommendations(metrics),
  };
}
