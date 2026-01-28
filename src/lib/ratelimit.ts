/**
 * Simple in-memory rate limiting for API routes
 * In production, use Upstash Redis for distributed rate limiting
 *
 * For now, we'll use a simple in-memory approach that's good for single-server setups
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // API endpoints
  api_posts: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  api_contact: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  api_newsletter: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 3 }, // 3 per day
  api_comments: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  api_views: { windowMs: 10 * 1000, maxRequests: 100 }, // 100 per 10 seconds (view tracking)
  api_auth_login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
};

/**
 * Check if request is rate limited
 * Returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
): { allowed: boolean; retryAfter?: number } {
  const config = DEFAULT_LIMITS[endpoint];

  if (!config) {
    return { allowed: true }; // No limit configured
  }

  const now = Date.now();
  const key = `${endpoint}:${identifier}`;

  let entry = rateLimitStore.get(key);

  // Initialize or reset if window expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  entry.count++;
  return { allowed: true };
}

/**
 * Get rate limit status for debugging
 */
export function getRateLimitStatus(identifier: string, endpoint: string) {
  const key = `${endpoint}:${identifier}`;
  return rateLimitStore.get(key);
}

/**
 * Reset rate limit for identifier (admin function)
 */
export function resetRateLimit(identifier: string, endpoint?: string) {
  if (endpoint) {
    const key = `${endpoint}:${identifier}`;
    rateLimitStore.delete(key);
  } else {
    // Reset all for identifier
    for (const key of rateLimitStore.keys()) {
      if (key.includes(identifier)) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Extract IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const ip = request.headers.get("x-real-ip");
  if (ip) {
    return ip;
  }

  // Fallback - in production use proper IP detection middleware
  return "unknown";
}

/**
 * Extract IP from Next.js headers()
 */
export function getClientIpFromHeaders(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const ip = headersList.get("x-real-ip");
  if (ip) {
    return ip;
  }

  return "unknown";
}

/**
 * Cleanup old entries periodically
 */
export function cleanupRateLimits() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 60 * 60 * 1000) {
      // Remove entries older than 1 hour after expiry
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Cleanup every 10 minutes
if (typeof global !== "undefined") {
  const globalWithCleanup = global as unknown as Record<string, any>;
  if (!globalWithCleanup.rateLimitCleanupInterval) {
    globalWithCleanup.rateLimitCleanupInterval = setInterval(
      cleanupRateLimits,
      10 * 60 * 1000,
    ) as unknown;
  }
}
