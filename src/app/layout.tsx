import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "./post-typography.css";
import Providers from "@/components/Providers";
import { getSiteSettings } from "@/lib/data";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import EzoicScript from "@/components/EzoicScript";
import WebVitals from "@/components/WebVitals";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteName = settings?.siteName || "Eat Smart Daily";
  const siteDescription =
    settings?.siteDescription ||
    "Discover expert-backed nutrition tips, healthy recipes, and diet guides to help you eat smarter and live healthier every day.";

  return {
    metadataBase: new URL("https://eatsmartdaily.com"),
    alternates: {
      canonical: "./",
    },
    manifest: "/manifest.webmanifest",
    title: {
      default: `${siteName} - Healthy Food, Diet & Nutrition Tips`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: [
      "healthy eating",
      "nutrition tips",
      "diet plans",
      "weight loss",
      "healthy recipes",
      "food facts",
      "wellness",
    ],
    authors: [{ name: `${siteName} Team` }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://eatsmartdaily.com",
      title: `${siteName} - Healthy Food, Diet & Nutrition Tips`,
      description: siteDescription,
      siteName: siteName,
      images: [
        {
          url: "/logo.svg",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Healthy Food, Diet & Nutrition Tips`,
      description: siteDescription,
      creator: settings?.socialTwitter
        ? `@${settings.socialTwitter.split("/").pop()}`
        : "@eatsmartdaily",
    },
    verification: {
      google: settings?.googleSearchConsole || undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col font-sans"
      >
        {settings?.googleAnalyticsId && (
          <Suspense fallback={null}>
            <GoogleAnalytics gaId={settings.googleAnalyticsId} />
          </Suspense>
        )}
        {settings?.googleAdSenseId && (
          <GoogleAdSense publisherId={settings.googleAdSenseId} />
        )}
        {settings?.ezoicId && <EzoicScript ezoicId={settings.ezoicId} />}
        <WebVitals />
        <Providers>
          {children}
          <CookieConsent />
          <AnalyticsDashboard />
        </Providers>
      </body>
    </html>
  );
}
