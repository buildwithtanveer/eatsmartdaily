/**
 * Comprehensive Analytics System
 * Handles GA4 integration, event tracking, and real-time monitoring
 */

export type EventCategory =
  | "engagement"
  | "conversion"
  | "ad"
  | "search"
  | "navigation"
  | "form"
  | "content"
  | "error"
  | "performance";

export type EventAction =
  | "view"
  | "click"
  | "submit"
  | "impression"
  | "error"
  | "completion"
  | "scroll"
  | "share"
  | "search";

export interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
  timestamp?: number;
}

export interface PageAnalytics {
  pageTitle: string;
  pageCategory: string;
  contentLength?: number; // words
  estimatedReadTime?: number; // seconds
  authorId?: string;
  tags?: string[];
}

export interface UserAnalytics {
  sessionId: string;
  userId?: string;
  device: "mobile" | "tablet" | "desktop";
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Initialize analytics session
 * Call this once on app load
 */
export function initializeAnalytics(): UserAnalytics {
  const sessionId = generateSessionId();
  const device = detectDevice();
  const referrer = getReferrer();
  const utmParams = parseUtmParams();

  const userAnalytics: UserAnalytics = {
    sessionId,
    device,
    referrer,
    ...utmParams,
  };

  // Store in sessionStorage for the session
  if (typeof window !== "undefined") {
    sessionStorage.setItem("analytics_session", JSON.stringify(userAnalytics));
  }

  return userAnalytics;
}

/**
 * Get current analytics session
 */
export function getAnalyticsSession(): UserAnalytics | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem("analytics_session");
  return stored ? JSON.parse(stored) : null;
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || !window.gtag) return;

  const enrichedEvent: Record<string, any> = {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.customData,
  };

  // Remove undefined values
  Object.keys(enrichedEvent).forEach(
    (key) => enrichedEvent[key] === undefined && delete enrichedEvent[key],
  );

  window.gtag("event", event.action, enrichedEvent);

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event.action, enrichedEvent);
  }
}

/**
 * Track page view with metadata
 */
export function trackPageView(pageData: PageAnalytics): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_title: pageData.pageTitle,
    page_category: pageData.pageCategory,
    content_length: pageData.contentLength,
    estimated_read_time: pageData.estimatedReadTime,
    author_id: pageData.authorId,
    tags: pageData.tags?.join(","),
  });
}

/**
 * Track ad impression
 */
export function trackAdImpression(
  adId: string,
  placement: string,
  variant?: string,
): void {
  trackEvent({
    category: "ad",
    action: "impression",
    label: `${placement}:${variant || "default"}`,
    customData: {
      ad_id: adId,
      placement,
      variant,
    },
  });
}

/**
 * Track ad click
 */
export function trackAdClick(
  adId: string,
  placement: string,
  variant?: string,
): void {
  trackEvent({
    category: "ad",
    action: "click",
    label: `${placement}:${variant || "default"}`,
    value: 1,
    customData: {
      ad_id: adId,
      placement,
      variant,
    },
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(
  formName: string,
  success: boolean,
  fields?: number,
): void {
  trackEvent({
    category: "form",
    action: success ? "completion" : "error",
    label: formName,
    value: fields,
    customData: {
      form_name: formName,
      submission_status: success ? "success" : "failed",
      fields_submitted: fields,
    },
  });
}

/**
 * Track content engagement
 */
export function trackContentEngagement(
  contentId: string,
  engagementType: "scroll" | "click" | "share" | "impression",
  metadata?: Record<string, any>,
): void {
  trackEvent({
    category: "engagement",
    action: engagementType as EventAction,
    label: contentId,
    customData: {
      content_id: contentId,
      engagement_type: engagementType,
      ...metadata,
    },
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, results: number): void {
  trackEvent({
    category: "search",
    action: "search",
    label: query,
    value: results,
    customData: {
      search_query: query,
      search_results: results,
    },
  });
}

/**
 * Track comment submission
 */
export function trackCommentSubmission(postId: string, success: boolean): void {
  trackEvent({
    category: "engagement",
    action: "click",
    label: `comment:${postId}`,
    customData: {
      post_id: postId,
      action: "comment_submitted",
      success,
    },
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source: string): void {
  trackEvent({
    category: "conversion",
    action: "completion",
    label: "newsletter_signup",
    customData: {
      conversion_type: "newsletter_signup",
      signup_source: source,
    },
  });
}

/**
 * Track performance metrics
 */
export function trackPerformanceMetrics(metrics: {
  lcpValue?: number;
  fidValue?: number;
  clsValue?: number;
  ttl?: number;
}): void {
  trackEvent({
    category: "performance",
    action: "view",
    label: "core_web_vitals",
    customData: {
      lcp: metrics.lcpValue,
      fid: metrics.fidValue,
      cls: metrics.clsValue,
      ttl: metrics.ttl,
    },
  });
}

/**
 * Track errors
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>,
): void {
  trackEvent({
    category: "error",
    action: "error",
    label: errorType,
    customData: {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    },
  });
}

/**
 * Get estimated read time in seconds
 */
export function estimateReadTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.round((wordCount / wordsPerMinute) * 60);
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Detect device type
 */
function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

/**
 * Get referrer
 */
function getReferrer(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.referrer || undefined;
}

/**
 * Parse UTM parameters from URL
 */
function parseUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
  };
}

/**
 * Get all analytics events from session
 * Useful for debugging or exporting data
 */
export function getSessionEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];

  const stored = sessionStorage.getItem("analytics_events");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Clear session events
 */
export function clearSessionEvents(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("analytics_events");
}

/**
 * Export session data
 */
export function exportSessionData(): {
  session: UserAnalytics | null;
  events: AnalyticsEvent[];
  timestamp: number;
} {
  return {
    session: getAnalyticsSession(),
    events: getSessionEvents(),
    timestamp: Date.now(),
  };
}
