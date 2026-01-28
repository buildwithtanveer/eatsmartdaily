/**
 * Analytics Configuration & Monitoring
 * Real-time metrics, thresholds, and optimization rules
 */

export interface AnalyticsThreshold {
  name: string;
  metric: string;
  threshold: number;
  operator: ">" | "<" | "==" | "!=";
  severity: "info" | "warning" | "critical";
  action?: string;
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  eventCount: number;
  adImpressions: number;
  adClicks: number;
  adCTR: number;
  formSubmissions: number;
  formConversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  timestamp: number;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (0-1)
  ttfb: number; // Time to First Byte (ms)
}

/**
 * Analytics Thresholds for Monitoring
 */
export const ANALYTICS_THRESHOLDS: AnalyticsThreshold[] = [
  // Performance Thresholds
  {
    name: "Page Load Time",
    metric: "page_load_time",
    threshold: 3000,
    operator: ">",
    severity: "warning",
    action: "Investigate page performance",
  },
  {
    name: "LCP (Largest Contentful Paint)",
    metric: "lcp",
    threshold: 2500,
    operator: ">",
    severity: "critical",
    action: "Optimize image loading and scripts",
  },
  {
    name: "FID (First Input Delay)",
    metric: "fid",
    threshold: 100,
    operator: ">",
    severity: "warning",
    action: "Reduce JavaScript execution",
  },
  {
    name: "CLS (Cumulative Layout Shift)",
    metric: "cls",
    threshold: 0.1,
    operator: ">",
    severity: "critical",
    action: "Fix layout shifts on page",
  },

  // Ad Performance Thresholds
  {
    name: "Ad CTR Below Target",
    metric: "ad_ctr",
    threshold: 0.005,
    operator: "<",
    severity: "warning",
    action: "Review ad placements and sizes",
  },
  {
    name: "Ad Impression Rate Low",
    metric: "ad_impression_rate",
    threshold: 0.8,
    operator: "<",
    severity: "info",
    action: "Consider increasing ad density",
  },

  // Conversion Thresholds
  {
    name: "Form Submission Rate Low",
    metric: "form_conversion_rate",
    threshold: 0.05,
    operator: "<",
    severity: "warning",
    action: "Review form fields and UX",
  },
  {
    name: "Newsletter Signup Rate Low",
    metric: "newsletter_signup_rate",
    threshold: 0.02,
    operator: "<",
    severity: "info",
    action: "A/B test newsletter call-to-action",
  },

  // Bounce Rate
  {
    name: "Bounce Rate Too High",
    metric: "bounce_rate",
    threshold: 0.6,
    operator: ">",
    severity: "warning",
    action: "Improve landing page content",
  },

  // Error Thresholds
  {
    name: "Error Rate Too High",
    metric: "error_rate",
    threshold: 0.05,
    operator: ">",
    severity: "critical",
    action: "Check server logs and error tracking",
  },
];

/**
 * Core Web Vitals Benchmarks (Good/Needs Improvement)
 */
