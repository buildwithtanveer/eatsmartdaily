import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import PostForm from "@/components/admin/posts/PostForm";

export default async function NewPostPage() {
  await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);

  const [categories, tags, internalLinks, users] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { id: true, title: true, slug: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "EDITOR"] } },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-6">
      <PostForm 
        categories={categories} 
        tags={tags}
        internalLinks={internalLinks} 
        users={users}
      />
    </div>
  );
}
