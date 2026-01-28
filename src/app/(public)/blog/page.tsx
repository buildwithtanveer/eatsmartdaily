import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { getBlogPosts } from "@/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Eat Smart Daily",
  description:
    "Read the latest health, nutrition, and healthy living articles on Eat Smart Daily.",
  alternates: {
    canonical: "https://eatsmartdaily.com/blog",
  },
  openGraph: {
    title: "Blog | Eat Smart Daily",
    description: "Read the latest health, nutrition, and healthy living articles on Eat Smart Daily.",
    url: "https://eatsmartdaily.com/blog",
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
  const page = Number(searchParams.page) || 1;
  const limit = 10;

  const { posts, totalPosts } = await getBlogPosts(page, limit);

  const totalPages = Math.ceil(totalPosts / limit);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Blog | Eat Smart Daily",
        description: "Read the latest health, nutrition, and healthy living articles on Eat Smart Daily.",
        url: "https://eatsmartdaily.com/blog",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://eatsmartdaily.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://eatsmartdaily.com/blog",
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
                  <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-green-700">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {post.metaDescription || post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <div className="flex items-center text-xs text-gray-400 gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-600">
                        {post.author?.name?.[0] || "A"}
                      </span>
                      {post.author?.name || "Admin"}
                    </span>
                    <span>•</span>
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}`}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-[#568c2c] hover:text-white transition"
              >
                &larr; Previous
              </Link>
            )}
            
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            
            {page < totalPages && (
              <Link
                href={`/blog?page=${page + 1}`}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-[#568c2c] hover:text-white transition"
              >
                Next &rarr;
              </Link>
            )}
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
