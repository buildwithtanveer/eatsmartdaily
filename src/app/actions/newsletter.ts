"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sanitizeEmail } from "@/lib/sanitizer";
import { headers } from "next/headers";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";

const SubscribeSchema = z.object({
  email: z.string().email("Invalid email address").max(100, "Email too long"),
});

export async function subscribeNewsletter(
  prevState: unknown,
  formData: FormData,
) {
  const validatedFields = SubscribeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid email address.",
    };
  }

  try {
    // Rate limiting: 3 subscriptions per day per IP
    const headersList = await headers();
    const ip = getClientIpFromHeaders(headersList);
    const rateLimit = checkRateLimit(ip, "api_newsletter");

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: "Too many subscription attempts. Please try again later.",
      };
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(validatedFields.data.email);

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existing && existing.isActive) {
      return {
        success: false,
        message: "You're already subscribed!",
      };
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: sanitizedEmail },
      update: { isActive: true },
      create: { email: sanitizedEmail },
    });

    return {
      success: true,
      message: "Successfully subscribed! Check your email for confirmation.",
    };
  } catch (error) {
    console.error("Newsletter error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function deleteSubscriber(id: number) {
  await requireAdmin();

  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });
    revalidatePath("/admin/newsletter");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete subscriber" };
  }
}
