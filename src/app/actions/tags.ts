"use server";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

export async function createTag(formData: FormData) {
  await requirePermission(["ADMIN", "EDITOR"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || slugify(name, { lower: true });

  try {
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/tags");
    return { success: true, tag };
  } catch (error) {
    console.error("Failed to create tag:", error);
    return { error: "Failed to create tag" };
  }
}

export async function updateTag(id: number, formData: FormData) {
  await requirePermission(["ADMIN", "EDITOR"]);

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || slugify(name, { lower: true });

  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });
    revalidatePath("/admin/tags");
    return { success: true, tag };
  } catch (error) {
    console.error("Failed to update tag:", error);
    return { error: "Failed to update tag" };
  }
}

export async function deleteTag(id: number) {
  await requirePermission(["ADMIN", "EDITOR"]);

  try {
    await prisma.tag.delete({
      where: { id },
    });
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return { error: "Failed to delete tag" };
  }
}
