import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface RelatedPostsProps {
  currentPostId: number;
  categoryId: number | null;
  tags: number[];
}

export default async function RelatedPosts({ 
  currentPostId, 
  categoryId, 
  tags 
}: RelatedPostsProps) {
  // Find related posts based on category and tags
  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      status: 'PUBLISHED',
      OR: [
        { categoryId: categoryId },
        { tags: { some: { tagId: { in: tags } } } },
      ],
    },
    take: 3,
    // orderBy: { views: 'desc' }, // views added to schema, but might be 0 initially.
    orderBy: { createdAt: 'desc' }, // Fallback to date if views not populated yet, or keep views if intended
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        You might also like
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition group"
          >
            {post.featuredImage && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              {post.category && (
                <span className="text-xs text-green-600 font-semibold uppercase">
                  {post.category.name}
                </span>
              )}
              <h4 className="font-bold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:text-green-600 transition">
                {post.title}
              </h4>
              {/* Excerpt is not in the schema, maybe use content substring or description? 
                  Schema has metaDescription. Let's use that or truncate content.
                  Actually, schema has metaDescription.
              */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {post.metaDescription || post.content.substring(0, 100) + '...'}
              </p>
              <div className="mt-3 text-xs text-gray-500">
                By {post.author.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
