import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube } from "react-icons/fa";
import { getSiteSettings } from "@/lib/data";
import AdDisplay from "@/components/AdDisplay";

export default async function Footer() {
  const settings = await getSiteSettings();
  
  const logoWidth = settings?.useDefaultLogoSize ? 150 : (settings?.logoWidth || 150);
  const logoHeight = settings?.useDefaultLogoSize ? 40 : (settings?.logoHeight || 40);

  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Footer Ad */}
        <AdDisplay location="FOOTER" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Brand / Logo Text */}
          <div className="text-center md:text-left">
            {settings?.footerLogo ? (
               <div className="mb-2 flex justify-center md:justify-start">
                 <Link href="/">
                   <Image
                     src={settings.footerLogo}
                     alt={settings?.siteName || "Eat Smart Daily"}
                     width={logoWidth}
                     height={logoHeight}
                     className="object-contain"
                   />
                 </Link>
               </div>
            ) : (
               <Link href="/" className="mb-3 flex justify-center md:justify-start items-center gap-2.5 hover:opacity-90 transition-opacity">
                 <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                   <UtensilsCrossed size={22} />
                 </div>
                 <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                   EatSmart<span className="text-green-600">Daily</span>
                 </h2>
               </Link>
            )}
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto md:mx-0">{settings?.logoSubheading || settings?.siteDescription || "Healthy Living Made Simple"}</p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            {settings?.socialFacebook && (
              <a
                href={settings.socialFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
            )}
            {settings?.socialTwitter && (
              <a
                href={settings.socialTwitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition duration-300"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            )}
            {settings?.socialInstagram && (
              <a
                href={settings.socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#E1306C] hover:text-white transition duration-300"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            )}
            {settings?.socialPinterest && (
              <a
                href={settings.socialPinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#BD081C] hover:text-white transition duration-300"
                aria-label="Pinterest"
              >
                <FaPinterestP />
              </a>
            )}
            {settings?.socialYoutube && (
              <a
                href={settings.socialYoutube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#FF0000] hover:text-white transition duration-300"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {settings?.siteName || "Eat Smart Daily"}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/privacy-policy" className="hover:text-[#568c2c] transition py-2">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#568c2c] transition py-2">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-[#568c2c] transition py-2">
              Disclaimer
            </Link>
            <Link href="/cookie-policy" className="hover:text-[#568c2c] transition py-2">
              Cookie Policy
            </Link>
            <Link href="/contact" className="hover:text-[#568c2c] transition py-2">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
