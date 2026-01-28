/**
 * Application Monitoring Initialization
 * Centralizes all monitoring and error tracking setup
 */

import { initializeSentry } from "@/lib/sentry-config";

/**
 * Initialize all monitoring systems
 * Should be called once during application startup
 */
export function initializeMonitoring() {
  console.log("🔍 Initializing application monitoring...");

  // Initialize Sentry for error tracking
  try {
    initializeSentry();
    console.log("✅ Sentry error tracking initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Sentry:", error);
  }

  // Log monitoring endpoints available
  console.log("📊 Monitoring endpoints available:");
  console.log("  - GET /api/health");
  console.log("  - GET /api/metrics (with x-metrics-token header)");

  // Set up global error handlers
  setupGlobalErrorHandlers();
}

/**
 * Set up global error handlers for unhandled exceptions
 */
function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️  Unhandled Promise Rejection:", {
      reason,
      promise,
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("🔴 Uncaught Exception:", error);
    // In production, this would trigger a restart or alert
  });

  // Handle warning messages
  process.on("warning", (warning) => {
    console.warn("⚠️  Process Warning:", warning);
  });
}

/**
 * Health check for critical systems
 * Returns true if all critical systems are operational
 */
export async function runHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:3000/api/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Health check failed:", response.status);
      return false;
    }

    const data = await response.json();
    return data.status === "healthy";
  } catch (error) {
    console.error("❌ Health check error:", error);
    return false;
  }
}

// Initialize monitoring when module is loaded
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  // Only initialize in server-side production environment
  initializeMonitoring();
}

export default initializeMonitoring;
