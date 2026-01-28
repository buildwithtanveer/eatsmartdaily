import { randomBytes } from "crypto";

/**
 * CSRF Token management
 * Uses simple token generation for protection against Cross-Site Request Forgery
 */

const CSRF_TOKENS = new Map<string, { token: string; timestamp: number }>();
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString("hex");
  const timestamp = Date.now();

  // Store token with timestamp
  CSRF_TOKENS.set(token, { token, timestamp });

  // Cleanup old tokens
  cleanupExpiredTokens();

  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  if (!token) return false;

  const stored = CSRF_TOKENS.get(token);

  if (!stored) return false;

  // Check expiry
  if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
    CSRF_TOKENS.delete(token);
    return false;
  }

  // Token is valid - remove it (single-use)
  CSRF_TOKENS.delete(token);

  return true;
}

/**
 * Cleanup expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();

  for (const [token, data] of CSRF_TOKENS.entries()) {
    if (now - data.timestamp > TOKEN_EXPIRY) {
      CSRF_TOKENS.delete(token);
    }
  }
}

/**
 * Get CSRF token from request headers
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  const header = request.headers.get("x-csrf-token");
  const cookie = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("csrf-token="));

  return header || (cookie ? cookie.split("=")[1] : null);
}

/**
 * Validate request for CSRF (use in API routes)
 */
export function validateRequestCsrf(request: Request): boolean {
  // Only validate non-GET requests
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const token = getCsrfTokenFromRequest(request);
  return validateCsrfToken(token || "");
}
