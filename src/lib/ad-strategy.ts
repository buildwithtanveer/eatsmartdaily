/**
 * Advanced Ad Placement Strategy
 * Handles A/B testing, placement analytics, and optimization
 */

export type AdVariant = "A" | "B" | "C";
export type AdPlacement =
  | "HEADER"
  | "SIDEBAR"
  | "IN_ARTICLE"
  | "FOOTER"
  | "BETWEEN_PARAGRAPHS"
  | "STICKY_SIDEBAR"
  | "STICKY_BOTTOM";

export interface ABTestConfig {
  placement: AdPlacement;
  variantA: {
    size: string; // e.g., "728x90", "300x250", "970x90"
    position: string;
    animationTrigger: "immediate" | "scroll" | "engagement";
  };
  variantB: {
    size: string;
    position: string;
    animationTrigger: "immediate" | "scroll" | "engagement";
  };
  variantC?: {
    size: string;
    position: string;
    animationTrigger: "immediate" | "scroll" | "engagement";
  };
  splitPercentage: {
    A: number;
    B: number;
    C?: number;
  };
  conversionGoal: "impressions" | "clicks" | "engagement";
  duration?: number; // in days
}

/**
 * Get a consistent variant for a user session
 * Uses IP-based hashing for consistency across page views
 */
