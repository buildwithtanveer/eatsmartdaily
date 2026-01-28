import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CommentList from "@/components/admin/comments/CommentList";

export default async function CommentsPage() {
  await requirePermission(["ADMIN", "EDITOR"]);

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Comments</h1>
          <p className="text-gray-500 text-sm">Review, approve, and manage user comments.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {comments.length}
        </div>
      </div>
      <CommentList initialComments={comments} />
    </div>
  );
}
