'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface AdUnitProps {
  location: 'HEADER' | 'SIDEBAR' | 'IN_ARTICLE' | 'FOOTER' | 'BELOW_TITLE' | 'END_CONTENT';
  className?: string;
  sticky?: boolean;
  adClient?: string;
  adSlot?: string;
  ezoicId?: string;
}

export default function AdUnit({ 
  location, 
  className = '', 
  sticky = false,
  adClient,
  adSlot,
  ezoicId
}: AdUnitProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px', // Load ads 200px before they come into view
  });

  useEffect(() => {
    if (inView && !isLoaded) {
      if (adClient && adSlot) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoaded(true);
        } catch (e) {
          console.error("AdSense error:", e);
        }
      } else {
        // Simulate ad loading for placeholders
        const timer = setTimeout(() => {
          setIsLoaded(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [inView, isLoaded, adClient, adSlot]);

  // Ad dimensions based on location
  const getAdDimensions = () => {
    switch (location) {
      case 'HEADER':
      case 'BELOW_TITLE':
      case 'FOOTER':
      case 'END_CONTENT':
        return { width: '728px', height: '90px', mobile: '320x100' }; // Leaderboard
      case 'SIDEBAR':
        return { width: '300px', height: sticky ? '600px' : '250px', mobile: '300x250' }; // Half page / Medium rectangle
      case 'IN_ARTICLE':
        return { width: '336px', height: '280px', mobile: '300x250' }; // Large rectangle
      default:
        return { width: '300px', height: '250px', mobile: '300x250' }; // Default
    }
  };

  const dimensions = getAdDimensions();

  const formattedAdClient = adClient 
    ? (adClient.startsWith('ca-pub-') ? adClient : `ca-pub-${adClient}`)
    : '';

  return (
    <div
      ref={ref}
      className={`${className} ${sticky ? 'sticky top-24' : ''}`}
      style={{
        minHeight: dimensions.height,
      }}
    >
      {/* Ad Container with CLS Prevention */}
      <div
        className={`
          ad-unit flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg
          ${isLoaded ? 'bg-transparent border-none' : ''}
        `}
        style={{
          minHeight: dimensions.height,
        }}
      >
        {!isLoaded ? (
          // Loading Placeholder
          <div className="text-center text-gray-500 p-4">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-semibold">Advertisement</p>
              <p className="text-xs mt-1">Loading...</p>
            </div>
          </div>
        ) : (
          // Ad Content
          <div className="ad-content w-full h-full flex items-center justify-center">
            {adClient && adSlot ? (
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={formattedAdClient}
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            ) : ezoicId ? (
              <div id={`ezoic-pub-ad-placeholder-${ezoicId}`}></div>
            ) : (
              /* Placeholder for demo when no IDs are provided */
              <div className="text-center p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 w-full">
                <p className="font-semibold text-gray-700 mb-1">📢 Advertisement</p>
                <p className="text-sm text-gray-600">
                  {dimensions.width} × {dimensions.height}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Replace with AdSense/Ezoic code in Admin Settings
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

