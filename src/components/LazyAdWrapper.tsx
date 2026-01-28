"use client";

import { useEffect, useRef, useState } from "react";

interface LazyAdWrapperProps {
  children: React.ReactNode;
  minHeight?: string;
}

export default function LazyAdWrapper({ children, minHeight = "280px" }: LazyAdWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" } // Load 200px before view
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={wrapperRef} 
      className="w-full relative bg-gray-50 flex items-center justify-center overflow-hidden"
      style={{ minHeight: isVisible ? "auto" : minHeight }}
    >
      {isVisible ? (
        children
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs animate-pulse">
          Loading Ad...
        </div>
      )}
    </div>
  );
}
