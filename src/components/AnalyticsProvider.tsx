"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  initializeAnalytics,
  trackPageView,
  type PageAnalytics,
  type UserAnalytics,
} from "@/lib/analytics";

interface AnalyticsContextType {
  userAnalytics: UserAnalytics | null;
  isReady: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  userAnalytics: null,
  isReady: false,
});

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize analytics on first load
    const analytics = initializeAnalytics();
    setUserAnalytics(analytics);
    setIsReady(true);

    // Track initial page view
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const pageCategory = pathSegments[0] || "home";

    trackPageView({
      pageTitle: document.title,
      pageCategory,
    });
  }, []);

  return (
    <AnalyticsContext.Provider value={{ userAnalytics, isReady }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to use analytics context
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return context;
}

/**
 * Hook to track page metrics
 */
export function usePageTracking(pageData: PageAnalytics): void {
  useEffect(() => {
    trackPageView(pageData);
  }, [pageData.pageTitle, pageData.pageCategory]);
}
