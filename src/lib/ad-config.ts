/**
 * Advanced Ad Placement Configuration
 * Centralized management of all ad placements and strategies
 */

import {
  type AdPlacement,
  type ABTestConfig,
  calculateAdDensityScore,
} from "@/lib/ad-strategy";

/**
 * Global ad placement configuration
 */
export const AD_PLACEMENT_CONFIG: Record<
  AdPlacement,
  {
    enabled: boolean;
    priority: number;
    maxAdsPerPage: number;
    minSpacingBetweenAds: number; // pixels
    responsiveBreakpoint: string;
    ariaLabel: string;
    estimatedCPM: {
      min: number;
      max: number;
    };
  }
> = {
  HEADER: {
    enabled: true,
    priority: 1,
    maxAdsPerPage: 1,
    minSpacingBetweenAds: 0,
    responsiveBreakpoint: "all",
    ariaLabel: "Header advertisement",
    estimatedCPM: { min: 0.5, max: 2.0 },
  },
  SIDEBAR: {
    enabled: true,
    priority: 2,
    maxAdsPerPage: 2,
    minSpacingBetweenAds: 600,
    responsiveBreakpoint: "md",
    ariaLabel: "Sidebar advertisement",
    estimatedCPM: { min: 1.0, max: 3.0 },
  },
  IN_ARTICLE: {
    enabled: true,
    priority: 3,
    maxAdsPerPage: 1,
    minSpacingBetweenAds: 800,
    responsiveBreakpoint: "sm",
    ariaLabel: "In-article advertisement",
    estimatedCPM: { min: 1.5, max: 4.0 },
  },
  FOOTER: {
    enabled: true,
    priority: 4,
    maxAdsPerPage: 1,
    minSpacingBetweenAds: 0,
    responsiveBreakpoint: "all",
    ariaLabel: "Footer advertisement",
    estimatedCPM: { min: 0.3, max: 1.0 },
  },
  BETWEEN_PARAGRAPHS: {
    enabled: true,
    priority: 5,
    maxAdsPerPage: 3,
    minSpacingBetweenAds: 500,
    responsiveBreakpoint: "sm",
    ariaLabel: "In-content advertisement",
    estimatedCPM: { min: 1.8, max: 5.0 }, // Highest engagement
  },
  STICKY_SIDEBAR: {
    enabled: true,
    priority: 6,
    maxAdsPerPage: 1,
    minSpacingBetweenAds: 0,
    responsiveBreakpoint: "lg",
    ariaLabel: "Sticky sidebar advertisement",
    estimatedCPM: { min: 1.4, max: 3.5 },
  },
  STICKY_BOTTOM: {
    enabled: true,
    priority: 7,
    maxAdsPerPage: 1,
    minSpacingBetweenAds: 0,
    responsiveBreakpoint: "all",
    ariaLabel: "Sticky bottom advertisement",
    estimatedCPM: { min: 1.3, max: 3.0 },
  },
};

/**
 * A/B Test configurations for different placements
 */
export const AB_TEST_CONFIGS: Record<string, ABTestConfig> = {
  SIDEBAR_TEST: {
    placement: "SIDEBAR",
    variantA: {
      size: "300x250",
      position: "right",
      animationTrigger: "immediate",
    },
    variantB: {
      size: "300x600",
      position: "right",
      animationTrigger: "scroll",
    },
    variantC: {
      size: "336x280",
      position: "right",
      animationTrigger: "engagement",
    },
    splitPercentage: {
      A: 33.3,
      B: 33.3,
      C: 33.4,
    },
    conversionGoal: "clicks",
    duration: 14, // 2 weeks
  },
  BETWEEN_PARA_TEST: {
    placement: "BETWEEN_PARAGRAPHS",
    variantA: {
      size: "728x90",
      position: "center",
      animationTrigger: "immediate",
    },
    variantB: {
      size: "300x250",
      position: "center",
      animationTrigger: "scroll",
    },
    splitPercentage: {
      A: 50,
      B: 50,
    },
    conversionGoal: "impressions",
    duration: 14,
  },
  STICKY_BOTTOM_TEST: {
    placement: "STICKY_BOTTOM",
    variantA: {
      size: "728x90",
      position: "bottom",
      animationTrigger: "engagement",
    },
    variantB: {
      size: "970x90",
      position: "bottom",
      animationTrigger: "scroll",
    },
    splitPercentage: {
      A: 50,
      B: 50,
    },
    conversionGoal: "clicks",
    duration: 14,
  },
};

/**
 * Get placements suitable for a given device breakpoint
 */
