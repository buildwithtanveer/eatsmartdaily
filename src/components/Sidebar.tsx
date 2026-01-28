import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import AdDisplay from "@/components/AdDisplay";
import NewsletterForm from "@/components/NewsletterForm";
import { getSiteSettings } from "@/lib/data";

export default async function Sidebar() {
  const settings = await getSiteSettings();

  return (
    <aside className="space-y-8">
      {/* Welcome Widget */}
      <div className="bg-white border p-4 text-center rounded-lg shadow-sm">
        <div className="relative w-full h-48 mb-4">
          <Image
            src={settings?.headerLogo || "/logo.svg"}
            alt="Welcome"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-contain p-4"
          />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Welcome to EatSmartDaily!
        </h3>
        <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
          Delicious Recipes & Healthy Living Tips
        </p>
      </div>

      {/* Newsletter Widget */}
      <div className="bg-[#2f3542] text-white p-6 rounded-lg shadow-sm text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-white/10 p-3 rounded-full">
            <Mail size={24} className="text-[#7bed9f]" />
          </div>
        </div>
        <h3 className="text-lg font-bold mb-2">Join Our Newsletter</h3>
        <p className="text-sm text-gray-300 mb-4">
          Get the latest recipes and nutrition tips delivered to your inbox.
        </p>
        <NewsletterForm />
      </div>

      {/* Expert Verification Widget (E-E-A-T Signal) */}
      <div className="bg-green-50 border border-green-100 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white p-2 rounded-full text-green-700 shadow-sm">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-green-900">Expert Verified</h3>
        </div>
        <p className="text-sm text-green-800 mb-4 leading-relaxed">
          Our content is reviewed by registered dietitians and health professionals to ensure accuracy and trust.
        </p>
        <Link href="/about" className="text-green-700 text-sm font-bold hover:underline inline-flex items-center gap-1">
          Our Editorial Process &rarr;
        </Link>
      </div>

      {/* Ad Slot 1 */}
      <AdDisplay location="SIDEBAR" />

      {/* Ad Slot 2 */}
      <AdDisplay location="SIDEBAR" />

      {/* Ad Slot 3 */}
      <AdDisplay location="SIDEBAR" />
    </aside>
  );
}
