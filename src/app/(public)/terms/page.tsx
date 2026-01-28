import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Review the Terms and Conditions for using Eat Smart Daily.",
  alternates: {
    canonical: "https://eatsmartdaily.com/terms",
  },
  openGraph: {
    title: "Terms and Conditions | Eat Smart Daily",
    description: "Review the Terms and Conditions for using Eat Smart Daily.",
    url: "https://eatsmartdaily.com/terms",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Eat Smart Daily",
      },
    ],
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Terms and Conditions</h1>

        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            By accessing Eat Smart Daily, you agree to be bound by these Terms and
            Conditions.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Content Usage</h2>
          <p className="mb-4">
            The content on this website is for informational purposes only. We make
            no warranties regarding accuracy or completeness. You may not republish 
            material from Eat Smart Daily without prior written consent.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify or remove content without notice. Continued use of the site constitutes acceptance of these changes.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Disclaimer</h2>
          <p className="mb-4">
            If you do not agree with these terms, please discontinue use of this
            website.
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