export function getEnabledPlacementsForBreakpoint(
  breakpoint: "sm" | "md" | "lg" | "xl" = "md",
): AdPlacement[] {
  const breakpointMap: Record<string, Set<AdPlacement>> = {
    sm: new Set([
      "HEADER",
      "FOOTER",
      "IN_ARTICLE",
      "BETWEEN_PARAGRAPHS",
      "STICKY_BOTTOM",
    ]),
    md: new Set([
      "HEADER",
      "SIDEBAR",
      "IN_ARTICLE",
      "FOOTER",
      "BETWEEN_PARAGRAPHS",
      "STICKY_BOTTOM",
    ]),
    lg: new Set([
      "HEADER",
      "SIDEBAR",
      "IN_ARTICLE",
      "FOOTER",
      "BETWEEN_PARAGRAPHS",
      "STICKY_SIDEBAR",
      "STICKY_BOTTOM",
    ]),
    xl: new Set([
      "HEADER",
      "SIDEBAR",
      "IN_ARTICLE",
      "FOOTER",
      "BETWEEN_PARAGRAPHS",
      "STICKY_SIDEBAR",
      "STICKY_BOTTOM",
    ]),
  };

  const placements = Array.from(breakpointMap[breakpoint] || breakpointMap.md);

  // Filter by enabled status
  return placements.filter(
    (p) => AD_PLACEMENT_CONFIG[p].enabled,
  ) as AdPlacement[];
}

/**
 * Calculate estimated revenue for a page
 */
export function estimatePageRevenue(
  viewsPerDay: number,
  enabledPlacements: AdPlacement[],
  ctrEstimate: number = 0.005, // 0.5% baseline CTR
): {
  dailyImpressions: number;
  estimatedDailyRevenue: {
    min: number;
    max: number;
    average: number;
  };
} {
  let totalDailyImpressions = 0;
  let revenueMin = 0;
  let revenueMax = 0;

  enabledPlacements.forEach((placement) => {
    const config = AD_PLACEMENT_CONFIG[placement];
    const impressionsPerDay = viewsPerDay * config.maxAdsPerPage;
    totalDailyImpressions += impressionsPerDay;

    const cpm = config.estimatedCPM;
    revenueMin += (impressionsPerDay / 1000) * cpm.min;
    revenueMax += (impressionsPerDay / 1000) * cpm.max;
  });

  const average = (revenueMin + revenueMax) / 2;

  return {
    dailyImpressions: totalDailyImpressions,
    estimatedDailyRevenue: {
      min: Math.round(revenueMin * 100) / 100,
      max: Math.round(revenueMax * 100) / 100,
      average: Math.round(average * 100) / 100,
    },
  };
}

/**
 * Validate ad placement on a page
 * Returns warnings for suboptimal configurations
 */
export function validateAdPlacement(
  placements: AdPlacement[],
  contentLength: number,
): {
  valid: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for too many ads
  const totalAds = placements.reduce(
    (sum, p) => sum + AD_PLACEMENT_CONFIG[p].maxAdsPerPage,
    0,
  );

  const densityScore = calculateAdDensityScore(contentLength, totalAds);

  if (densityScore < 50) {
    warnings.push("Ad density is too high for content length");
    recommendations.push(
      `For ${contentLength} words, recommend ${Math.ceil(contentLength / 625)} ads maximum`,
    );
  }

  if (placements.includes("STICKY_BOTTOM") && placements.includes("FOOTER")) {
    warnings.push("Sticky bottom ad may overlap with footer content");
    recommendations.push(
      "Consider removing sticky bottom ad if footer is important",
    );
  }

  if (
    !placements.includes("BETWEEN_PARAGRAPHS") &&
    contentLength > 2000 &&
    densityScore < 80
  ) {
    recommendations.push(
      "For long-form content (>2000 words), consider adding between-paragraph ads",
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
    recommendations,
  };
}

/**
 * Get optimal ad placement strategy for content
 */
export function getOptimalStrategy(
  contentLength: number,
  contentType: "article" | "listicle" | "guide" | "news",
): {
  placements: AdPlacement[];
  estimatedDailyRevenue: {
    min: number;
    max: number;
    average: number;
  };
  densityScore: number;
} {
  const strategies: Record<string, AdPlacement[]> = {
    article: [
      "HEADER",
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS",
      "IN_ARTICLE",
      "STICKY_BOTTOM",
      "FOOTER",
    ],
    listicle: [
      "HEADER",
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS",
      "STICKY_SIDEBAR",
      "FOOTER",
    ],
    guide: [
      "HEADER",
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS",
      "IN_ARTICLE",
      "STICKY_SIDEBAR",
      "FOOTER",
    ],
    news: [
      "HEADER",
      "SIDEBAR",
      "BETWEEN_PARAGRAPHS",
      "STICKY_BOTTOM",
      "FOOTER",
    ],
  };

  const basePlacements = strategies[contentType] || strategies.article;

  // Adjust based on content length
  let selectedPlacements = basePlacements;
  if (contentLength < 1000) {
    selectedPlacements = basePlacements.slice(0, 3);
  } else if (contentLength < 2000) {
    selectedPlacements = basePlacements.slice(0, 5);
  }

  const densityScore = calculateAdDensityScore(
    contentLength,
    selectedPlacements.reduce(
      (sum, p) => sum + AD_PLACEMENT_CONFIG[p].maxAdsPerPage,
      0,
    ),
  );

  // Estimate revenue for 10,000 daily views
  const revenue = estimatePageRevenue(10000, selectedPlacements);

  return {
    placements: selectedPlacements,
    estimatedDailyRevenue: revenue.estimatedDailyRevenue,
    densityScore,
  };
}
