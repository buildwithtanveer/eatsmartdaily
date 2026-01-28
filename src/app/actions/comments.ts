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
    const rateLimit = checkRateLimit(ip, "api_comments");

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

    await prisma.comment.create({
      data: {
        postId: sanitizedData.postId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        website: sanitizedData.website,
        content: sanitizedData.content,
        status: "PENDING", // Default to pending
      },
    });

    revalidatePath(`/blog`); // Revalidate blog routes

    return {
      success: true,
      message: "Your comment has been submitted and is awaiting moderation.",
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
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "APPROVED" },
    });
    revalidatePath("/admin/comments");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to approve comment" };
  }
}

export async function deleteComment(commentId: number) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "EDITOR"].includes(role)) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    revalidatePath("/admin/comments");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete comment" };
  }
}
