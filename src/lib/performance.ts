/**
 * Performance Optimization Utilities
 * Handles image optimization, lazy loading, caching strategies, and Web Vitals monitoring
 */

/**
 * Image optimization configuration
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Image sizes for responsive design
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1024,
    xlarge: 1200,
  },
  // Quality settings for different formats
  quality: {
    webp: 80,
    jpeg: 85,
    png: 80,
  },
  // Blur placeholder dataURL dimensions
  blurHash: {
    width: 10,
    height: 10,
  },
};

/**
 * Generate srcset for responsive images
 */
export function generateImageSrcSet(
  imagePath: string,
  basePath: string = "",
): string {
  const path = basePath ? `${basePath}/${imagePath}` : imagePath;
  return [
    `${path}?w=300 300w`,
    `${path}?w=600 600w`,
    `${path}?w=1024 1024w`,
    `${path}?w=1200 1200w`,
  ].join(", ");
}

/**
 * Get optimal image size for viewport
 */
export function getOptimalImageSize(
  viewportWidth: number,
  maxWidth: number = 1200,
): number {
  if (viewportWidth <= 640) return 300;
  if (viewportWidth <= 1024) return 600;
  if (viewportWidth <= 1400) return 1024;
  return Math.min(1200, maxWidth);
}

/**
 * Cache configuration for different content types
 */
export const CACHE_CONTROL_HEADERS = {
  // Static assets - cache for 1 year
  staticAssets: "public, max-age=31536000, immutable",
  // CSS/JS bundles - cache for 1 month
  bundleAssets: "public, max-age=2592000",
  // HTML pages - cache for 24 hours, revalidate
  htmlPages:
    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
  // API responses - cache for 5 minutes
  apiResponses: "public, max-age=300, s-maxage=300",
  // Dynamic content - no cache
  dynamicContent: "no-cache, no-store, must-revalidate",
  // Images - cache for 30 days
  images: "public, max-age=2592000, s-maxage=2592000",
};

/**
 * Core Web Vitals thresholds (milliseconds/score)
 */
export const CORE_WEB_VITALS_TARGETS = {
  // LCP - Largest Contentful Paint
  lcp: {
    good: 2500,
    needsImprovement: 4000,
  },
  // FID - First Input Delay
  fid: {
    good: 100,
    needsImprovement: 300,
  },
  // CLS - Cumulative Layout Shift
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  // TTFB - Time to First Byte
  ttfb: {
    good: 600,
    needsImprovement: 1200,
  },
  // INP - Interaction to Next Paint (new metric replacing FID)
  inp: {
    good: 200,
    needsImprovement: 500,
  },
};

/**
 * Script loading strategy
 */
export enum ScriptStrategy {
  SYNC = "sync", // Block page render
  DEFER = "defer", // Load after page render
  ASYNC = "async", // Load in parallel, execute immediately
  LAZY = "lazy", // Load on interaction
}

/**
 * Get appropriate script loading strategy for different scripts
 */
export function getScriptLoadingStrategy(scriptType: string): ScriptStrategy {
  const strategies: Record<string, ScriptStrategy> = {
    analytics: ScriptStrategy.ASYNC,
    ads: ScriptStrategy.DEFER,
    tracking: ScriptStrategy.ASYNC,
    polyfills: ScriptStrategy.SYNC,
    critical: ScriptStrategy.SYNC,
    nonCritical: ScriptStrategy.DEFER,
  };
  return strategies[scriptType] || ScriptStrategy.DEFER;
}

/**
 * Performance budget configuration (in kilobytes)
 */
export const PERFORMANCE_BUDGET = {
  javascript: {
    total: 150, // Total JS bundle
    scripts: 50, // Third-party scripts
    analytics: 20, // Analytics script
  },
  css: {
    total: 30,
    critical: 10,
  },
  images: {
    initialLoad: 100, // Initial page images
    lazyLoaded: 200, // Deferred images
  },
  fonts: {
    total: 20,
  },
};

/**
 * Check if bundle exceeds performance budget
 */
export function checkPerformanceBudget(
  category: keyof typeof PERFORMANCE_BUDGET,
  size: number,
): {
  exceeds: boolean;
  percentage: number;
  budget: number;
} {
  const budget = PERFORMANCE_BUDGET[category] as Record<string, number>;
  const totalBudget =
    budget.total || Object.values(budget).reduce((a, b) => a + b, 0);
  const percentage = (size / totalBudget) * 100;

  return {
    exceeds: size > totalBudget,
    percentage,
    budget: totalBudget,
  };
}

/**
 * Lazy loading configuration
 */
export const LAZY_LOADING_CONFIG = {
  // Intersection Observer threshold
  threshold: 0.1,
  // Root margin for preloading (start loading before visible)
  rootMargin: "50px",
  // Images to lazy load
  lazyLoadImages: true,
  // Iframes to lazy load
  lazyLoadIframes: true,
  // Components to lazy load
  lazyLoadComponents: true,
};

/**
 * Get intersection observer options for lazy loading
 */
export function getLazyLoadingOptions(): IntersectionObserverInit {
  return {
    root: null,
    rootMargin: LAZY_LOADING_CONFIG.rootMargin,
    threshold: LAZY_LOADING_CONFIG.threshold,
  };
}

/**
 * Font loading strategy
 */
export const FONT_LOADING_STRATEGY = {
  display: "swap", // Show fallback immediately, swap when loaded
  preload: true,
  weights: [400, 500, 700],
  formats: ["woff2", "woff"], // Use modern formats
};

/**
 * Optimization recommendations based on metrics
 */