export const WEB_VITALS_BENCHMARKS = {
  lcp: {
    good: 2500, // 2.5s
    needsImprovement: 4000, // 4s
  },
  fid: {
    good: 100, // 100ms
    needsImprovement: 300, // 300ms
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  ttfb: {
    good: 600, // 600ms
    needsImprovement: 1800, // 1.8s
  },
};

/**
 * Event Tracking Definitions
 */
export const EVENT_DEFINITIONS = {
  // Page Events
  page_view: {
    description: "User viewed a page",
    category: "navigation",
    priority: "high",
  },
  page_engagement: {
    description: "User engaged with page content (scroll, click)",
    category: "engagement",
    priority: "medium",
  },

  // Ad Events
  ad_impression: {
    description: "Ad became visible to user",
    category: "ad",
    priority: "high",
  },
  ad_click: {
    description: "User clicked on an ad",
    category: "ad",
    priority: "high",
  },
  ad_view_duration: {
    description: "How long user viewed an ad",
    category: "ad",
    priority: "medium",
  },

  // Form Events
  form_start: {
    description: "User started filling out a form",
    category: "conversion",
    priority: "high",
  },
  form_submit: {
    description: "User submitted a form",
    category: "conversion",
    priority: "high",
  },
  form_error: {
    description: "Form validation error occurred",
    category: "error",
    priority: "medium",
  },

  // Comment Events
  comment_start: {
    description: "User started writing a comment",
    category: "engagement",
    priority: "medium",
  },
  comment_submit: {
    description: "User submitted a comment",
    category: "engagement",
    priority: "high",
  },

  // Newsletter Events
  newsletter_signup: {
    description: "User subscribed to newsletter",
    category: "conversion",
    priority: "high",
  },
  newsletter_view_cta: {
    description: "User viewed newsletter CTA",
    category: "engagement",
    priority: "medium",
  },

  // Search Events
  search_performed: {
    description: "User performed a search",
    category: "search",
    priority: "medium",
  },
  search_result_click: {
    description: "User clicked on search result",
    category: "search",
    priority: "high",
  },

  // Share Events
  content_shared: {
    description: "User shared content",
    category: "engagement",
    priority: "high",
  },

  // Error Events
  error_occurred: {
    description: "JavaScript or application error",
    category: "error",
    priority: "critical",
  },
};

/**
 * Get event priority weight for sorting/filtering
 */
export function getEventPriority(eventName: string): number {
  const definition =
    EVENT_DEFINITIONS[eventName as keyof typeof EVENT_DEFINITIONS];
  if (!definition) return 0;

  const priorityMap = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return priorityMap[definition.priority as keyof typeof priorityMap] || 0;
}

/**
 * Check if metric violates any threshold
 */
export function checkThresholdViolation(
  metric: string,
  value: number,
): AnalyticsThreshold | null {
  for (const threshold of ANALYTICS_THRESHOLDS) {
    if (threshold.metric !== metric) continue;

    let violated = false;
    switch (threshold.operator) {
      case ">":
        violated = value > threshold.threshold;
        break;
      case "<":
        violated = value < threshold.threshold;
        break;
      case "==":
        violated = value === threshold.threshold;
        break;
      case "!=":
        violated = value !== threshold.threshold;
        break;
    }

    if (violated) return threshold;
  }

  return null;
}

/**
 * Calculate Core Web Vitals score
 * Returns 0-100 based on all metrics
 */
export function calculateWebVitalsScore(
  metrics: Partial<CoreWebVitals>,
): number {
  let score = 0;
  let count = 0;

  if (metrics.lcp !== undefined) {
    const lcpScore =
      metrics.lcp <= WEB_VITALS_BENCHMARKS.lcp.good
        ? 100
        : metrics.lcp <= WEB_VITALS_BENCHMARKS.lcp.needsImprovement
          ? 50
          : 0;
    score += lcpScore;
    count++;
  }

  if (metrics.fid !== undefined) {
    const fidScore =
      metrics.fid <= WEB_VITALS_BENCHMARKS.fid.good
        ? 100
        : metrics.fid <= WEB_VITALS_BENCHMARKS.fid.needsImprovement
          ? 50
          : 0;
    score += fidScore;
    count++;
  }

  if (metrics.cls !== undefined) {
    const clsScore =
      metrics.cls <= WEB_VITALS_BENCHMARKS.cls.good
        ? 100
        : metrics.cls <= WEB_VITALS_BENCHMARKS.cls.needsImprovement
          ? 50
          : 0;
    score += clsScore;
    count++;
  }

  if (metrics.ttfb !== undefined) {
    const ttfbScore =
      metrics.ttfb <= WEB_VITALS_BENCHMARKS.ttfb.good
        ? 100
        : metrics.ttfb <= WEB_VITALS_BENCHMARKS.ttfb.needsImprovement
          ? 50
          : 0;
    score += ttfbScore;
    count++;
  }

  return count > 0 ? Math.round(score / count) : 0;
}

/**
 * Get recommendations based on metrics
 */
export function getPerformanceRecommendations(
  metrics: Partial<CoreWebVitals>,
): string[] {
  const recommendations: string[] = [];

  if (metrics.lcp && metrics.lcp > WEB_VITALS_BENCHMARKS.lcp.needsImprovement) {
    recommendations.push(
      "Optimize images with Next.js Image component and lazy loading",
    );
    recommendations.push("Minimize render-blocking CSS and JavaScript");
    recommendations.push("Use a Content Delivery Network (CDN)");
  }

  if (metrics.fid && metrics.fid > WEB_VITALS_BENCHMARKS.fid.needsImprovement) {
    recommendations.push("Break up long JavaScript tasks");
    recommendations.push("Defer non-critical JavaScript");
    recommendations.push("Use Web Workers for heavy computations");
  }

  if (metrics.cls && metrics.cls > WEB_VITALS_BENCHMARKS.cls.needsImprovement) {
    recommendations.push("Reserve space for dynamic content");
    recommendations.push("Avoid inserting content above existing content");
    recommendations.push("Use transform animations instead of layout changes");
  }

  if (
    metrics.ttfb &&
    metrics.ttfb > WEB_VITALS_BENCHMARKS.ttfb.needsImprovement
  ) {
    recommendations.push("Upgrade server infrastructure");
    recommendations.push("Implement database query optimization");
    recommendations.push("Use caching strategies effectively");
  }

  return recommendations;
}

/**
 * Revenue impact estimator based on ad metrics
 */
export function estimateRevenueImpact(
  dailyTraffic: number,
  adCTR: number,
  cpc: number,
): {
  dailyClicks: number;
  dailyRevenue: number;
  monthlyRevenue: number;
} {
  const dailyClicks = Math.round(dailyTraffic * adCTR);
  const dailyRevenue = dailyClicks * cpc;
  const monthlyRevenue = dailyRevenue * 30;

  return {
    dailyClicks,
    dailyRevenue,
    monthlyRevenue,
  };
}

/**
 * Estimate improvement potential
 */
export function estimateImprovementPotential(
  currentMetric: number,
  targetMetric: number,
  metricType: string,
): {
  percentageImprovement: number;
  potentialRevenue?: number;
} {
  const percentageImprovement =
    ((currentMetric - targetMetric) / currentMetric) * 100;

  // For CTR improvements, estimate revenue impact
  let potentialRevenue;
  if (metricType === "ad_ctr") {
    const dailyTraffic = 10000; // baseline
    const cpc = 0.5; // baseline
    const currentRevenue = estimateRevenueImpact(
      dailyTraffic,
      currentMetric,
      cpc,
    ).monthlyRevenue;
    const targetRevenue = estimateRevenueImpact(
      dailyTraffic,
      targetMetric,
      cpc,
    ).monthlyRevenue;
    potentialRevenue = targetRevenue - currentRevenue;
  }

  return {
    percentageImprovement: Math.round(percentageImprovement * 100) / 100,
    potentialRevenue,
  };
}
