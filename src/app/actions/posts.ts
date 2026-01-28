/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { logActivity } from "@/lib/activity";

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as string;
  const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
  const featuredImage = formData.get("featuredImage") as string;
  const featuredImageAlt = formData.get("featuredImageAlt") as string;
  
  const showInSlider = formData.get("showInSlider") === "on";
  const showInPopular = formData.get("showInPopular") === "on";
  const showInLatest = formData.get("showInLatest") === "on";

  const metaTitle = formData.get("metaTitle") as string;
  const metaDescription = formData.get("metaDescription") as string;
  
  const scheduledDate = formData.get("publishedAt") ? new Date(formData.get("publishedAt") as string) : null;

  if (!title) return { success: false, message: "Title is required" };

  try {
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check for duplicate slug
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
        return { success: false, message: "A post with this title already exists" };
    }

    // Determine publishedAt
    let publishedAt = null;
    if (status === "PUBLISHED") {
        publishedAt = new Date();
    } else if (status === "SCHEDULED" && scheduledDate) {
        publishedAt = scheduledDate;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        status: status as any,
        categoryId,
        featuredImage,
        featuredImageAlt,
        showInSlider,
        showInPopular,
        showInLatest,
        metaTitle,
        metaDescription,
        authorId: Number((session.user as any).id),
        publishedAt,
      },
    });

    await logActivity(Number(user.id), "CREATE_POST", "Post", { id: post.id, title: post.title });

    revalidatePath("/admin/posts");
    revalidatePath("/admin/recipes");
    revalidatePath("/"); // Update home page
    return { success: true };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, message: "Failed to create post" };
  }
}

export async function updatePost(id: number, formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  // Check ownership for AUTHOR
  if (role === "AUTHOR") {
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) return { success: false, message: "Post not found" };
    if (post.authorId !== Number(user.id)) {
      return { success: false, message: "You can only edit your own posts" };
    }
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as string;
  const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
  const featuredImage = formData.get("featuredImage") as string;
  const featuredImageAlt = formData.get("featuredImageAlt") as string;
  
  const showInSlider = formData.get("showInSlider") === "on";
  const showInPopular = formData.get("showInPopular") === "on";
  const showInLatest = formData.get("showInLatest") === "on";

  const metaTitle = formData.get("metaTitle") as string;
  const metaDescription = formData.get("metaDescription") as string;
  
  const scheduledDate = formData.get("publishedAt") ? new Date(formData.get("publishedAt") as string) : null;

  try {
    const slug = slugify(title, { lower: true, strict: true });

    // Check slug uniqueness (exclude current post)
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, message: "A post with this title already exists" };
    }
    
    // Determine publishedAt logic
    // If it was already published, keep the date unless explicitly changed? 
    // For now, if status is PUBLISHED and no date exists, set to NOW.
    // If status is SCHEDULED, use the form date.
    
    const currentPost = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } });
    
    let publishedAt = currentPost?.publishedAt;
    
    if (status === "PUBLISHED" && !publishedAt) {
        publishedAt = new Date();
    } else if (status === "SCHEDULED" && scheduledDate) {
        publishedAt = scheduledDate;
    } else if (status === "DRAFT") {
        publishedAt = null;
    }

    await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        status: status as any,
        categoryId,
        featuredImage,
        featuredImageAlt,
        showInSlider,
        showInPopular,
        showInLatest,
        metaTitle,
        metaDescription,
        publishedAt,
      },
    });

    await logActivity(Number(user.id), "UPDATE_POST", "Post", { id, title });

    revalidatePath("/admin/posts");
    revalidatePath("/admin/recipes");
    revalidatePath("/");
    revalidatePath(`/blog/${slug}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { success: false, message: "Failed to update post" };
  }
}

export async function bulkDeletePosts(ids: number[]) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.post.deleteMany({
      where: { id: { in: ids } },
    });

    await logActivity(Number(user.id), "BULK_DELETE_POSTS", "Post", { count: ids.length, ids });

    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete posts:", error);
    return { success: false, message: "Failed to delete posts" };
  }
}

export async function bulkUpdateStatus(ids: number[], status: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { 
        status: status as any,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined // Only set date if publishing
      },
    });

    await logActivity(Number(user.id), "BULK_UPDATE_STATUS", "Post", { count: ids.length, status });

    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    console.error("Failed to update posts:", error);
    return { success: false, message: "Failed to update posts" };
  }
}

export async function deletePost(id: number) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  // Check ownership for AUTHOR
  if (role === "AUTHOR") {
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) return { success: false, message: "Post not found" };
    if (post.authorId !== Number(user.id)) {
      return { success: false, message: "You can only delete your own posts" };
    }
  }

  try {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/posts");
    revalidatePath("/admin/recipes");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, message: "Failed to delete post" };
  }
}

export async function togglePostStatus(id: number, currentStatus: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const role = user?.role;

  if (!session || !["ADMIN", "EDITOR", "AUTHOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  // Check ownership for AUTHOR
  if (role === "AUTHOR") {
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) return { success: false, message: "Post not found" };
    if (post.authorId !== Number(user.id)) {
      return { success: false, message: "You can only update your own posts" };
    }
  }
  
  const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  try {
    await prisma.post.update({
      where: { id },
      data: { 
        status: newStatus as any,
        publishedAt: newStatus === "PUBLISHED" ? new Date() : undefined // Update if publishing
      }
    });
    revalidatePath("/admin/posts");
    revalidatePath("/admin/recipes");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle post status:", error);
    return { success: false, message: "Failed to toggle status" };
  }
}
