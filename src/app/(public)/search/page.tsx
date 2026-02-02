import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";
import { searchPosts } from "@/lib/data";

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const title = query ? `Search Results for "${query}"` : "Search";
  const description = "Search for healthy recipes, nutrition tips, and diet guides on Eat Smart Daily.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
  const url = query
    ? `${siteUrl}/search?q=${encodeURIComponent(query)}`
    : `${siteUrl}/search`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
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
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const posts = await searchPosts(query);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] xl:text-[48px] font-bold mb-6 text-gray-800 border-b pb-2">
          Search Results for: <span className="text-[#568c2c]">&quot;{query}&quot;</span>
        </h1>

        {posts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-600 mb-4">
              Sorry, no posts matched your search terms.
            </p>
            <p className="text-sm text-gray-500">
              Try using broader keywords or checking your spelling.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col md:flex-row gap-6 group">
                {/* Thumbnail */}
                <div className="w-full md:w-1/3 h-52 md:h-44 relative rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={post.featuredImage || "/logo.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-green-700 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 text-[16px] sm:text-[17px] lg:text-[18px] xl:text-[19px] leading-[1.75] line-clamp-2 mb-3">
                    {post.metaDescription || post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center text-[13px] sm:text-[14px] lg:text-[15px] xl:text-[16px] text-gray-500 gap-3 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-600">
                        {post.author?.name?.[0] || "A"}
                      </span>
                      {post.author?.name || "Admin"}
                    </span>
                    <span>•</span>
                    <span>{post.updatedAt.toLocaleDateString("en-US")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
