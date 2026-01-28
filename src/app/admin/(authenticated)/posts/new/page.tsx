import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import PostForm from "@/components/admin/posts/PostForm";

export default async function NewPostPage() {
  await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const internalLinks = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: { id: true, title: true, slug: true },
  });

  return (
    <div className="p-6">
      <PostForm categories={categories} internalLinks={internalLinks} />
    </div>
  );
}
