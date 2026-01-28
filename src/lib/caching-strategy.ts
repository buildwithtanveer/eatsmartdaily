/**
 * Caching Strategy and HTTP Cache Headers
 * Implements best practices for browser and server-side caching
 */

/**
 * Cache header values for different resource types
 */
export const CACHE_HEADERS = {
  // Static assets - Cache for 1 year (31536000 seconds)
  // These are immutable and versioned by Next.js
  staticAssets: {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },

  // JavaScript/CSS bundles - Cache for 30 days
  // Can be updated, so we use stale-while-revalidate
  bundleAssets: {
    key: "Cache-Control",
    value:
      "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800",
  },

  // HTML pages - Cache for 24 hours with revalidation
  // Allows CDN to serve stale content while revalidating
  htmlPages: {
    key: "Cache-Control",
    value:
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
  },

  // API responses - Cache for 5 minutes
  // Short-lived cache for dynamic data
  apiResponses: {
    key: "Cache-Control",
    value: "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
  },

  // Images - Cache for 30 days
  // Static images can be cached longer
  images: {
    key: "Cache-Control",
    value: "public, max-age=2592000, s-maxage=2592000, immutable",
  },

  // Dynamic/user-specific content - No cache
  dynamicContent: {
    key: "Cache-Control",
    value: "no-cache, no-store, must-revalidate, private",
  },

  // Admin/authenticated pages - No cache
  adminPages: {
    key: "Cache-Control",
    value: "private, no-cache, no-store, must-revalidate",
  },
};

/**
 * Compression headers
 */
export const COMPRESSION_HEADERS = {
  // Enable brotli and gzip compression
  contentEncoding: {
    key: "Content-Encoding",
    value: "gzip, br",
  },

  // Specify accepted compression methods
  acceptEncoding: {
    key: "Accept-Encoding",
    value: "gzip, deflate, br",
  },
};

/**
 * Get cache headers for a specific content type
 */
export function getCacheHeadersForPath(
  pathname: string,
): Record<string, string> {
  // Admin pages
  if (pathname.startsWith("/admin")) {
    return CACHE_HEADERS.adminPages;
  }

  // API routes
  if (pathname.startsWith("/api")) {
    return CACHE_HEADERS.apiResponses;
  }

  // Static assets
  if (/\.(js|css|woff2|woff|ttf|eot|otf)$/.test(pathname)) {
    return CACHE_HEADERS.bundleAssets;
  }

  // Images
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/.test(pathname)) {
    return CACHE_HEADERS.images;
  }

  // HTML pages and routes
  return CACHE_HEADERS.htmlPages;
}

/**
 * CDN cache control headers
 */
export const CDN_CACHE_CONTROL = {
  // Cache at CDN level for 1 hour, client cache for 1 day
  htmlDefault:
    "public, max-age=86400, s-maxage=3600, stale-while-revalidate=604800",

  // Cache at CDN level for 1 week, client cache for 1 month
  assetsDefault:
    "public, max-age=2592000, s-maxage=604800, stale-while-revalidate=604800",

  // Cache at CDN level for 1 minute, client cache for 5 minutes
  apiDefault: "public, max-age=300, s-maxage=60, stale-while-revalidate=60",
};

/**
 * Etag and Last-Modified headers for cache validation
 */
export function generateETag(content: string): string {
  const hash = require("crypto")
    .createHash("md5")
    .update(content)
    .digest("hex");
  return `"${hash}"`;
}

/**
 * Cache invalidation strategies
 */
export const CACHE_INVALIDATION_STRATEGIES = {
  // On-Demand Revalidation - Trigger cache refresh programmatically
  onDemand: "on-demand-isr",

  // Time-based Revalidation - ISR with specific interval
  timeBased: (seconds: number) => `time-based-isr-${seconds}s`,

  // Event-based Revalidation - Invalidate on database changes
  eventBased: "event-based-isr",

  // Manual Revalidation - Invalidate via API
  manual: "manual-revalidation",
};

/**
 * Service Worker caching strategies
 */
export enum CachingStrategy {
  // Cache first, fallback to network
  CACHE_FIRST = "CacheFirst",

  // Network first, fallback to cache
  NETWORK_FIRST = "NetworkFirst",

  // Cache and network race
  STALE_WHILE_REVALIDATE = "StaleWhileRevalidate",

  // Network only
  NETWORK_ONLY = "NetworkOnly",

  // Cache only
  CACHE_ONLY = "CacheOnly",
}

/**
 * Get optimal caching strategy for different resource types
 */
