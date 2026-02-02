import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";
import { redirect, permanentRedirect } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data";
import { getRedirect } from "@/lib/redirect-service";
import Pagination from "@/components/Pagination";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  
  try {
    const category = await getCategoryBySlug(params.slug, page);

    if (!category) {
      return {
        title: "Category Not Found",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
    return {
      title: `${category.name} | Eat Smart Daily`,
      description: `Explore our articles about ${category.name}. Expert tips, guides, and advice on Eat Smart Daily.`,
      keywords: [category.name, "health", "nutrition", "articles", "blog", "tips"],
      alternates: {
        canonical: `${siteUrl}/category/${params.slug}`,
      },
      openGraph: {
        title: `${category.name} | Eat Smart Daily`,
        description: `Explore our articles about ${category.name}. Expert tips, guides, and advice on Eat Smart Daily.`,
        url: `${siteUrl}/category/${params.slug}`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for category:", error);
    return {
      title: "Category | Eat Smart Daily",
    };
  }
}

export default async function CategoryPage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ page?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 12;
  
  try {
    const category = await getCategoryBySlug(params.slug, page, limit);

    if (!category) {
      // Check for redirect
      const currentPath = `/category/${params.slug}`;
      const redirectRule = await getRedirect(currentPath);

      if (redirectRule) {
        if (redirectRule.permanent) {
          permanentRedirect(redirectRule.destination);
        } else {
          redirect(redirectRule.destination);
        }
      }

      return (
        <div className="max-w-6xl mx-auto p-6 text-center py-20">
        <h1 className="text-3xl font-bold text-gray-800">Category Not Found</h1>
        <Link href="/" className="text-green-600 hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: category.name,
        description: `Explore our articles about ${category.name}. Expert tips, guides, and advice on Eat Smart Daily.`,
        url: `${siteUrl}/category/${category.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category.name,
            "item": `${siteUrl}/category/${category.slug}`,
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
        <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] xl:text-[48px] font-bold mb-6 text-gray-800 border-b pb-2 uppercase">
          Category: <span className="text-[#568c2c]">{category.name}</span>
        </h1>

        {category.posts.length === 0 ? (
          <p className="text-gray-500 italic">No posts found in this category yet.</p>
        ) : (
          <div className="space-y-8">
            {category.posts.map((post) => (
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
                  <div className="mb-2">
                     <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {category.name}
                     </span>
                  </div>
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
            
            <Pagination 
              currentPage={category.currentPage} 
              totalPages={category.totalPages} 
              baseUrl={`/category/${category.slug}`} 
            />
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
  } catch (error) {
    console.error("Error loading category page:", error);
    throw error;
  }
}
