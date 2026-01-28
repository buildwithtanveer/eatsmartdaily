import React from "react";
import LazyAdWrapper from "@/components/LazyAdWrapper";
import { trackAdEvent } from "@/lib/ad-strategy";

interface BetweenParagraphAdProps {
  adId: string;
  children: React.ReactNode;
  position: number; // which paragraph number this appears after
}

/**
 * Component to insert ads between paragraphs in article content
 * Should be inserted after every 3rd paragraph for optimal UX
 */
export default function BetweenParagraphAd({
  adId,
  children,
  position,
}: BetweenParagraphAdProps) {
  return (
    <div
      className="my-8 flex justify-center w-full"
      role="region"
      aria-label={`Advertisement after paragraph ${position}`}
    >
      <div className="w-full max-w-2xl">
        <div className="text-xs text-gray-400 text-center mb-3">
          ADVERTISEMENT
        </div>
        <LazyAdWrapper minHeight="300px">{children}</LazyAdWrapper>
      </div>
    </div>
  );
}

/**
 * Utility function to determine where to insert between-paragraph ads
 * Returns array of indices where ads should be inserted
 *
 * @param paragraphCount Total number of paragraphs in content
 * @param maxAds Maximum number of ads to insert (default: 3)
 * @returns Array of paragraph indices after which to insert ads
 */
export function calculateAdInsertionPoints(
  paragraphCount: number,
  maxAds: number = 3,
): number[] {
  if (paragraphCount < 4) return []; // Too short for between-paragraph ads

  const insertionPoints: number[] = [];
  const interval = Math.floor(paragraphCount / (maxAds + 1));

  // Insert ads at regular intervals
  for (let i = 1; i <= maxAds; i++) {
    const position = interval * i;
    if (position < paragraphCount - 1) {
      insertionPoints.push(position);
    }
  }

  return insertionPoints;
}

/**
 * Hook to handle paragraph splitting and ad injection
 * Usage: const paragraphsWithAds = useBetweenParagraphAds(content, adCount)
 */
export function useBetweenParagraphAds(
  paragraphs: React.ReactNode[],
  adCount: number = 2,
): (React.ReactNode | React.ReactElement)[] {
  const insertionPoints = calculateAdInsertionPoints(
    paragraphs.length,
    adCount,
  );
  const result: (React.ReactNode | React.ReactElement)[] = [];

  paragraphs.forEach((paragraph, index) => {
    result.push(paragraph);

    // Insert ad after this paragraph if it's in the insertion points
    if (insertionPoints.includes(index)) {
      const adPosition = insertionPoints.indexOf(index) + 1;
      result.push(
        <BetweenParagraphAd
          key={`ad-${index}`}
          adId={`between-para-${index}`}
          position={index}
        >
          <div className="text-center text-gray-400 text-sm py-4">
            Ad space available for your content here
          </div>
        </BetweenParagraphAd>,
      );
    }
  });

  return result;
}
