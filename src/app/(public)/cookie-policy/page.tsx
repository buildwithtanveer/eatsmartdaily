import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Understand how Eat Smart Daily uses cookies to improve your experience.",
  alternates: {
    canonical: `${siteUrl}/cookie-policy`,
  },
  openGraph: {
    title: "Cookie Policy | Eat Smart Daily",
    description: "Understand how Eat Smart Daily uses cookies to improve your experience.",
    url: `${siteUrl}/cookie-policy`,
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

export default function CookiePolicyPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                name: "Cookie Policy",
                description:
                  "Understand how Eat Smart Daily uses cookies to improve your experience.",
                url: `${siteUrl}/cookie-policy`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                  { "@type": "ListItem", position: 2, name: "Cookie Policy", item: `${siteUrl}/cookie-policy` },
                ],
              },
            ],
          }),
        }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Cookie Policy</h1>

        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            This Cookie Policy explains how Eat Smart Daily uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">What are cookies?</h2>
          <p className="mb-4">
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Why do we use cookies?</h2>
          <p className="mb-4">
            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics and other purposes.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Advertising Cookies</h2>
          <p className="mb-4">
            These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
          </p>
          <p className="mb-4">
            Specifically, we use Google AdSense to display ads. Google uses cookies, such as the DoubleClick DART cookie, to serve ads based on your visit to our site and other sites on the Internet. You may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">How can I control cookies?</h2>
          <p className="mb-4">
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Updates to this policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>
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
