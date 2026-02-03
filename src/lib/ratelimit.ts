/**
 * Distributed rate limiting using Upstash Redis for production
 * Falls back to in-memory rate limiting for development
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for development
const rateLimitStore = new Map<string, RateLimitEntry>();

// Initialize Upstash Redis client
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

// Initialize Redis and Ratelimit clients if environment variables are present
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create different rate limiters for different endpoints
    const limiters: Record<string, Ratelimit> = {
      api_posts: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60s"), // 10 requests per minute
      }),
      api_contact: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1h"), // 5 requests per hour
      }),
      api_newsletter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "24h"), // 3 requests per day
      }),
      api_comments: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60s"), // 5 requests per minute
      }),
      api_views: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "10s"), // 100 requests per 10 seconds
      }),
      api_auth_login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15m"), // 5 attempts per 15 minutes
      }),
      api_upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "60s"), // 20 requests per minute
      }),
    };

    // Use the most restrictive limiter as default
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "10s"), // Default: 100 requests per 10 seconds
    });

    // Export individual limiters
    (global as any).rateLimiters = limiters;
  } catch (error) {
    console.warn("Failed to initialize Upstash Redis, falling back to in-memory rate limiting:", error);
    redis = null;
    ratelimit = null;
  }
}

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
  api_upload: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
};

/**
 * Check if request is rate limited
 * Uses Upstash Redis in production, falls back to in-memory in development
 * Returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Use Upstash Redis if available
  if (ratelimit && redis) {
    const limiters = (global as any).rateLimiters as Record<string, Ratelimit> | undefined;
    const specificLimiter = limiters?.[endpoint];

    try {
      const result = await (specificLimiter || ratelimit).limit(`${endpoint}_${identifier}`);

      return {
        allowed: result.success,
        retryAfter: result.success ? undefined : Math.ceil(result.reset / 1000),
      };
    } catch (error) {
      console.warn(`Rate limiting error for ${endpoint}:${identifier}`, error);
      // If rate limiting fails, allow the request to go through to avoid blocking users
      return { allowed: true };
    }
  }

  // Fallback to in-memory rate limiting for development
  const config = DEFAULT_LIMITS[endpoint];

  if (!config) {
    return { allowed: true }; // No limit configured
  }

  const now = Date.now();
  const key = `${endpoint}:${identifier}`;

  const entry = rateLimitStore.get(key);

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