export function getPerformanceRecommendations(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}): string[] {
  const recommendations: string[] = [];

  if (metrics.lcp && metrics.lcp > CORE_WEB_VITALS_TARGETS.lcp.good) {
    recommendations.push(
      "🖼️ Optimize images - Use WebP format, implement lazy loading",
    );
    recommendations.push("⚡ Defer non-critical JavaScript");
    recommendations.push("💾 Implement caching strategy");
  }

  if (metrics.fid && metrics.fid > CORE_WEB_VITALS_TARGETS.fid.good) {
    recommendations.push("⚙️ Break up long JavaScript tasks (>50ms)");
    recommendations.push("🔄 Use Web Workers for heavy computations");
    recommendations.push("📦 Reduce bundle size");
  }

  if (metrics.cls && metrics.cls > CORE_WEB_VITALS_TARGETS.cls.good) {
    recommendations.push("📐 Set dimensions on images and videos");
    recommendations.push("❌ Avoid inserting content above fold");
    recommendations.push("🎨 Use CSS transforms instead of layout changes");
  }

  if (metrics.ttfb && metrics.ttfb > CORE_WEB_VITALS_TARGETS.ttfb.good) {
    recommendations.push("🚀 Upgrade hosting/server resources");
    recommendations.push("📍 Use Content Delivery Network (CDN)");
    recommendations.push("💾 Implement server-side caching");
  }

  return recommendations;
}

/**
 * Performance monitoring interface
 */
export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
  pageLoadTime?: number; // Total page load time
  domContentLoaded?: number; // DOM ready time
  firstContentfulPaint?: number; // FCP
}

/**
 * Calculate performance score (0-100)
 */
export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // LCP impact (25% of score)
  if (metrics.lcp) {
    const lcpScore = calculateMetricScore(
      metrics.lcp,
      CORE_WEB_VITALS_TARGETS.lcp.good,
      CORE_WEB_VITALS_TARGETS.lcp.needsImprovement,
    );
    score -= (100 - lcpScore) * 0.25;
  }

  // FID/INP impact (25% of score)
  const inputMetric = metrics.inp || metrics.fid;
  if (inputMetric) {
    const targetGood = metrics.inp
      ? CORE_WEB_VITALS_TARGETS.inp.good
      : CORE_WEB_VITALS_TARGETS.fid.good;
    const targetNeed = metrics.inp
      ? CORE_WEB_VITALS_TARGETS.inp.needsImprovement
      : CORE_WEB_VITALS_TARGETS.fid.needsImprovement;
    const inputScore = calculateMetricScore(
      inputMetric,
      targetGood,
      targetNeed,
    );
    score -= (100 - inputScore) * 0.25;
  }

  // CLS impact (25% of score)
  if (metrics.cls) {
    const clsScore = calculateMetricScore(
      metrics.cls * 1000, // Convert to milliseconds for comparison
      CORE_WEB_VITALS_TARGETS.cls.good * 1000,
      CORE_WEB_VITALS_TARGETS.cls.needsImprovement * 1000,
    );
    score -= (100 - clsScore) * 0.25;
  }

  // TTFB impact (25% of score)
  if (metrics.ttfb) {
    const ttfbScore = calculateMetricScore(
      metrics.ttfb,
      CORE_WEB_VITALS_TARGETS.ttfb.good,
      CORE_WEB_VITALS_TARGETS.ttfb.needsImprovement,
    );
    score -= (100 - ttfbScore) * 0.25;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Calculate individual metric score (0-100)
 */
function calculateMetricScore(
  metric: number,
  goodThreshold: number,
  needsImprovementThreshold: number,
): number {
  if (metric <= goodThreshold) {
    return 100;
  }

  if (metric >= needsImprovementThreshold) {
    return 0;
  }

  // Linear interpolation between good and needs improvement
  const percentage =
    (needsImprovementThreshold - metric) /
    (needsImprovementThreshold - goodThreshold);
  return Math.round(percentage * 100);
}

/**
 * Performance optimization checklist
 */
export const PERFORMANCE_CHECKLIST = {
  images: [
    "✅ Use WebP format with JPEG fallback",
    "✅ Set width and height attributes",
    "✅ Implement lazy loading (loading='lazy')",
    "✅ Use responsive images with srcset",
    "✅ Compress images (80-85% quality)",
    "✅ Use CDN for image delivery",
  ],
  javascript: [
    "✅ Minify and bundle JavaScript",
    "✅ Remove unused code (tree-shaking)",
    "✅ Defer non-critical scripts",
    "✅ Split code by routes",
    "✅ Use dynamic imports for large modules",
    "✅ Limit third-party script impact",
  ],
  css: [
    "✅ Minimize and compress CSS",
    "✅ Critical CSS inline in head",
    "✅ Defer non-critical CSS",
    "✅ Remove unused styles (PurgeCSS)",
    "✅ Use CSS-in-JS if needed",
  ],
  caching: [
    "✅ Set cache headers for static assets",
    "✅ Use service workers",
    "✅ Enable gzip compression",
    "✅ Leverage browser caching",
    "✅ Implement CDN caching",
  ],
  html: [
    "✅ Minify HTML",
    "✅ Preload critical resources",
    "✅ Prefetch DNS",
    "✅ Use semantic HTML",
    "✅ Optimize meta tags",
  ],
};

/**
 * Get performance optimization status
 */
export function getOptimizationStatus(
  category: keyof typeof PERFORMANCE_CHECKLIST,
): { completed: number; total: number; percentage: number } {
  const items = PERFORMANCE_CHECKLIST[category];
  const completed = items.filter((item) => item.startsWith("✅")).length;

  return {
    completed,
    total: items.length,
    percentage: Math.round((completed / items.length) * 100),
  };
}
