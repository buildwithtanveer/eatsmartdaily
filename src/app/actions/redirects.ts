/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { RedirectType } from "@prisma/client";

export async function createRedirect(formData: FormData) {
  try {
    const session = await requirePermission(["ADMIN", "EDITOR"]);
    const user = session.user as any;

    const source = formData.get("source") as string;
    const destination = formData.get("destination") as string;
    const type = formData.get("type") as RedirectType;

    if (!source || !destination) {
      return { success: false, message: "Source and destination are required" };
    }

    await prisma.redirect.create({
      data: {
        source,
        destination,
        type: type || "PERMANENT",
      },
    });

    await logActivity(Number(user.id), "CREATE_REDIRECT", "Redirect", { source, destination });

    revalidatePath("/admin/redirects");
    return { success: true, message: "Redirect created successfully" };
  } catch (error) {
    console.error("Failed to create redirect:", error);
    return { success: false, message: "Failed to create redirect. Source might already exist." };
  }
}

export async function deleteRedirect(id: number) {
  try {
    const session = await requirePermission(["ADMIN", "EDITOR"]);
    const user = session.user as any;

    const redirect = await prisma.redirect.delete({
      where: { id },
    });

    await logActivity(Number(user.id), "DELETE_REDIRECT", "Redirect", { source: redirect.source });

    revalidatePath("/admin/redirects");
    return { success: true, message: "Redirect deleted successfully" };
  } catch (error) {
    console.error("Failed to delete redirect:", error);
    return { success: false, message: "Failed to delete redirect" };
  }
}
