import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube } from "react-icons/fa";
import { getSiteSettings } from "@/lib/data";
import AdDisplay from "@/components/AdDisplay";
import MobileMenu from "@/components/MobileMenu";

export default async function Header() {
  const settings = await getSiteSettings();

  const logoWidth = settings?.useDefaultLogoSize ? 220 : (settings?.logoWidth || 220);
  const logoHeight = settings?.useDefaultLogoSize ? 50 : (settings?.logoHeight || 50);

  return (
    <header className="bg-white">
      {/* Top Bar: Logo & Ad */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            {settings?.headerLogo ? (
              <Image
                src={settings.headerLogo}
                alt={settings?.siteName || "Eat Smart Daily"}
                width={logoWidth}
                height={logoHeight}
                priority
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-green-700 transition-colors">
                  <UtensilsCrossed size={22} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                    EatSmart<span className="text-green-600">Daily</span>
                  </h1>
                </div>
              </div>
            )}
          </Link>
          {settings?.logoSubheading && (
            <p className="text-sm text-gray-500 mt-1 font-medium">{settings.logoSubheading}</p>
          )}
        </div>

        {/* Ad Banner (Responsive) */}
        <div className="w-full md:w-[728px] min-h-[90px] flex items-center justify-center overflow-hidden">
           <AdDisplay location="HEADER" />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-[#568c2c] text-white sticky top-0 z-40 shadow-md">
        <nav className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          
          {/* Mobile Menu Trigger */}
          <MobileMenu />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <Link href="/" className="hover:text-green-100 uppercase">
              Home
            </Link>
            <Link href="/about" className="hover:text-green-100 uppercase">
              About
            </Link>
            <Link href="/blog" className="hover:text-green-100 uppercase">
              Blog
            </Link>
            <Link href="/category/recipes" className="hover:text-green-100 uppercase">
              Recipes
            </Link>
            <Link href="/category/healthy-eating" className="hover:text-green-100 uppercase">
              Healthy Eating
            </Link>
            <Link href="/category/diet-tips" className="hover:text-green-100 uppercase">
              Diet Tips
            </Link>
            <Link href="/contact" className="hover:text-green-100 uppercase">
              Contact
            </Link>
          </div>

          {/* Right Search & Socials */}
          <div className="flex items-center gap-4">
            <form action="/search" className="relative hidden md:block group">
              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="pl-4 pr-10 py-2 rounded-full bg-white text-gray-800 text-sm w-48 focus:w-60 transition-all duration-300 focus:outline-none shadow-sm placeholder:text-gray-400 border-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {settings?.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={14} />
                </a>
              )}
              {settings?.socialTwitter && (
                <a
                  href={settings.socialTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition"
                  aria-label="Twitter"
                >
                  <FaTwitter size={14} />
                </a>
              )}
              {settings?.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition"
                  aria-label="Instagram"
                >
                  <FaInstagram size={14} />
                </a>
              )}
              {settings?.socialPinterest && (
                <a
                  href={settings.socialPinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition"
                  aria-label="Pinterest"
                >
                  <FaPinterestP size={14} />
                </a>
              )}
              {settings?.socialYoutube && (
                <a
                  href={settings.socialYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition"
                  aria-label="YouTube"
                >
                  <FaYoutube size={14} />
                </a>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
