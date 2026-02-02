import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";

export const metadata: Metadata = {
  title: "Health Disclaimer",
  description: "Read our Health Disclaimer. The content on Eat Smart Daily is for informational purposes only.",
  alternates: {
    canonical: `${siteUrl}/disclaimer`,
  },
  openGraph: {
    title: "Health Disclaimer | Eat Smart Daily",
    description: "Read our Health Disclaimer. The content on Eat Smart Daily is for informational purposes only.",
    url: `${siteUrl}/disclaimer`,
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

export default function DisclaimerPage() {
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
                name: "Health Disclaimer",
                description:
                  "The content on Eat Smart Daily is for informational purposes only and not medical advice.",
                url: `${siteUrl}/disclaimer`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                  { "@type": "ListItem", position: 2, name: "Disclaimer", item: `${siteUrl}/disclaimer` },
                ],
              },
            ],
          }),
        }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Disclaimer</h1>

        <div className="prose max-w-none text-gray-700">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-2 flex items-center gap-2">
              ⚠️ IMPORTANT HEALTH NOTICE
            </h2>
            <p className="mb-2 font-medium">
              The information provided on Eat Smart Daily is for educational and informational purposes only and is not intended as medical advice, diagnosis, or treatment.
            </p>
            <div className="mb-2">
              <strong>You should:</strong>
              <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                <li>Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition</li>
                <li>Never disregard professional medical advice or delay seeking it because of something you read on this website</li>
                <li>Consult your doctor before starting any new diet, exercise program, or supplement regimen</li>
              </ul>
            </div>
            <div className="mb-2">
              <strong>Special Considerations:</strong>
              <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                <li>Pregnant or nursing mothers should consult their healthcare provider before making dietary changes</li>
                <li>Individuals with existing medical conditions (diabetes, heart disease, food allergies) must work with their healthcare team</li>
                <li>Dietary advice may not be suitable for everyone; individual needs vary</li>
              </ul>
            </div>
            <p className="font-bold text-red-600">
              If you think you may have a medical emergency, call your doctor or emergency services immediately.
            </p>
          </div>

          <p className="mb-4">
            The information provided on Eat Smart Daily is for educational and
            informational purposes only and is not intended as medical advice.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Consult a Professional</h2>
          <p className="mb-4">
            Always consult a qualified healthcare professional before making changes
            to your diet, exercise, or health routine. Never disregard professional medical advice
            or delay in seeking it because of something you have read on this website.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">No Liability</h2>
          <p className="mb-4">
            Eat Smart Daily is not responsible for any adverse effects or
            consequences resulting from the use of information on this website. 
            Reliance on any information provided by Eat Smart Daily is solely at your own risk.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Affiliate Disclosure</h2>
          <p className="mb-4">
            <strong>Affiliate Links Disclaimer:</strong>
          </p>
          <p className="mb-4">
            Some links on this website are affiliate links. This means we may earn a small commission if you click on the link and make a purchase, at no additional cost to you. We only recommend products and services we genuinely believe in and think will add value to our readers.
          </p>
          <p className="mb-2"><strong>We are participants in:</strong></p>
          <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>Amazon Associates Program</li>
            <li>Other affiliate programs we may join from time to time</li>
          </ul>
          <p className="mb-4">
            Our product recommendations are based on quality, value, and personal experience, not solely on commission potential.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Earnings and Results Disclaimer</h2>
          <p className="mb-4"><strong>No Guarantees:</strong></p>
          <p className="mb-4">
            Any claims made of actual earnings or examples of actual results can be verified upon request. Your results will vary and depend on many factors including but not limited to your background, experience, and work ethic.
          </p>
          <p className="mb-4">
            All business entails risk as well as massive and consistent effort and action. If you&apos;re not willing to accept that, please do not use our content or services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Amazon Associates Disclosure</h2>
          <p className="mb-4">
            As an Amazon Associate, we earn from qualifying purchases. This means when you click on Amazon links on our site and make a purchase, we may receive a small commission at no extra cost to you. This helps support our website and allows us to continue providing free content.
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
