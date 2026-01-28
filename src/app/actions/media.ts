/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireMediaPermission() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    throw new Error("Unauthorized");
  }
}

export async function getMediaFiles() {
  try {
    await requireMediaPermission();
  } catch {
    return [];
  }
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    return [];
  }
  
  const files = fs.readdirSync(uploadDir);
  // Filter for image files if needed, or return all
  return files.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));
}

export async function deleteMediaFile(fileName: string) {
  try {
    await requireMediaPermission();
    
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      revalidatePath("/admin/media");
      return { success: true };
    } else {
      return { success: false, message: "File not found" };
    }
  } catch (error) {
    console.error("Delete media error:", error);
    return { success: false, message: "Failed to delete file" };
  }
}
