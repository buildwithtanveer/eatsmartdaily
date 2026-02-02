"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export type SearchResult = {
  id: string;
  type: "PAGE" | "POST" | "CATEGORY" | "USER";
  title: string;
  subtitle?: string;
  url: string;
};

const ADMIN_PAGES: SearchResult[] = [
  { id: "page-dashboard", type: "PAGE", title: "Dashboard", url: "/admin/dashboard", subtitle: "Overview & Stats" },
  { id: "page-posts", type: "PAGE", title: "Posts", url: "/admin/posts", subtitle: "Manage articles" },
  { id: "page-new-post", type: "PAGE", title: "Add New Post", url: "/admin/posts/new", subtitle: "Create content" },
  { id: "page-media", type: "PAGE", title: "Media Library", url: "/admin/media", subtitle: "Images & Files" },
  { id: "page-comments", type: "PAGE", title: "Comments", url: "/admin/comments", subtitle: "Moderation" },
  { id: "page-users", type: "PAGE", title: "Users", url: "/admin/users", subtitle: "User management" },
  { id: "page-settings", type: "PAGE", title: "Settings", url: "/admin/settings", subtitle: "Site configuration" },
  { id: "page-redirects", type: "PAGE", title: "Redirects", url: "/admin/redirects", subtitle: "URL management" },
  { id: "page-ads", type: "PAGE", title: "Ads Management", url: "/admin/ads", subtitle: "Ad placements" },
  { id: "page-profile", type: "PAGE", title: "My Profile", url: "/admin/profile", subtitle: "Account settings" },
  { id: "page-backups", type: "PAGE", title: "Backups", url: "/admin/backups", subtitle: "System backups" },
];

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  // 1. Filter Admin Pages (Static)
  const pageResults = ADMIN_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(query.toLowerCase()) ||
      page.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  try {
    // Check permissions for DB access (basic check)
    await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);

    // 2. Search Posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query } }, // Case-insensitive by default in MySQL (usually)
          { slug: { contains: query } },
        ],
      },
      take: 5,
      select: { id: true, title: true, status: true },
    });

    const postResults: SearchResult[] = posts.map((post) => ({
      id: `post-${post.id}`,
      type: "POST",
      title: post.title,
      subtitle: `Status: ${post.status}`,
      url: `/admin/posts/${post.id}`,
    }));

    // 3. Search Categories
    const categories = await prisma.category.findMany({
      where: { name: { contains: query } },
      take: 3,
      select: { id: true, name: true },
    });

    const categoryResults: SearchResult[] = categories.map((cat) => ({
      id: `cat-${cat.id}`,
      type: "CATEGORY",
      title: cat.name,
      subtitle: "Category",
      url: `/admin/categories`, // Categories page usually lists them; unfortunately no direct edit link in standard list often
    }));

    return [...pageResults, ...postResults, ...categoryResults];
  } catch (error) {
    // If unauthorized or error, just return page matches
    console.error("Search error:", error);
    return pageResults;
  }
}
