"use client";

import { useEffect } from "react";
import { trackPerformanceMetrics } from "@/lib/analytics";
import {
  calculateWebVitalsScore,
  getPerformanceRecommendations,
} from "@/lib/analytics-config";

/**
 * Web Vitals Monitoring Component
 * Tracks Core Web Vitals and sends to analytics
 */
export default function WebVitalsMonitor() {
  useEffect(() => {
    // Check for Web Vitals API support
    if ("web-vital" in window) return;

    // Measure Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        const lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);

        // Send to analytics
        trackPerformanceMetrics({
          lcpValue: lcp,
        });

        // Log in development
        if (process.env.NODE_ENV === "development") {
          console.log(`[Web Vitals] LCP: ${lcp}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // LCP not supported
    }

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).hadRecentInput) continue;

        clsValue += (entry as any).value;
      }

      trackPerformanceMetrics({
        clsValue: Math.round(clsValue * 10000) / 10000,
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`[Web Vitals] CLS: ${clsValue}`);
      }
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // CLS not supported
    }

    // Measure First Input Delay (FID) - deprecated but still useful
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = Math.round((entry as any).processingDuration);

        trackPerformanceMetrics({
          fidValue: fid,
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`[Web Vitals] FID: ${fid}ms`);
        }
      }
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // FID not supported
    }

    // Measure Time to First Byte (TTFB)
    const navigationTiming = performance.getEntriesByType(
      "navigation",
    )[0] as any;
    if (navigationTiming) {
      const ttfb = Math.round(
        navigationTiming.responseStart - navigationTiming.fetchStart,
      );

      trackPerformanceMetrics({ ttl: ttfb });

      if (process.env.NODE_ENV === "development") {
        console.log(`[Web Vitals] TTFB: ${ttfb}ms`);
      }
    }

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  return null; // This component only monitors, doesn't render
}
