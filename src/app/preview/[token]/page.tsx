/**
 * Public preview page for unpublished posts
 * Accessible via preview tokens
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PreviewPageProps {
  params: { token: string };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const post = await prisma.post.findUnique({
    where: { previewToken: params.token },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      reviewer: {
        select: { id: true, name: true, image: true },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  // Check if token exists and hasn't expired
  if (!post) {
    notFound();
  }

  if (post.previewExpiresAt && new Date(post.previewExpiresAt) < new Date()) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertDescription>
              This preview link has expired. Please request a new preview link
              from the post editor.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            🔒 This is a preview link. The post is not yet published and should
            not be shared publicly.
          </AlertDescription>
        </Alert>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  post.status === "PUBLISHED"
                    ? "bg-green-100 text-green-800"
                    : post.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {post.status}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center text-sm text-gray-600 mb-6 flex-wrap gap-4">
              <div>
                <strong>Author:</strong> {post.author?.name || "Unknown"}
              </div>
              <div>
                <strong>Published:</strong>{" "}
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {post.updatedAt && (
                <div>
                  <strong>Updated:</strong>{" "}
                  {new Date(post.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>

            {/* Category and Tags */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              {post.category && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  📁 {post.category.name}
                </div>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((postTag) => (
                    <span
                      key={postTag.tag.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{postTag.tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 italic mb-6 p-4 bg-gray-50 border-l-4 border-gray-300">
                {post.excerpt}
              </p>
            )}

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content,
                }}
              />
            </div>

            {/* Medically Reviewed Badge */}
            {post.reviewer && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader>
                  <h3 className="text-green-900 font-semibold">
                    ✓ Medically Reviewed
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800">
                    This content has been reviewed by {post.reviewer.name}, a
                    qualified healthcare professional.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Preview Expiration Warning */}
            {post.previewExpiresAt && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertDescription className="text-orange-800">
                  ⏰ This preview link expires on{" "}
                  {new Date(post.previewExpiresAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </article>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            This is a preview. The post will be available to the public once
            published.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// Generate metadata for preview page
export async function generateMetadata({ params }: PreviewPageProps) {
  const post = await prisma.post.findUnique({
    where: { previewToken: params.token },
  });

  if (!post) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `${post.title} - Preview`,
    description: post.excerpt || post.content.substring(0, 160),
    robots: "noindex, nofollow", // Prevent search engine indexing of preview
  };
}
