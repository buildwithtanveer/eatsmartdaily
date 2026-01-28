/**
 * Sentry Error Tracking Configuration
 * Initializes Sentry for comprehensive error tracking and performance monitoring
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

/**
 * Initialize Sentry with custom configuration
 * This should be called early in application startup
 */
export function initializeSentry() {
  if (!SENTRY_DSN) {
    console.warn(
      "⚠️  Sentry DSN not configured. Error tracking disabled. Set NEXT_PUBLIC_SENTRY_DSN environment variable.",
    );
    return;
  }

  Sentry.init({
    // Sentry project URL
    dsn: SENTRY_DSN,

    // Environment
    environment: ENVIRONMENT,

    // Enable tracing for performance monitoring
    tracesSampleRate:
      ENVIRONMENT === "production"
        ? 0.1 // Sample 10% in production
        : 1.0, // 100% in development

    // Debug mode
    debug: ENVIRONMENT !== "production",

    // Maximum breadcrumb size
    maxBreadcrumbs: 100,

    // Attach stack traces to all messages
    attachStacktrace: true,

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Chrome extensions
      "chrome://",
      // Firefox add-ons
      "moz-extension://",
      // safari extensions
      "safari-extension://",
      // Network errors that are typically not actionable
      /^NetworkError/,
      /^Network request failed/,
      // Ignore ResizeObserver errors (common in production)
      /^ResizeObserver loop limit exceeded/,
      // Ignore AbortError
      /^AbortError/,
      // Ignore DOM mutation observer errors
      /^MutationObserver/,
    ],

    // Denylisting URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-extension:\/\//i,
    ],

    // Server integration options
    integrations: [],

    // Release tracking (optional - set via CI/CD)
    release: process.env.GIT_COMMIT_SHA || undefined,

    // Before sending event to Sentry
    beforeSend(event, hint) {
      // Filter out 404 errors from API routes
      if (
        event.request?.url?.includes("/api/") &&
        event.exception?.values?.[0]?.value?.includes("404")
      ) {
        return null;
      }

      // Don't send events from localhost in development
      if (
        ENVIRONMENT === "development" &&
        event.request?.url?.includes("localhost")
      ) {
        return event; // Still log them but don't sample
      }

      return event;
    },

    // Capture context
    initialScope: {
      tags: {
        component: "nextjs",
        server: "true",
      },
    },
  });
}

/**
 * Log an exception to Sentry
 */
export function captureException(
  error: Error | string,
  context?: Record<string, any>,
) {
  if (!SENTRY_DSN) return;

  if (typeof error === "string") {
    Sentry.captureException(new Error(error), { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
}

/**
 * Capture a message with severity level
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Record<string, any>,
) {
  if (!SENTRY_DSN) return;

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, email?: string, name?: string) {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
}

/**
 * Set custom tags for error grouping
 */
export function setSentryTag(key: string, value: string) {
  if (!SENTRY_DSN) return;

  Sentry.setTag(key, value);
}

/**
 * Set breadcrumb for error context
 */
export function addSentryBreadcrumb(
  message: string,
  category: string = "user-action",
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  data?: Record<string, any>,
) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a performance transaction
 * (Note: Transaction creation is handled automatically in newer Sentry versions)
 */
export function startPerformanceTransaction(
  name: string,
  op: string = "http.request",
) {
  if (!SENTRY_DSN) return null;

  // Transactions are handled automatically by Sentry integration
  // This function is here for future compatibility
  return {
    name,
    op,
    startTime: Date.now(),
  };
}

/**
 * Get Sentry instance for advanced usage
 */
export { Sentry };
