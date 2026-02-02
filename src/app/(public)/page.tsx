import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";
import HomeSlider from "@/components/HomeSlider";
import LatestArticlesSlider from "@/components/LatestArticlesSlider";
import NewsletterForm from "@/components/NewsletterForm";
import DisplayAd from "@/components/DisplayAd";
import { getHomePageData, getSiteSettings } from "@/lib/data";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
  
  return {
    alternates: {
      canonical: `${siteUrl}/`,
    },
  };
}

export default async function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
  const settings = await getSiteSettings();
  const {
    sliderPosts,
    subHeroPosts,
    latestPosts,
    popularRecipes,
    healthyEatingPosts,
    dietTipsPosts,
  } = await getHomePageData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: settings?.siteName || "Eat Smart Daily",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: settings?.siteName || "Eat Smart Daily",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.svg`,
          width: 600,
          height: 60,
        },
        sameAs: [
          settings?.socialFacebook,
          settings?.socialTwitter,
          settings?.socialInstagram,
          settings?.socialPinterest,
          settings?.socialYoutube,
        ].filter(Boolean) as string[],
      },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      <h1 className="sr-only">
        {settings?.siteName || "Eat Smart Daily"} - Evidence-Based Nutrition Tips, Healthy Recipes & Expert Wellness Advice
      </h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8 space-y-10">
        {/* SLIDER SECTION */}
        <HomeSlider posts={sliderPosts} />

        {/* SUB-HERO SECTION (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subHeroPosts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-video w-full rounded-lg overflow-hidden group bg-gray-100"
            >
              <Image
                src={post.featuredImage || "/logo.svg"}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3">
                <h3 className="text-white font-bold text-sm leading-snug">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:underline line-clamp-2"
                  >
                    {post.title}
                  </Link>
                </h3>
              </div>
            </div>
          ))}
        </div>

        <DisplayAd slotId="home-middle" label="Sponsored" />

        {/* LATEST ARTICLES LIST */}
        <section aria-label="Latest Articles">
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Latest Articles</h2>
            <Link
              href="/blog"
              className="text-xs text-gray-500 hover:text-green-700"
            >
              View All &rarr;
            </Link>
          </div>

          <LatestArticlesSlider
            posts={JSON.parse(JSON.stringify(latestPosts))}
          />
        </section>

        {/* POPULAR RECIPES */}
        <section aria-label="Popular Recipes">
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Popular Recipes
            </h2>
            <Link
              href="/category/recipes"
              className="text-sm text-gray-500 hover:text-green-700 font-medium"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularRecipes.map((post) => (
              <div key={post.id} className="group flex flex-col h-full">
                <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm">
                  <Image
                    src={post.featuredImage || "/logo.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-tr-lg font-medium">
                    Recipe
                  </div>
                </div>
                <h4 className="font-bold text-base leading-snug text-gray-900 group-hover:text-green-700 line-clamp-2 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h4>
              </div>
            ))}
          </div>
        </section>

        <DisplayAd slotId="home-bottom" label="Sponsored" />

        {/* HEALTHY EATING */}
        <section aria-label="Healthy Eating">
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Healthy Eating</h2>
            <Link
              href="/category/healthy-eating"
              className="text-sm text-gray-500 hover:text-green-700 font-medium"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthyEatingPosts.map((post) => (
              <div key={post.id} className="group flex flex-col h-full">
                <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm">
                  <Image
                    src={post.featuredImage || "/logo.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-tr-lg font-medium">
                    Healthy Eating
                  </div>
                </div>
                <h4 className="font-bold text-base leading-snug text-gray-900 group-hover:text-green-700 line-clamp-2 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* DIET TIPS */}
        <section aria-label="Diet Tips">
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Diet Tips</h2>
            <Link
              href="/category/diet-tips"
              className="text-sm text-gray-500 hover:text-green-700 font-medium"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dietTipsPosts.map((post) => (
              <div key={post.id} className="group flex flex-col h-full">
                <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm">
                  <Image
                    src={post.featuredImage || "/logo.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-tr-lg font-medium">
                    Diet Tips
                  </div>
                </div>
                <h4 className="font-bold text-base leading-snug text-gray-900 group-hover:text-green-700 line-clamp-2 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* FOLLOW US & NEWSLETTER */}
        <section
          aria-label="Follow Us"
          className="bg-gray-50 p-6 rounded border flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <h4 className="font-bold text-gray-800">Follow Us</h4>
            <div className="flex gap-2">
              {settings?.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
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
                  className="w-8 h-8 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
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
                  className="w-8 h-8 bg-[#E1306C] rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
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
                  className="w-8 h-8 bg-[#BD081C] rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
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
                  className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
                  aria-label="YouTube"
                >
                  <FaYoutube size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto md:text-right">
            <Link
              href="#newsletter"
              className="w-full md:w-auto inline-block bg-[#568c2c] text-white py-2 px-4 rounded font-bold hover:bg-green-700 transition text-center"
            >
              SUBSCRIBE
            </Link>
          </div>
        </section>

        {/* NEWSLETTER BOX */}
        <section
          id="newsletter"
          aria-label="Subscribe"
          className="bg-[#fdf8f0] p-8 rounded border-t-4 border-orange-400"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Get the latest recipes and tips delivered right to your inbox.
          </p>
          <NewsletterForm />
        </section>
      </div>

      {/* RIGHT SIDEBAR COLUMN */}
      <aside className="lg:col-span-4">
        <div className="sticky top-6">
          <Sidebar />
        </div>
      </aside>
    </main>
  );
}
