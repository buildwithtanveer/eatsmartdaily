import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.foodiesfeed.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "sherohomefood.in",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // DNS Prefetch Control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // HSTS - Force HTTPS with 2-year max-age and preload
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // XSS Protection (legacy but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Clickjacking Protection - Only allow framing from same origin
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // MIME Type Sniffing Prevention
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Strict Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-no-referrer",
          },
          // Permissions Policy (replaces Feature-Policy)
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.ezojs.com https://*.gatekeeperconsent.com https://the.gatekeeperconsent.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https: http:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: https://*.google-analytics.com https://*.googlesyndication.com https://*.ezoic.com; frame-src 'self' https://*.googlesyndication.com https://*.google.com https://*.ezoic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
          // Require HTTPS for all resources
          {
            key: "Upgrade-Insecure-Requests",
            value: "1",
          },
          // Prevent MIME type detection attacks
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|png)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
