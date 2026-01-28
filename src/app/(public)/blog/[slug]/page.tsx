import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, PostWithRelations } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import TableOfContents from "@/components/TableOfContents";
import SocialShareButtons from "@/components/SocialShareButtons";
import AdUnit from "@/components/AdUnit";
import AuthorBio from "@/components/AuthorBio";
import MedicallyReviewed from "@/components/MedicallyReviewed";
import RelatedPosts from "@/components/RelatedPosts";
import CommentSection from "@/components/CommentSection";
import { prisma } from "@/lib/prisma";
import TrackView from "@/components/TrackView";
import { getSiteSettings } from "@/lib/data";
import { sanitizeHtml } from "@/lib/sanitizer";

export const revalidate = 300; // 5 minutes ISR

// Helper functions for server-side ID generation (SEO friendly)
type HeadingItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractHeadings(html: string): HeadingItem[] {
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  const headings: HeadingItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const inner = match[2].replace(/<[^>]*>/g, "").trim();
    if (!inner) continue;

    const baseId = slugifyHeading(inner);
    let id = baseId;
    let counter = 1;

    while (headings.some((h) => h.id === id)) {
      id = `${baseId}-${counter++}`;
    }

    headings.push({ id, text: inner, level });
  }

  return headings;
}

function addIdsToHeadings(html: string, headings: HeadingItem[]): string {
  let index = 0;

  return html.replace(
    /<h([23])(.*?)>(.*?)<\/h\1>/gi,
    (match, level, attrs, inner) => {
      const heading = headings[index++];
      if (!heading) return match;

      if (/id="/i.test(attrs)) {
        return `<h${level}${attrs}>${inner}</h${level}>`;
      }

      const newAttrs = `${attrs} id="${heading.id}"`;
      return `<h${level}${newAttrs}>${inner}</h${level}>`;
    },
  );
}

