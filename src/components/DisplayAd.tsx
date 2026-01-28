"use client";

import { useEffect, useRef, useState } from "react";

interface DisplayAdProps {
  slotId: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  className?: string;
  label?: string;
}

export default function DisplayAd({ slotId, format = "auto", className = "", label = "Advertisement" }: DisplayAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
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

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`relative w-full bg-gray-50 flex flex-col items-center justify-center border border-gray-100 rounded overflow-hidden my-6 ${className}`}
      style={{ minHeight: "280px" }} // CLS Protection: Reserve space
    >
      <div className="absolute top-0 left-0 bg-gray-200 text-[10px] text-gray-500 px-1 py-0.5 z-10">
        {label}
      </div>
      
      {isVisible ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-4">
          {/* 
            This is where the actual ad code would go. 
            For AdSense/Ezoic, you would inject the script here or use the global script.
            For now, we just show a placeholder that simulates an ad loading.
          */}
          <div className="text-center">
            <p>Ad Space ({format})</p>
            <p className="text-xs mt-1">Slot: {slotId}</p>
          </div>
        </div>
      ) : (
        // Loading state or empty space before intersection
        <div className="w-full h-full animate-pulse bg-gray-100" />
      )}
    </div>
  );
}
