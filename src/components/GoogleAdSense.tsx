"use client";

import Script from "next/script";

export default function GoogleAdSense({ publisherId }: { publisherId: string }) {
  if (!publisherId) return null;

  // Ensure publisherId starts with 'ca-pub-'
  const formattedId = publisherId.startsWith("ca-pub-") 
    ? publisherId 
    : `ca-pub-${publisherId}`;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