// Generate metadata for SEO
function discoverTitle(post: PostWithRelations) {
  // If we had a specific discoverTitle field, we'd use it.
  // Since we don't yet, we fallback to smart logic.
  if (post.category?.slug === "diet") {
    return `This ${post.title} Changed My Daily Energy Levels`;
  }
  // Add more emotional/curiosity hooks based on category
  if (post.category?.slug === "recipes") {
    return `You Won't Believe How Easy This ${post.title} Is`;
  }

  return post.title;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  const ogImage = post.featuredImage
    ? `${process.env.NEXT_PUBLIC_SITE_URL}${post.featuredImage}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`;

  const title = discoverTitle(post); // Use optimized title for metadata

  return {
    title: post.metaTitle || title,
    description: post.metaDescription || post.excerpt || undefined,

    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },

    openGraph: {
      type: "article",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
      title: post.metaTitle || title,
      description: post.metaDescription || post.excerpt || undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.featuredImageAlt || post.title,
        },
      ],
      siteName: "Eat Smart Daily",
      locale: "en_US",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags.map((t) => t.tag.name),
    },

    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || title,
      description: post.metaDescription || post.excerpt || undefined,
      images: [ogImage],
      creator: "@eatsmartdaily",
      site: "@eatsmartdaily",
    },

    authors: [{ name: post.author.name, url: `/author/${post.author.id}` }],
    keywords: post.tags.map((t) => t.tag.name).join(", "),

    robots: {
      index: post.status === "PUBLISHED",
      follow: true,
      googleBot: {
        index: post.status === "PUBLISHED",
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const settings = await getSiteSettings();

  if (!post) {
    notFound();
  }

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = post.content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  // Add IDs to headings for SEO and TOC
  const headings = extractHeadings(post.content);
  const contentWithAnchors =
    headings.length > 0
      ? addIdsToHeadings(post.content, headings)
      : post.content;

  // Sanitize content to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(contentWithAnchors);

  // JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.featuredImage
      ? `${process.env.NEXT_PUBLIC_SITE_URL}${post.featuredImage}`
      : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/author/${post.author.id}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Eat Smart Daily",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
    ...(post.reviewer && {
      reviewedBy: {
        "@type": "Person",
        name: post.reviewer.name,
        jobTitle: "Registered Dietitian Nutritionist",
      },
    }),
    articleBody: post.content.replace(/<[^>]*>/g, "").substring(0, 1000),
    wordCount,
    keywords: post.tags.map((t) => t.tag.name).join(", "),
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
      },
      ...(post.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: post.category.name,
              item: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${post.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: post.category ? 4 : 3,
        name: post.title,
        item: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  // FAQ Schema
  const faqSchema =
    post.faq && Array.isArray(post.faq) && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (post.faq as any[]).map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <TrackView postId={post.id} />

      {/* Breadcrumbs */}
      <nav className="bg-white border-b" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-green-600 transition">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link href="/blog" className="hover:text-green-600 transition">
                Blog
              </Link>
            </li>
            {post.category && (
              <>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <Link
                    href={`/category/${post.category.slug}`}
                    className="hover:text-green-600 transition"
                  >
                    {post.category.name}
                  </Link>
                </li>
              </>
            )}
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium line-clamp-1">
                {post.title}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content - 2/3 width */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-sm p-6 md:p-8 lg:p-10">
              {/* Category Badge */}
              {post.category && (
                <div className="mb-4">
                  <Link
                    href={`/category/${post.category.slug}`}
                    className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full hover:bg-green-200 transition uppercase tracking-wide"
                  >
                    {post.category.name}
                  </Link>
                </div>
              )}

              {/* Title */}
              <h1 className="post-title text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Hook Paragraph (Google Discover Optimization) */}
              {(post.excerpt || post.metaDescription) && (
                <p className="text-lg text-gray-700 mb-6 font-medium leading-relaxed">
                  {post.excerpt || post.metaDescription}
                </p>
              )}

              {/* Enhanced Meta Info */}
              <div className="post-meta flex flex-wrap items-center gap-4 mb-6 pb-6 border-b text-sm text-gray-600">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                    {post.author.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      post.author.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/author/${post.author.id}`}
                      className="font-medium text-gray-900 hover:text-green-600 transition"
                    >
                      {post.author.name}
                    </Link>
                    <div className="text-xs text-gray-500">
                      Registered Dietitian
                    </div>
                  </div>
                </div>

                {/* Published Date */}
                <div className="flex items-center gap-2">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {post.publishedAt?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Last Updated (CRITICAL) */}
                <div className="flex items-center gap-2 text-orange-600 font-medium">
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>
                    Updated:{" "}
                    {post.updatedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Reading Time */}
                <div className="flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{readingTime} min read</span>
                </div>

                {/* View Count */}
                <div className="flex items-center gap-2">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Featured Image */}
              {post.featuredImage && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    width={1200}
                    height={630}
                    className="w-full h-auto"
                    priority
                  />
                  {post.featuredImageAlt && (
                    <p className="text-sm text-gray-500 italic mt-2 text-center">
                      {post.featuredImageAlt}
                    </p>
                  )}
                </div>
              )}

              {/* AD UNIT 1 - Below Featured Image */}
              <AdUnit
                location="BELOW_TITLE"
                className="my-8"
                adClient={settings?.googleAdSenseId || undefined}
                adSlot="below-title-slot"
                ezoicId={settings?.ezoicId || undefined}
              />

              {/* Table of Contents */}
              <TableOfContents />

              {/* Post Content */}
              <div
                className="post-content prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* AD UNIT 2 - End of Content */}
              <AdUnit
                location="END_CONTENT"
                className="my-8"
                adClient={settings?.googleAdSenseId || undefined}
                adSlot="end-content-slot"
                ezoicId={settings?.ezoicId || undefined}
              />

              {/* Medically Reviewed */}
              {post.reviewer && (
                <MedicallyReviewed
                  reviewer={post.reviewer}
                  reviewedDate={post.updatedAt}
                />
              )}

              {/* References */}
              {post.references &&
                Array.isArray(post.references) &&
                post.references.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-gray-400" />
                      References & Sources
                    </h3>
                    <ol className="list-decimal pl-5 text-sm text-gray-500 space-y-2">
                      {(
                        post.references as unknown as Array<{
                          url: string;
                          title?: string;
                        }>
                      ).map((ref, idx) => (
                        <li key={idx}>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-green-600 hover:underline"
                          >
                            {ref.title || ref.url}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    Related Topics:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(({ tag }: any) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share Buttons */}
              <SocialShareButtons
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`}
                title={post.title}
                description={post.metaDescription || post.excerpt || ""}
              />

              {/* Author Bio */}
              <AuthorBio author={post.author} />

              {/* Comments */}
              <CommentSection postId={post.id} comments={post.comments} />

              {/* Related Posts */}
              <RelatedPosts
                currentPostId={post.id}
                categoryId={post.categoryId}
                tags={post.tags.map((t: any) => t.tagId)}
              />
            </article>
          </div>

          {/* Sidebar - 1/3 width */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* About Box */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Eat Smart Daily</h3>
                    <p className="text-xs text-gray-600">Health & Nutrition</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  DELICIOUS RECIPES & HEALTHY LIVING TIPS
                </p>
              </div>

              {/* Newsletter */}
              <div className="bg-linear-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg text-white">
                <div className="text-center mb-4">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">
                    Join Our Newsletter
                  </h3>
                  <p className="text-sm text-gray-300">
                    Get the latest recipes and nutrition tips delivered to your
                    inbox.
                  </p>
                </div>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              {/* AD UNIT - Sidebar Sticky */}
              <AdUnit
                location="SIDEBAR"
                sticky
                adClient={settings?.googleAdSenseId || undefined}
                adSlot="sidebar-sticky-slot"
                ezoicId={settings?.ezoicId || undefined}
              />

              {/* Expert Verified */}
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-bold text-gray-900">Expert Verified</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Our content is reviewed by registered dietitians and health
                  professionals to ensure accuracy and trust.
                </p>
                <Link
                  href="/editorial-process"
                  className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                >
                  Our Editorial Process
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
