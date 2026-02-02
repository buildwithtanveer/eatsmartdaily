import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CommentList from "@/components/admin/comments/CommentList";

export default async function CommentsPage(props: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));

  const [comments, totalComments] = await Promise.all([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count(),
  ]);

  const totalPages = Math.ceil(totalComments / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Comments</h1>
          <p className="text-gray-500 text-sm">Review, approve, and manage user comments.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {totalComments}
        </div>
      </div>
      <CommentList 
        initialComments={comments} 
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: totalComments,
          limit
        }}
      />
    </div>
  );
}
