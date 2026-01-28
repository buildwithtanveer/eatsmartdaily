import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const authors = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "AUTHOR"] } },
    select: { id: true, createdAt: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";

  const staticPages = [
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/cookie-policy",
    "/blog",
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...staticPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...authors.map((author) => ({
      url: `${baseUrl}/author/${author.id}`,
      lastModified: author.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
