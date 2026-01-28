"use client";

import { SessionProvider } from "next-auth/react";
import { AnalyticsProvider } from "./AnalyticsProvider";
import WebVitalsMonitor from "./WebVitalsMonitor";
import PerformanceMonitor from "./PerformanceMonitor";
import EnhancedWebVitalsMonitor from "./EnhancedWebVitalsMonitor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        <WebVitalsMonitor />
        <PerformanceMonitor />
        <EnhancedWebVitalsMonitor />
        {children}
      </AnalyticsProvider>
    </SessionProvider>
  );
}