export function getOptimalCachingStrategy(
  resourceType: string,
): CachingStrategy {
  const strategies: Record<string, CachingStrategy> = {
    // Images - Cache first, rarely changes
    images: CachingStrategy.CACHE_FIRST,

    // Scripts/Styles - Cache first, versioned
    scripts: CachingStrategy.CACHE_FIRST,
    styles: CachingStrategy.CACHE_FIRST,

    // API data - Network first, fallback to cache
    api: CachingStrategy.NETWORK_FIRST,
    data: CachingStrategy.NETWORK_FIRST,

    // HTML pages - Stale while revalidate
    html: CachingStrategy.STALE_WHILE_REVALIDATE,
    pages: CachingStrategy.STALE_WHILE_REVALIDATE,

    // Fonts - Cache first, rarely changes
    fonts: CachingStrategy.CACHE_FIRST,
  };

  return strategies[resourceType] || CachingStrategy.NETWORK_FIRST;
}

/**
 * Cache configuration for different scenarios
 */
export const CACHE_CONFIG = {
  // Blog posts - Cache for 1 day at CDN, 1 hour at client
  blogPost: {
    maxAge: 3600, // Client cache
    sMaxAge: 86400, // CDN cache
    staleWhileRevalidate: 604800, // 1 week
  },

  // Product pages - Cache for 6 hours at CDN, 30 minutes at client
  productPage: {
    maxAge: 1800,
    sMaxAge: 21600,
    staleWhileRevalidate: 86400,
  },

  // Search results - Don't cache (dynamic)
  searchResults: {
    maxAge: 0,
    sMaxAge: 0,
  },

  // User profile - Don't cache (personal)
  userProfile: {
    maxAge: 0,
    sMaxAge: 0,
  },

  // Public data - Cache for 7 days at CDN, 1 day at client
  publicData: {
    maxAge: 86400,
    sMaxAge: 604800,
    staleWhileRevalidate: 604800,
  },

  // Static pages - Cache for 1 month at CDN, 1 week at client
  staticPage: {
    maxAge: 604800,
    sMaxAge: 2592000,
    staleWhileRevalidate: 2592000,
  },
};

/**
 * Format cache control header value
 */
export function formatCacheControlHeader(config: {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
  public?: boolean;
  private?: boolean;
  immutable?: boolean;
}): string {
  const directives: string[] = [];

  if (config.public) directives.push("public");
  if (config.private) directives.push("private");
  if (config.maxAge !== undefined) directives.push(`max-age=${config.maxAge}`);
  if (config.sMaxAge !== undefined)
    directives.push(`s-maxage=${config.sMaxAge}`);
  if (config.staleWhileRevalidate !== undefined)
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  if (config.staleIfError !== undefined)
    directives.push(`stale-if-error=${config.staleIfError}`);
  if (config.immutable) directives.push("immutable");

  return directives.join(", ");
}

/**
 * Prefetch strategy for links
 */
export const PREFETCH_STRATEGIES = {
  // Prefetch immediately
  immediate: true,

  // Prefetch on hover
  hover: "hover",

  // Prefetch when visible
  visible: "visible",

  // Don't prefetch
  none: false,
};

/**
 * Preload resources for critical rendering path
 */
export const PRELOAD_RESOURCES = {
  // Preload critical fonts
  fonts: [
    {
      href: "/fonts/dm-sans-400.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
    {
      href: "/fonts/dm-sans-700.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
  ],

  // Preload critical stylesheets
  styles: [
    {
      href: "/css/critical.css",
      rel: "preload",
      as: "style",
    },
  ],

  // Preload critical scripts
  scripts: [
    {
      href: "/js/critical.js",
      rel: "preload",
      as: "script",
    },
  ],
};

/**
 * DNS prefetch for external resources
 */
export const DNS_PREFETCH = [
  "//fonts.googleapis.com",
  "//fonts.gstatic.com",
  "//www.googletagmanager.com",
  "//www.google-analytics.com",
  "//pagead2.googlesyndication.com",
  "//googleads.g.doubleclick.net",
  "//cdnjs.cloudflare.com",
  "//cdn.jsdelivr.net",
];

/**
 * Preconnect to external resources
 */
export const PRECONNECT = [
  {
    href: "https://fonts.googleapis.com",
    rel: "preconnect",
  },
  {
    href: "https://fonts.gstatic.com",
    rel: "preconnect",
    crossOrigin: "anonymous",
  },
  {
    href: "https://www.googletagmanager.com",
    rel: "preconnect",
  },
];
