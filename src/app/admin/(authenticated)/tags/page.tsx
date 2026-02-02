import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import AddTagForm from "@/components/admin/tags/AddTagForm";
import TagRow from "@/components/admin/tags/TagRow";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminTableFooter from "@/components/admin/AdminTableFooter";

export default async function AdminTags(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR"]);
  
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = searchParams.search || "";

  const where = search ? {
    OR: [
      { name: { contains: search } },
      { slug: { contains: search } },
    ]
  } : {};
  
  const [tags, totalTags] = await Promise.all([
    prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tag.count({ where }),
  ]);

  const totalPages = Math.ceil(totalTags / limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tags</h1>
          <p className="text-gray-500 text-sm">Manage post tags for better organization.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {totalTags}
        </div>
      </div>

      <AddTagForm />

      <AdminTableToolbar searchPlaceholder="Search tags..." />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-1/3">Name</th>
              <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-1/3">Slug</th>
              <th className="text-right p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-1/3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tags.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-medium text-gray-900 text-lg">No tags found</p>
                    <p className="text-sm text-gray-500">Get started by adding a new tag above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <TagRow key={tag.id} tag={tag} />
              ))
            )}
          </tbody>
        </table>
        <AdminTableFooter 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={totalTags} 
          limit={limit} 
        />
      </div>
    </div>
  );
}
