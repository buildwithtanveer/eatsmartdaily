"use client";

import { useEffect, useRef, useState } from "react";
import LazyAdWrapper from "@/components/LazyAdWrapper";
import { trackAdEvent, type AdPlacement } from "@/lib/ad-strategy";

interface StickyAdProps {
  placement: "STICKY_SIDEBAR" | "STICKY_BOTTOM";
  children: React.ReactNode;
  adId: string;
}

export default function StickyAd({ placement, children, adId }: StickyAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerHeight,
  );
  const viewportHeightRef = useRef(viewportHeight);
  const isVisibleRef = useRef(isVisible);

  useEffect(() => {
    viewportHeightRef.current = viewportHeight;
  }, [viewportHeight]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    const handleScroll = () => {
      if (!adRef.current) return;

      const rect = adRef.current.getBoundingClientRect();
      const adHeight = adRef.current.offsetHeight;
      const vh = viewportHeightRef.current;

      if (placement === "STICKY_BOTTOM") {
        // Stick to bottom when user scrolls past it
        const shouldStick =
          rect.top > vh - 100 && rect.bottom > vh;
        setIsSticky(shouldStick);
      } else if (placement === "STICKY_SIDEBAR") {
        // Stick to viewport position
        const shouldStick = rect.top > 100 && rect.bottom < vh - 50;
        setIsSticky(shouldStick);
      }

      // Track visibility score for analytics
      const visibilityScore = Math.max(
        0,
        Math.min(
          100,
          ((vh - Math.max(0, rect.top)) / (vh + adHeight)) *
            100,
        ),
      );

      // Track if ad becomes visible
      if (visibilityScore > 50 && isVisibleRef.current) {
        trackAdEvent({
          placement: placement as AdPlacement,
          adId,
          eventType: "impression",
          visibilityScore: Math.round(visibilityScore),
        });
      }
    };

    const handleResize = () => {
      const next = window.innerHeight;
      viewportHeightRef.current = next;
      setViewportHeight(next);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [placement, adId]);

  const baseClasses =
    placement === "STICKY_BOTTOM"
      ? "fixed bottom-0 left-0 right-0 z-40"
      : "fixed right-0 top-24 z-40 max-w-xs";

  const stickyClasses = isSticky
    ? baseClasses
    : `${placement === "STICKY_BOTTOM" ? "relative" : "relative"}`;

  return (
    <div
      ref={adRef}
      className={`
        transition-all duration-300 ease-in-out
        ${stickyClasses}
        ${placement === "STICKY_BOTTOM" && isSticky ? "shadow-lg" : ""}
      `}
      role="region"
      aria-label={`${placement === "STICKY_BOTTOM" ? "Sticky bottom" : "Sticky sidebar"} advertisement`}
    >
      {isVisible && (
        <div className="relative">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 z-50 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-75 transition-all"
            aria-label="Close advertisement"
            type="button"
          >
            ✕
          </button>
          <div className="bg-white">
            <LazyAdWrapper minHeight="280px">{children}</LazyAdWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
