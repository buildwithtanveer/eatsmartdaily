"use server";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  await requirePermission(["ADMIN", "EDITOR"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || slugify(name, { lower: true });

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: number, formData: FormData) {
  await requirePermission(["ADMIN", "EDITOR"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || slugify(name, { lower: true });

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number) {
  await requirePermission(["ADMIN", "EDITOR"]);

  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { error: "Failed to delete category" };
  }
}
