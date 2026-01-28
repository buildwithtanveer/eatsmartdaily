/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireAdPermission() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    throw new Error("Unauthorized");
  }
}

const AdSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["IMAGE", "CODE", "TEXT"]),
  location: z.enum(["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER"]),
  content: z.string().min(1),
  isActive: z.boolean().optional(),
});

export async function createAd(_prevState: any, formData: FormData) {
  try {
    await requireAdPermission();
  } catch {
    return { message: "Unauthorized" };
  }
  
  const validatedFields = AdSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    location: formData.get("location"),
    content: formData.get("content"),
    isActive: formData.get("isActive") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    await prisma.ad.create({
      data: validatedFields.data,
    });
    revalidatePath("/admin/ads");
    return { success: true, message: "Ad created successfully" };
  } catch {
    return { message: "Failed to create ad" };
  }
}

export async function updateAd(id: number, _prevState: any, formData: FormData) {
  try {
    await requireAdPermission();
  } catch {
    return { message: "Unauthorized" };
  }

  const validatedFields = AdSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    location: formData.get("location"),
    content: formData.get("content"),
    isActive: formData.get("isActive") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  try {
    await prisma.ad.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath("/admin/ads");
    return { success: true, message: "Ad updated successfully" };
  } catch {
    return { message: "Failed to update ad" };
  }
}

export async function deleteAd(id: number) {
  try {
    await requireAdPermission();
    await prisma.ad.delete({ where: { id } });
    revalidatePath("/admin/ads");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete ad" };
  }
}

export async function toggleAdStatus(id: number, isActive: boolean) {
  try {
    await requireAdPermission();
    await prisma.ad.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/ads");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update ad status" };
  }
}
