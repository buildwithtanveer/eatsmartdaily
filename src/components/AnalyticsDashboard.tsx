"use client";

import React, { useEffect, useState } from "react";
import { getSessionEvents, getAnalyticsSession } from "@/lib/analytics";
import {
  calculateWebVitalsScore,
  getPerformanceRecommendations,
} from "@/lib/analytics-config";

interface AnalyticsMetric {
  label: string;
  value: string | number;
  status: "good" | "warning" | "critical";
}

/**
 * Analytics Dashboard Component
 * Displays real-time analytics and monitoring data
 * Useful for development and debugging
 */
export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const updateMetrics = () => {
      const session = getAnalyticsSession();
      const events = getSessionEvents();

      const newMetrics: AnalyticsMetric[] = [];

      // Session metrics
      if (session) {
        newMetrics.push({
          label: "Session ID",
          value: session.sessionId.substring(0, 20) + "...",
          status: "good",
        });
        newMetrics.push({
          label: "Device",
          value: session.device,
          status: "good",
        });
        newMetrics.push({
          label: "UTM Source",
          value: session.utmSource || "Direct",
          status: "good",
        });
      }

      // Event metrics
      const adEvents = events.filter((e) => e.category === "ad");
      const formEvents = events.filter((e) => e.category === "form");
      const engagementEvents = events.filter(
        (e) => e.category === "engagement",
      );

      newMetrics.push({
        label: "Total Events",
        value: events.length,
        status: "good",
      });
      newMetrics.push({
        label: "Ad Events",
        value: adEvents.length,
        status: adEvents.length > 0 ? "good" : "warning",
      });
      newMetrics.push({
        label: "Form Events",
        value: formEvents.length,
        status: formEvents.length > 0 ? "good" : "warning",
      });
      newMetrics.push({
        label: "Engagement Events",
        value: engagementEvents.length,
        status: engagementEvents.length > 0 ? "good" : "warning",
      });

      // Ad CTR estimation
      const adImpressions = adEvents.filter(
        (e) => e.action === "impression",
      ).length;
      const adClicks = adEvents.filter((e) => e.action === "click").length;
      const ctr =
        adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(2) : 0;

      newMetrics.push({
        label: "Ad CTR",
        value: `${ctr}%`,
        status: parseFloat(String(ctr)) > 0.5 ? "good" : "warning",
      });

      setMetrics(newMetrics);
      setEventCount(events.length);
    };

    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: "good" | "warning" | "critical"): string => {
    switch (status) {
      case "good":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "critical":
        return "bg-red-50 border-red-200";
    }
  };

  const getStatusIndicator = (
    status: "good" | "warning" | "critical",
  ): string => {
    switch (status) {
      case "good":
        return "🟢";
      case "warning":
        return "🟡";
      case "critical":
        return "🔴";
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        📊 Analytics Dashboard
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {eventCount} events
        </span>
      </h3>

      <div className="space-y-2">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`p-2 rounded border ${getStatusColor(metric.status)}`}
          >
            <div className="flex justify-between items-start text-xs">
              <span className="font-medium text-gray-700">
                {getStatusIndicator(metric.status)} {metric.label}
              </span>
              <span className="text-gray-600 font-mono">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <p>Updated every 5 seconds</p>
        <p className="mt-1">Development only - Hidden in production</p>
      </div>
    </div>
  );
}
