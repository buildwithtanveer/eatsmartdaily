import Sidebar from "@/components/Sidebar";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Eat Smart Daily. We love hearing from our readers!",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact Us | Eat Smart Daily",
    description: "Get in touch with Eat Smart Daily. We love hearing from our readers!",
    url: `${siteUrl}/contact`,
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

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Us",
    description: "Get in touch with Eat Smart Daily.",
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: settings?.siteName || "Eat Smart Daily",
      url: siteUrl,
      sameAs: [
        settings?.socialFacebook,
        settings?.socialTwitter,
        settings?.socialInstagram,
        settings?.socialPinterest,
        settings?.socialYoutube
      ].filter(Boolean) as string[]
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Contact Us</h1>

        <div className="prose max-w-none text-gray-700 mb-8">
          <p>
            We love hearing from our readers! Whether you have a question about a recipe, a suggestion for a new topic, 
            or just want to say hello, we&apos;re here to help.
          </p>
          <p>
            Please fill out the form below, and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <ContactForm />
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
