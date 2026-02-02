import Sidebar from "@/components/Sidebar";
import { getSiteSettings } from "@/lib/data";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Eat Smart Daily's mission to provide evidence-based nutrition tips, healthy recipes, and expert wellness advice.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About Us | Eat Smart Daily",
    description: "Learn about Eat Smart Daily's mission to provide evidence-based nutrition tips, healthy recipes, and expert wellness advice.",
    url: `${siteUrl}/about`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og`,
        width: 1200,
        height: 630,
        alt: "Eat Smart Daily",
      },
    ],
  },
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.siteName || "Eat Smart Daily",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    description: settings?.siteDescription || "Eat Smart Daily provides expert-backed nutrition tips, healthy recipes, and diet guides.",
    sameAs: [
      settings?.socialFacebook,
      settings?.socialTwitter,
      settings?.socialInstagram,
      settings?.socialPinterest,
      settings?.socialYoutube
    ].filter(Boolean) as string[]
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">About Eat Smart Daily</h1>
        
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            Welcome to <strong>Eat Smart Daily</strong>, your go-to destination for healthy recipes, nutrition tips, and wellness advice.
            We are dedicated to helping you make informed food choices that fit your lifestyle and goals.
          </p>

          <p className="mb-4">
            Our mission is simple: <em>to make healthy eating accessible, delicious, and sustainable for everyone.</em>
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">What We Offer</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Delicious Recipes:</strong> From quick breakfasts to wholesome dinners, our recipes are designed to be nutritious and easy to make.</li>
            <li><strong>Nutrition Tips:</strong> Expert-backed advice to help you understand what you eat.</li>
            <li><strong>Diet Guides:</strong> Whether you follow Keto, Vegan, or Paleo, we have resources to support your journey.</li>
            <li><strong>Wellness Advice:</strong> Holistic tips for a balanced life, covering sleep, hydration, and stress management.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Our Philosophy</h2>
          <p className="mb-4">
            We believe that food is medicine, but it should also be a source of joy. We don&apos;t believe in restrictive dieting; 
            instead, we advocate for a balanced approach where no food is off-limits, but moderation is key.
          </p>

          <h2 id="editorial-policy" className="text-2xl font-bold mt-8 mb-4 text-gray-800">Editorial Policy</h2>
          <p className="mb-4">
            At Eat Smart Daily, accuracy and trust are our top priorities. All our content is researched, written, and reviewed 
            by qualified nutritionists and health enthusiasts. We rely on peer-reviewed studies and authoritative sources to 
            provide you with up-to-date and reliable information.
          </p>
          <p className="mb-4">
            We are transparent about our sources and authors. Every article includes author information and, where applicable, 
            details about medical review.
          </p>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mt-8 mb-8">
             <h3 className="font-bold text-amber-800 mb-2">Medical Disclaimer</h3>
             <p className="text-sm text-amber-900 leading-relaxed">
                The content on Eat Smart Daily is for informational purposes only and is not intended to be a substitute for 
                professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other 
                qualified health provider with any questions you may have regarding a medical condition or dietary changes.
             </p>
          </div>

          <p className="mb-4">
            Thank you for visiting Eat Smart Daily. We hope you find inspiration here to live your healthiest, happiest life.
          </p>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-8">
            <h3 className="font-bold text-green-800 mb-2">Connect With Us</h3>
            <p className="mb-4">Have questions or suggestions? We&apos;d love to hear from you!</p>
            <a href="/contact" className="inline-block bg-[#568c2c] text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition">
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR COLUMN */}
      <div className="lg:col-span-4">
        <div className="sticky top-6">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
