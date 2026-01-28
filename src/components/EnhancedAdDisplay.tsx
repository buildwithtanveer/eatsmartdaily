"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import LazyAdWrapper from "@/components/LazyAdWrapper";
import {
  getABTestVariant,
  getPlacementValue,
  getAdSizesForPlacement,
  trackAdEvent,
  type AdPlacement,
  type AdVariant,
} from "@/lib/ad-strategy";
import { sanitizeHtml, sanitizeText, sanitizeUrl } from "@/lib/sanitizer";

export interface AdDisplayProps {
  location: AdPlacement;
  adId: string;
  adContent: {
    type: "IMAGE" | "CODE" | "TEXT";
    content: string;
    name: string;
  };
  enableABTest?: boolean;
  sessionId?: string;
}

/**
 * Enhanced AdDisplay component with A/B testing support
 * Tracks impressions, clicks, and engagement metrics
 */
export default function EnhancedAdDisplay({
  location,
  adId,
  adContent,
  enableABTest = false,
  sessionId,
}: AdDisplayProps) {
  const [variant, setVariant] = useState<AdVariant>("A");
  const [impressionTracked, setImpressionTracked] = useState(false);
  const [startTime] = useState(Date.now());

  // Determine which variant to show
  useEffect(() => {
    if (enableABTest) {
      const selectedVariant = getABTestVariant(location, { sessionId });
      setVariant(selectedVariant);
    }
  }, [enableABTest, location, sessionId]);

  const handleAdClick = () => {
    trackAdEvent({
      placement: location,
      adId,
      eventType: "click",
      variant,
      durationOnScreen: Date.now() - startTime,
    });
  };

  const handleAdImpression = () => {
    if (!impressionTracked) {
      trackAdEvent({
        placement: location,
        adId,
        eventType: "impression",
        variant,
      });
      setImpressionTracked(true);
    }
  };

  const isBanner =
    location === "HEADER" ||
    location === "FOOTER" ||
    location === "STICKY_BOTTOM";
  const aspectRatioClass = isBanner
    ? "h-32 md:h-40"
    : "aspect-square max-h-[300px]";
  const minHeight = isBanner ? "128px" : "300px";

  // Get placement value for analytics
  const placementValue = getPlacementValue(location);
  const adSizes = getAdSizesForPlacement(location);

  // Sanitize content
  let sanitizedContent = "";
  if (adContent.type === "CODE") {
    sanitizedContent = sanitizeHtml(adContent.content);
  } else if (adContent.type === "TEXT") {
    sanitizedContent = sanitizeText(adContent.content);
  }

  return (
    <div
      className="w-full my-6 flex justify-center"
      onMouseEnter={handleAdImpression}
      onFocus={handleAdImpression}
    >
      <LazyAdWrapper minHeight={minHeight}>
        <button
          onClick={handleAdClick}
          className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
          aria-label={`Advertisement: ${sanitizeText(adContent.name)}`}
          type="button"
        >
          {adContent.type === "IMAGE" &&
            (adContent.content.startsWith("/") ||
              adContent.content.startsWith("http")) && (
              <div className={`relative w-full ${aspectRatioClass}`}>
                <Image
                  src={sanitizeUrl(adContent.content) || adContent.content}
                  alt={sanitizeText(adContent.name)}
                  fill
                  className="object-contain"
                  sizes={`(max-width: 768px) 100vw, ${adSizes[0]?.width || 728}px`}
                  priority={location === "HEADER"} // Prioritize header ad
                />
              </div>
            )}
          {adContent.type === "CODE" && (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              role="region"
              aria-label="Advertisement"
              className="w-full"
            />
          )}
          {adContent.type === "TEXT" && (
            <div
              className="p-4 border bg-gray-50 text-center w-full"
              role="region"
              aria-label="Advertisement"
            >
              <span className="text-xs text-gray-400 block mb-2">
                ADVERTISEMENT
              </span>
              <p>{sanitizedContent}</p>
            </div>
          )}
        </button>

        {/* Debug info for A/B testing (remove in production) */}
        {enableABTest && process.env.NODE_ENV === "development" && (
          <div className="absolute bottom-1 right-1 text-xs text-gray-400 bg-white px-1 py-0.5 rounded">
            Variant {variant} • Value: {placementValue.toFixed(1)}x
          </div>
        )}
      </LazyAdWrapper>
    </div>
  );
}
