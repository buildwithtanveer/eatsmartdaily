"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitizer";
import { headers } from "next/headers";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";

const ContactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  subject: z.string().max(200, "Subject too long").optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message too long"),
});

export async function submitContactForm(
  prevState: unknown,
  formData: FormData,
) {
  // Rate limiting
  const headersList = await headers();
  const clientIp = getClientIpFromHeaders(headersList);
  const rateLimit = checkRateLimit(clientIp, "api_contact");

  if (!rateLimit.allowed) {
    return {
      message: `Too many messages. Please try again after ${rateLimit.retryAfter} seconds.`,
    };
  }

  const validatedFields = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeText(validatedFields.data.name),
      email: sanitizeEmail(validatedFields.data.email),
      subject: validatedFields.data.subject
        ? sanitizeText(validatedFields.data.subject)
        : null,
      message: sanitizeText(validatedFields.data.message),
    };

    await prisma.contactMessage.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject || undefined,
        message: sanitizedData.message,
      },
    });

    // Send email notification to Admin (sanitized content)
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@eatsmartdaily.com",
      subject: `New Contact Message: ${sanitizedData.subject || "No Subject"}`,
      html: `
        <h2>New Message from ${sanitizedData.name}</h2>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Subject:</strong> ${sanitizedData.subject || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedData.message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return {
      success: true,
      message: "Thank you! Your message has been sent.",
    };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      message: "Something went wrong. Please try again later.",
    };
  }
}

export async function deleteContactMessage(id: number) {
  await requireAdmin();

  try {
    await prisma.contactMessage.delete({ where: { id } });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete message" };
  }
}

export async function markMessageAsRead(id: number) {
  await requireAdmin();

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update message" };
  }
}
