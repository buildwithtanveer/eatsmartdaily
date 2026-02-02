import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: true;
    reviewer: true;
    category: true;
    tags: {
      include: {
        tag: true;
      };
    };
    comments: true;
  };
}>;

export const getPostBySlug = cache(async (slug: string): Promise<PostWithRelations | null> => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        reviewer: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        }
      },
    });

    if (!post || post.status !== "PUBLISHED") {
      return null;
    }

    return post;
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to fetch post by slug (${slug}):`, error);
    // In production, we don't want to crash the whole page if metadata fetching fails
    // But for the main content, we might want to throw to trigger the error boundary
    throw error;
  }
});

export const getCategoryBySlug = cache(async (slug: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [category, totalPosts] = await Promise.all([
      prisma.category.findUnique({
        where: { slug },
        include: {
          posts: {
            where: { status: "PUBLISHED" },
            include: { author: true },
            orderBy: { publishedAt: "desc" },
            take: limit,
            skip: skip,
          },
        },
      }),
      prisma.post.count({
        where: {
          status: "PUBLISHED",
          category: { slug },
        },
      }),
    ]);

    if (!category) return null;

    return {
      ...category,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to fetch category by slug (${slug}):`, error);
    throw error;
  }
});

export const getTagBySlug = cache(async (slug: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [tag, totalPosts] = await Promise.all([
      prisma.tag.findUnique({
        where: { slug },
        include: {
          posts: {
            include: {
              post: {
                include: {
                  author: true,
                  category: true,
                },
              },
            },
            where: {
              post: {
                status: "PUBLISHED",
              },
            },
            orderBy: {
              post: {
                publishedAt: "desc",
              },
            },
            take: limit,
            skip: skip,
          },
        },
      }),
      prisma.postTag.count({
        where: {
          tag: { slug },
          post: { status: "PUBLISHED" },
        },
      }),
    ]);

    if (!tag) return null;

    // Flatten the posts from PostTag join table
    const flattenedPosts = tag.posts.map((tp) => tp.post);

    return {
      ...tag,
      posts: flattenedPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to fetch tag by slug (${slug}):`, error);
    throw error;
  }
});

export const getAuthorById = cache(async (id: number) => {
  const author = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  return author;
});

export const getSiteSettings = cache(async () => {
  try {
    return await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
});

export const getHomePageData = cache(async () => {
  // Use Promise.all for concurrent reads without transaction locking issues
  const [
    sliderPostsRaw,
    subHeroPosts,
    latestPosts,
    popularRecipes,
    healthyEatingPosts,
    dietTipsPosts
  ] = await Promise.all([
    // 1. Fetch posts for Slider (Featured/Latest 5)
    prisma.post.findMany({
      where: { status: "PUBLISHED", showInSlider: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { author: { select: { id: true, name: true, image: true } } },
    }),

    // 2. Sub-Hero (Next 3 Latest excluding slider candidates if possible, but for now just latest)
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      skip: 5, // Skip assumed slider posts
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true }
    }),

    // 3. Latest Articles (Next 10)
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 10,
      include: { author: { select: { id: true, name: true, image: true } } },
    }),

    // 4. Popular Recipes (Latest 4 from category 'recipes')
    prisma.post.findMany({
      where: { 
        status: "PUBLISHED",
        category: { slug: "recipes" }
      },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    }),

    // 5. Healthy Eating (Latest 3)
    prisma.post.findMany({
      where: { 
        status: "PUBLISHED",
        category: { slug: "healthy-eating" }
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    }),

    // 6. Diet Tips (Latest 3)
    prisma.post.findMany({
      where: { 
        status: "PUBLISHED",
        category: { slug: "diet-tips" }
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    })
  ]);

  let sliderPosts = sliderPostsRaw;

  // Fallback: if no manual slider posts, fetch latest 5
  if (sliderPosts.length === 0) {
    sliderPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { author: { select: { id: true, name: true, image: true } } },
    });
  }

  return {
    sliderPosts,
    subHeroPosts,
    latestPosts,
    popularRecipes,
    healthyEatingPosts,
    dietTipsPosts
  };
});

export const getBlogPosts = cache(async (page: number = 1, limit: number = 10, cursor?: number) => {
  try {
    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { 
          author: { select: { id: true, name: true, image: true } },
          category: true 
        },
        take: limit,
        skip: cursor ? 1 : (page - 1) * limit,
        cursor: cursor ? { id: cursor } : undefined,
      }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
    ]);

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : undefined;

    return { posts, totalPosts, nextCursor };
  } catch (error) {
    console.error("[DATABASE ERROR] Failed to fetch blog posts:", error);
    return { posts: [], totalPosts: 0, nextCursor: undefined };
  }
});

export const searchPosts = cache(async (query: string) => {
  if (!query) return [];

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    include: { author: true },
  });

  return posts;
});

export const getAds = cache(async (location: "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "BELOW_TITLE" | "END_CONTENT") => {
  try {
    return await prisma.ad.findMany({
      where: { location, isActive: true },
    });
  } catch (error) {
    console.error(`Failed to fetch ads for ${location}:`, error);
    return [];
  }
});
