import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our Privacy Policy to understand how we collect, use, and protect your information at Eat Smart Daily.",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy | Eat Smart Daily",
    description: "Read our Privacy Policy to understand how we collect, use, and protect your information at Eat Smart Daily.",
    url: `${siteUrl}/privacy-policy`,
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

export default function PrivacyPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Privacy Policy",
        description:
          "Read our Privacy Policy to understand how we collect, use, and protect your information at Eat Smart Daily.",
        url: `${siteUrl}/privacy-policy`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Privacy Policy",
            item: `${siteUrl}/privacy-policy`,
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Privacy Policy</h1>

        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            At Eat Smart Daily, we respect your privacy. This Privacy Policy
            explains how we collect, use, and protect your information.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            Information We Collect
          </h2>
          <p className="mb-4">
            We may collect non-personal information such as browser type, device
            information, and pages visited to improve user experience.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            Cookies and Web Beacons
          </h2>
          <p className="mb-4">
            Eat Smart Daily uses cookies to store information about visitors’
            preferences and to optimize content based on users’ browser type.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            Advertising and Cookies
          </h2>
          
          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Third-Party Advertising Partners</h3>
          <p className="mb-4">
            We partner with third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites to provide advertisements about goods and services of interest to you.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Google AdSense</h3>
          <p className="mb-4">
            We use Google AdSense to display advertisements on our website. Google uses cookies to serve ads based on your prior visits to our website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
          </p>

          <h4 className="font-semibold mt-2 mb-1 text-gray-800">Important Information About Ads:</h4>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website.</li>
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your interests.</li>
            <li>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">https://www.google.com/settings/ads</a>.</li>
            <li>You may also opt out of a third-party vendor&apos;s use of cookies by visiting the <a href="http://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">http://www.networkadvertising.org/choices/</a>.</li>
          </ul>

          <h4 className="font-semibold mt-2 mb-1 text-gray-800">Data Collected by Advertisers:</h4>
          <p className="mb-2">Advertisers may collect the following information:</p>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited on our site</li>
            <li>Time and date of visits</li>
            <li>Time spent on pages</li>
            <li>Referring website addresses</li>
            <li>IP address (anonymized)</li>
          </ul>

          <h4 className="font-semibold mt-2 mb-1 text-gray-800">We do NOT collect or share:</h4>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>Your name</li>
            <li>Email address (unless you subscribe to our newsletter)</li>
            <li>Phone number</li>
            <li>Physical address</li>
            <li>Financial information</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Ezoic</h3>
          <p className="mb-4">
            We use Ezoic to provide personalization and analytic services on this website. Ezoic uses cookies and other tracking technologies to collect information about your use of the site to provide and improve our services. For more information about how Ezoic uses data, please visit <a href="https://www.ezoic.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">https://www.ezoic.com/privacy-policy/</a>.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Your Choices Regarding Ads</h3>
          <h4 className="font-semibold mt-2 mb-1 text-gray-800">Opt-Out Options:</h4>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li><strong>Google Ads:</strong> Visit <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">https://adssettings.google.com</a></li>
            <li><strong>General Opt-Out:</strong> Visit <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">http://www.aboutads.info/choices/</a></li>
            <li><strong>European Users (GDPR):</strong> Visit <a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">http://www.youronlinechoices.eu/</a></li>
          </ul>
          <p className="mb-4">
            <strong>Note:</strong> Opting out does not mean you will no longer receive ads. It means the ads you see will not be personalized based on your browsing behavior.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p className="mb-4">
            Under the CCPA, among other rights, California consumers have the right to:
          </p>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>Request that a business that collects a consumer&apos;s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
            <li>Request that a business that sells a consumer&apos;s personal data, not sell the consumer&apos;s personal data.</li>
          </ul>
          <p className="mb-4">
            If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">GDPR Data Protection Rights</h2>
          <p className="mb-4">
            We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Consent</h2>
          <p>By using our website, you consent to our Privacy Policy.</p>
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
