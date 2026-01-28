import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PostTable from "@/components/admin/posts/PostTable"; // Reusing the powerful PostTable
import { Role, Prisma } from "@prisma/client";
import { UtensilsCrossed } from "lucide-react";

export default async function RecipesPage() {
  const session = await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role as Role;

  const recipeCategory = await prisma.category.findFirst({
    where: { 
      OR: [
        { slug: "recipes" }, 
        { name: "Recipes" },
        { slug: "recipe" },
        { name: "Recipe" }
      ] 
    }
  });

  const where: Prisma.PostWhereInput = { categoryId: recipeCategory?.id };
  if (role === "AUTHOR") {
    where.authorId = Number(user.id);
  }

  const posts = recipeCategory
    ? await prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { author: true, category: true },
      })
    : [];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Recipes</h1>
          <p className="text-gray-500 text-sm">Create and manage your recipe collection.</p>
        </div>
        <Link
          href="/admin/posts/new?category=recipes"
          className="bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium flex items-center gap-2"
        >
          <UtensilsCrossed size={18} />
          New Recipe
        </Link>
      </div>

      {!recipeCategory && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 flex flex-col gap-2">
          <p className="font-bold">Category not found</p>
          <p>Please create a category named &quot;Recipes&quot; to manage recipes here.</p>
          <Link href="/admin/categories" className="text-blue-600 underline inline-block">
            Go to Categories
          </Link>
        </div>
      )}

      {recipeCategory && (
        <PostTable posts={posts} />
      )}
    </div>
  );
}
