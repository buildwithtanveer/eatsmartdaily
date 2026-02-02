import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import { getBlogPosts } from "@/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Eat Smart Daily",
  description:
    "Read the latest health, nutrition, and healthy living articles on Eat Smart Daily.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Eat Smart Daily",
    description: "Read the latest health, nutrition, and healthy living articles on Eat Smart Daily.",
    url: "/blog",
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

export default async function BlogPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 12; // Standardizing on 12 per page as it's a good grid number

  try {
    const { posts, totalPosts } = await getBlogPosts(page, limit);
    const totalPages = Math.ceil(totalPosts / limit);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: "Blog | Eat Smart Daily",
          description: "Read the latest health, nutrition, and healthy living articles on Eat Smart Daily.",
          url: `${siteUrl}/blog`,
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
              name: "Blog",
              item: `${siteUrl}/blog`,
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2 uppercase">
            Latest <span className="text-[#568c2c]">Articles</span>
          </h1>

          {posts.length === 0 ? (
            <p className="text-gray-600">No posts published yet.</p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <div key={post.id} className="flex flex-col md:flex-row gap-6 group">
                  {/* Thumbnail */}
                  <div className="w-full md:w-1/3 aspect-16/10 relative rounded-lg overflow-hidden shrink-0">
                    <Link href={`/blog/${post.slug}`}>
                        <Image
                        src={post.featuredImage?.startsWith("http") ? post.featuredImage : (post.featuredImage || "/logo.svg")}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition duration-500"
                        />
                    </Link>
                  </div>
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <Link href={`/blog/${post.slug}`} className="block">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-green-700">
                        {post.title}
                        </h2>
                    </Link>
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
                      {post.category && (
                        <>
                          <span className="font-bold text-green-600">
                            {post.category.name}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-3 mb-4 text-sm leading-relaxed">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 150)}...
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-green-700 font-bold text-sm uppercase hover:underline"
                    >
                      Read More &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            baseUrl="/blog" 
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          <Sidebar />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return (
        <div className="max-w-6xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Unable to load blog posts</h1>
            <p className="text-gray-600">We're experiencing technical difficulties. Please try again later.</p>
        </div>
    );
  }
}
