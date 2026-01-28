"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "./GoogleAnalytics";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Google Analytics
    trackEvent(metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
        console.log(metric);
    }
  });

  return null;
}
