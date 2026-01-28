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
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        include: { author: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  return category;
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
  return await prisma.siteSettings.findFirst();
});

export const getHomePageData = cache(async () => {
  // Use a transaction for consistent and potentially faster concurrent reads
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch posts for Slider (Featured/Latest 5)
    let sliderPosts = await tx.post.findMany({
      where: { status: "PUBLISHED", showInSlider: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    // Fallback: if no manual slider posts, fetch latest 5
    if (sliderPosts.length === 0) {
      sliderPosts = await tx.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    }

    const sliderIds = sliderPosts.map((p) => p.id);

    // 2. Fetch sub-hero posts (Latest 3, excluding slider posts)
    const subHeroPosts = await tx.post.findMany({
      where: { 
        status: "PUBLISHED",
        id: { notIn: sliderIds }
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    });

    const subHeroIds = subHeroPosts.map((p) => p.id);
    const excludeIds = [...sliderIds, ...subHeroIds];

    // 3. Fetch latest list (Pinned first, then Latest)
    const latestPosts = await tx.post.findMany({
      where: { 
        status: "PUBLISHED",
      },
      orderBy: [
        { showInLatest: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 9,
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    // 4. Popular Recipes (Manual selection)
    let popularRecipes = await tx.post.findMany({
      where: { status: "PUBLISHED", showInPopular: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    });

    // Fallback for Popular
    if (popularRecipes.length === 0) {
       popularRecipes = await tx.post.findMany({
         where: { 
           status: "PUBLISHED",
           id: { notIn: excludeIds }
         },
         orderBy: { publishedAt: "desc" },
         take: 3,
         select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
       });
    }

    // 5. Healthy Eating (Latest 3)
    const healthyEatingPosts = await tx.post.findMany({
      where: { 
        status: "PUBLISHED",
        category: { slug: "healthy-eating" }
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    });

    // 6. Diet Tips (Latest 3)
    const dietTipsPosts = await tx.post.findMany({
      where: { 
        status: "PUBLISHED",
        category: { slug: "diet-tips" }
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, featuredImage: true, excerpt: true, publishedAt: true }
    });

    return {
      sliderPosts,
      subHeroPosts,
      latestPosts,
      popularRecipes,
      healthyEatingPosts,
      dietTipsPosts
    };
  });
});

export const getBlogPosts = cache(async (page: number = 1, limit: number = 10, cursor?: number) => {
  const [posts, totalPosts] = await prisma.$transaction([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { id: true, name: true, image: true } } },
      take: limit,
      skip: cursor ? 1 : (page - 1) * limit,
      cursor: cursor ? { id: cursor } : undefined,
    }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
  ]);

  const nextCursor = posts.length === limit ? posts[posts.length - 1].id : undefined;

  return { posts, totalPosts, nextCursor };
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
  return await prisma.ad.findMany({
    where: { location, isActive: true },
  });
});
