import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import AddCategoryForm from "@/components/admin/categories/AddCategoryForm";
import CategoryRow from "@/components/admin/categories/CategoryRow";

export default async function AdminCategories() {
  await requirePermission(["ADMIN", "EDITOR"]);
  
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm">Organize your content with categories.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Total: {categories.length}
        </div>
      </div>

      <AddCategoryForm />

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
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-medium text-gray-900 text-lg">No categories found</p>
                    <p className="text-sm text-gray-500">Get started by adding a new category above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <CategoryRow key={cat.id} category={cat} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
