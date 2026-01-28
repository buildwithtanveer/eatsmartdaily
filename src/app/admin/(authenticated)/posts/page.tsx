import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import Link from "next/link";
import PostTable from "@/components/admin/posts/PostTable";
import { Role } from "@prisma/client";

export default async function AdminPosts() {
  const session = await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role as Role;

  const where = role === "AUTHOR" ? { authorId: Number(user.id) } : {};

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      author: true,
    },
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Posts</h1>
          <p className="text-gray-500 text-sm">Manage, create, and organize your blog content.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 shadow-sm transition-all flex items-center gap-2 font-medium text-sm group"
        >
          <span className="text-lg leading-none mb-0.5 group-hover:scale-110 transition-transform">+</span> New Post
        </Link>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PostTable posts={posts as any} />
    </div>
  );
}