export function getABTestVariant(
  placement: AdPlacement,
  options?: { userId?: string; sessionId?: string },
): AdVariant {
  // Create deterministic hash based on user/session data
  const seedData = options?.userId || options?.sessionId || "anonymous";
  let hash = 0;

  for (let i = 0; i < seedData.length; i++) {
    const char = seedData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const randomNum = Math.abs(hash) % 100;

  // Default 50/50 split, with 0% for C
  if (randomNum < 50) return "A";
  if (randomNum < 100) return "B";
  return "C";
}

/**
 * Calculate optimal ad placement for content
 * Returns placement with highest projected CTR based on historical data
 */
export function getOptimalPlacement(
  contentLength: number, // words
  contentType: "article" | "listicle" | "guide" | "news",
): AdPlacement[] {
  // Optimal placements vary by content type and length
  const placementStrategies: Record<string, AdPlacement[]> = {
    article: [
      "HEADER",
      "BETWEEN_PARAGRAPHS", // After 3rd paragraph
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS", // After 6th paragraph
      "IN_ARTICLE",
      "STICKY_BOTTOM",
      "FOOTER",
    ],
    listicle: [
      "HEADER",
      "BETWEEN_PARAGRAPHS", // After 2nd item
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS", // After 4th item
      "STICKY_SIDEBAR",
      "FOOTER",
    ],
    guide: [
      "HEADER",
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS", // Multiple sections
      "IN_ARTICLE",
      "STICKY_SIDEBAR",
      "FOOTER",
    ],
    news: [
      "HEADER",
      "BETWEEN_PARAGRAPHS", // After 2nd paragraph
      "SIDEBAR",
      "IN_ARTICLE",
      "STICKY_BOTTOM",
      "FOOTER",
    ],
  };

  const baseStrategy =
    placementStrategies[contentType] || placementStrategies.article;

  // Adjust based on content length
  if (contentLength < 1000) {
    // Short content - fewer ads
    return baseStrategy.slice(0, 3);
  } else if (contentLength < 2000) {
    // Medium content - moderate ads
    return baseStrategy.slice(0, 5);
  } else {
    // Long content - more ad opportunities
    return baseStrategy;
  }
}

/**
 * Calculate impression value adjustment based on placement
 * Used for estimating revenue impact
 */
export function getPlacementValue(placement: AdPlacement): number {
  // CPM adjustment factors (relative to standard 728x90 header ad = 1.0)
  const placementValues: Record<AdPlacement, number> = {
    HEADER: 1.0,
    SIDEBAR: 1.2,
    IN_ARTICLE: 1.5, // Highest engagement
    FOOTER: 0.7,
    BETWEEN_PARAGRAPHS: 1.8, // Very high engagement
    STICKY_SIDEBAR: 1.4,
    STICKY_BOTTOM: 1.3,
  };

  return placementValues[placement] || 1.0;
}

/**
 * Get recommended ad sizes for a placement
 */
export function getAdSizesForPlacement(
  placement: AdPlacement,
): Array<{ size: string; width: number; height: number; priority: number }> {
  const sizeConfigs: Record<
    AdPlacement,
    Array<{ size: string; width: number; height: number; priority: number }>
  > = {
    HEADER: [
      { size: "728x90", width: 728, height: 90, priority: 1 },
      { size: "970x90", width: 970, height: 90, priority: 2 },
      { size: "320x50", width: 320, height: 50, priority: 3 },
    ],
    SIDEBAR: [
      { size: "300x250", width: 300, height: 250, priority: 1 },
      { size: "300x600", width: 300, height: 600, priority: 2 },
      { size: "336x280", width: 336, height: 280, priority: 3 },
    ],
    IN_ARTICLE: [
      { size: "300x250", width: 300, height: 250, priority: 1 },
      { size: "336x280", width: 336, height: 280, priority: 2 },
      { size: "728x90", width: 728, height: 90, priority: 3 },
    ],
    FOOTER: [
      { size: "728x90", width: 728, height: 90, priority: 1 },
      { size: "970x90", width: 970, height: 90, priority: 2 },
      { size: "320x50", width: 320, height: 50, priority: 3 },
    ],
    BETWEEN_PARAGRAPHS: [
      { size: "300x250", width: 300, height: 250, priority: 1 },
      { size: "728x90", width: 728, height: 90, priority: 2 },
      { size: "336x280", width: 336, height: 280, priority: 3 },
    ],
    STICKY_SIDEBAR: [
      { size: "300x250", width: 300, height: 250, priority: 1 },
      { size: "300x600", width: 300, height: 600, priority: 2 },
    ],
    STICKY_BOTTOM: [
      { size: "728x90", width: 728, height: 90, priority: 1 },
      { size: "970x90", width: 970, height: 90, priority: 2 },
      { size: "320x50", width: 320, height: 50, priority: 3 },
    ],
  };

  return sizeConfigs[placement] || [];
}

/**
 * Calculate ad density score (0-100, higher is better for user experience)
 * Too many ads = poor UX, too few = lost revenue
 */
export function calculateAdDensityScore(
  contentLength: number,
  adCount: number,
): number {
  // Optimal ratio: 1 ad per 500-750 words
  const optimalAdsPerWord = 1 / 625;
  const optimalAdCount = Math.ceil(contentLength * optimalAdsPerWord);

  if (adCount === 0) return 20; // Too few
  if (adCount < optimalAdCount * 0.5) return 40; // Below optimal
  if (adCount === optimalAdCount) return 100; // Perfect
  if (adCount <= optimalAdCount * 1.5) return 85; // Slightly above optimal
  if (adCount <= optimalAdCount * 2) return 60; // Too many
  return 30; // Way too many
}

/**
 * Get ad visibility score based on viewport position
 * Returns 0-100 where 100 is most visible
 */
export function calculateVisibilityScore(
  distanceFromTop: number,
  viewportHeight: number,
  elementHeight: number,
): number {
  const elementTop = distanceFromTop;
  const elementBottom = distanceFromTop + elementHeight;
  const foldLine = viewportHeight;

  // Above the fold = perfect visibility
  if (elementBottom <= foldLine) return 100;

  // Below the fold but partially visible
  if (elementTop < foldLine && elementBottom > foldLine) {
    const visiblePortion = (foldLine - elementTop) / elementHeight;
    return Math.round(visiblePortion * 80) + 20; // 20-100
  }

  // Off-screen above viewport
  if (elementBottom < 0) return 5;

  // Off-screen below viewport
  if (elementTop > foldLine) {
    // Slightly higher score for ads that will appear on scroll
    const distanceBelow = elementTop - foldLine;
    return Math.max(5, 30 - Math.min(distanceBelow / 100, 25));
  }

  return 0;
}

/**
 * Tracking event for ad interactions
 */
export interface AdTrackingEvent {
  placement: AdPlacement;
  adId: string;
  eventType: "impression" | "click" | "close" | "engagement";
  variant?: AdVariant;
  timestamp: number;
  visibilityScore?: number;
  durationOnScreen?: number; // milliseconds
}

/**
 * Log ad interaction (used client-side)
 */
export function trackAdEvent(event: Omit<AdTrackingEvent, "timestamp">): void {
  // In production, this would send to analytics service
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", `ad_${event.eventType}`, {
      placement: event.placement,
      ad_id: event.adId,
      variant: event.variant,
      visibility_score: event.visibilityScore,
      duration_seconds: event.durationOnScreen
        ? event.durationOnScreen / 1000
        : undefined,
    });
  }
}

/**
 * Get AdSense ad slot configuration
 */
export function getAdSenseSlotConfig(placement: AdPlacement): {
  slotId?: string;
  format: string;
  responsive: boolean;
} {
  const slots: Record<
    AdPlacement,
    { slotId?: string; format: string; responsive: boolean }
  > = {
    HEADER: { slotId: "", format: "horizontal", responsive: true },
    SIDEBAR: { slotId: "", format: "vertical", responsive: true },
    IN_ARTICLE: { slotId: "", format: "in-article", responsive: true },
    FOOTER: { slotId: "", format: "horizontal", responsive: true },
    BETWEEN_PARAGRAPHS: { slotId: "", format: "in-article", responsive: true },
    STICKY_SIDEBAR: { slotId: "", format: "vertical", responsive: true },
    STICKY_BOTTOM: { slotId: "", format: "horizontal", responsive: true },
  };

  return slots[placement] || slots.HEADER;
}
