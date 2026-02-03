/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeHtml,
} from "@/lib/sanitizer";
import { headers } from "next/headers";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";
import { logActivity } from "@/lib/activity";

const CommentSchema = z.object({
  postId: z.number(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  content: z
    .string()
    .min(3, "Comment must be at least 3 characters")
    .max(5000, "Comment too long"),
});

export async function createComment(_prevState: unknown, formData: FormData) {
  // Honeypot check
  if (formData.get("website_url")) {
    return {
      success: true, // Fake success to fool bots
      message: "Your comment has been submitted and is awaiting moderation.",
    };
  }

  const validatedFields = CommentSchema.safeParse({
    postId: Number(formData.get("postId")),
    name: formData.get("name"),
    email: formData.get("email"),
    website: formData.get("website"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    // Rate limiting: 5 comments per minute per IP
    const headersList = await headers();
    const ip = getClientIpFromHeaders(headersList);
    const rateLimit = await checkRateLimit(ip, "api_comments");

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: "Too many comments. Please wait before posting another.",
      };
    }

    // Sanitize inputs
    const sanitizedData = {
      postId: validatedFields.data.postId,
      name: sanitizeText(validatedFields.data.name),
      email: sanitizeEmail(validatedFields.data.email),
      website: validatedFields.data.website
        ? sanitizeUrl(validatedFields.data.website)
        : null,
      content: sanitizeHtml(validatedFields.data.content), // Allow some HTML in comments
    };

    // Verify post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: sanitizedData.postId },
      select: { id: true, status: true },
    });

    if (!post || post.status !== "PUBLISHED") {
      return {
        success: false,
        message: "Post not found or not published.",
      };
    }

    // Check for spam keywords
    const settings = await prisma.siteSettings.findFirst();
    let isSpam = false;
    if (settings?.spamKeywords) {
      const keywords = settings.spamKeywords.split(",").map(k => k.trim().toLowerCase());
      const contentLower = sanitizedData.content.toLowerCase();
      if (keywords.some(k => k && contentLower.includes(k))) {
        isSpam = true;
      }
    }

    await prisma.comment.create({
      data: {
        postId: sanitizedData.postId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        website: sanitizedData.website,
        content: sanitizedData.content,
        status: isSpam ? "SPAM" : "PENDING",
      },
    });

    revalidatePath(`/blog`); // Revalidate blog routes

    return {
      success: true,
      message: isSpam 
        ? "Your comment has been flagged for review." 
        : "Your comment has been submitted and is awaiting moderation.",
    };
  } catch (error) {
    console.error("Comment creation error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

export async function approveComment(commentId: number) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || !["ADMIN", "EDITOR"].includes(user?.role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status: "APPROVED" },
    });
    
    await logActivity(
      Number(user.id),
      "UPDATE_COMMENT",
      `Comment #${commentId}`,
      { status: "APPROVED" }
    );

    revalidatePath("/admin/comments");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to approve comment" };
  }
}

export async function deleteComment(commentId: number) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || !["ADMIN", "EDITOR"].includes(user?.role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });

    await logActivity(
      Number(user.id),
      "DELETE_COMMENT",
      `Comment #${commentId}`
    );

    revalidatePath("/admin/comments");
    revalidatePath("/blog");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete comment" };
  }
}

export async function replyToComment(parentId: number, content: string, postId: number) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!session || !["ADMIN", "EDITOR"].includes(user?.role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    if (!content.trim()) {
      return { success: false, message: "Reply content cannot be empty" };
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        parentId,
        userId: Number(user.id),
        name: user.name || "Admin",
        email: user.email || "admin@eatsmartdaily.com",
        content: sanitizeHtml(content),
        status: "APPROVED", // Admin replies are auto-approved
      },
    });

    await logActivity(
      Number(user.id),
      "REPLY_COMMENT",
      `Comment #${newComment.id}`,
      { parentId, postId }
    );

    revalidatePath("/admin/comments");
    revalidatePath("/blog");
    
    return { success: true };
  } catch (error) {
    console.error("Reply error:", error);
    return { success: false, message: "Failed to post reply" };
  }
}
