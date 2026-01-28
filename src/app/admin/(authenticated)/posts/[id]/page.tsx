import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import PostForm from "@/components/admin/posts/PostForm";
import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role as Role;
  const { id } = await params;

  const [post, categories, internalLinks] = await Promise.all([
    prisma.post.findUnique({
      where: { id: Number(id) },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { id: true, title: true, slug: true },
    }),
  ]);

  if (!post) {
    notFound();
  }

  if (role === "AUTHOR" && post.authorId !== Number(user.id)) {
    redirect("/admin/posts");
  }

  return (
    <div className="p-6">
      <PostForm post={post} categories={categories} internalLinks={internalLinks} />
    </div>
  );
}
