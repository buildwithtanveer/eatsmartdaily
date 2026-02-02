"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sanitizeEmail } from "@/lib/sanitizer";
import { headers } from "next/headers";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendBulkEmail, sendEmail } from "@/lib/email-service";
import { newsletterTemplate } from "@/lib/email-templates";
import { logActivity } from "@/lib/activity";

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

// --- New Newsletter Features ---

export async function getRecentPublishedPosts(limit = 20) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !["ADMIN", "EDITOR"].includes(user?.role)) {
    throw new Error("Unauthorized");
  }

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      content: true,
      featuredImage: true,
    },
  });

  return posts.map((post) => ({
    ...post,
    excerpt: post.content
      ? post.content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..."
      : "",
  }));
}

export async function unsubscribeByEmail(email: string) {
  try {
    const sanitizedEmail = sanitizeEmail(email);
    await prisma.newsletterSubscriber.update({
      where: { email: sanitizedEmail },
      data: { isActive: false },
    });
    return { success: true, message: "Unsubscribed successfully" };
  } catch (error) {
    return { success: false, message: "Failed to unsubscribe" };
  }
}

export async function sendNewsletterAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !["ADMIN", "EDITOR"].includes(user?.role)) {
    return { success: false, message: "Unauthorized" };
  }

  const subject = formData.get("subject") as string;
  const postIdsRaw = formData.get("postIds") as string;
  const sendTo = formData.get("sendTo") as string; // "ALL" | "TEST"
  const testEmail = formData.get("testEmail") as string;

  // Parse post IDs
  let postIds: number[] = [];
  try {
    postIds = JSON.parse(postIdsRaw || "[]");
  } catch (e) {
    return { success: false, message: "Invalid post selection" };
  }

  if (!subject) {
    return { success: false, message: "Subject is required" };
  }

  if (postIds.length === 0) {
    return { success: false, message: "Please select at least one post" };
  }

  try {
    // Fetch selected posts
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: {
        title: true,
        slug: true,
        content: true,
      },
    });

    if (posts.length === 0) {
      return { success: false, message: "No valid posts found" };
    }

    // Format articles for template
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eatsmartdaily.com";
    const articles = posts.map((post) => ({
      title: post.title,
      excerpt: post.content
        ? post.content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..."
        : "",
      url: `${siteUrl}/blog/${post.slug}`,
    }));

    if (sendTo === "TEST") {
      if (!testEmail) {
        return { success: false, message: "Test email address is required" };
      }

      const emailTemplate = newsletterTemplate("Admin", articles);
      // Override subject for test
      const testSubject = `[TEST] ${subject}`;

      const testUnsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(testEmail)}`;
      const html = emailTemplate.html.replace("[UNSUBSCRIBE_URL]", testUnsubscribeUrl);
      const text = emailTemplate.text.replace("[UNSUBSCRIBE_URL]", testUnsubscribeUrl);

      const sent = await sendEmail({
        to: testEmail,
        subject: testSubject,
        html,
        text,
      });

      if (sent) {
        return { success: true, message: `Test email sent to ${testEmail}` };
      } else {
        return { success: false, message: "Failed to send test email" };
      }
    } else if (sendTo === "ALL") {
      // Fetch all active subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true },
      });

      if (subscribers.length === 0) {
        return { success: false, message: "No active subscribers found" };
      }

      const emailTemplate = newsletterTemplate("Subscriber", articles);
      
      let successCount = 0;
      
      for (const sub of subscribers) {
         const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`;
         const html = emailTemplate.html.replace("[UNSUBSCRIBE_URL]", unsubscribeUrl);
         const text = emailTemplate.text.replace("[UNSUBSCRIBE_URL]", unsubscribeUrl);
         
         const sent = await sendEmail({
            to: sub.email,
            subject: subject,
            html,
            text,
         });
         if (sent) successCount++;
      }

      await logActivity(Number(user.id), "SEND_NEWSLETTER", "Newsletter", { 
           subject, 
           recipientCount: successCount,
           totalSubscribers: subscribers.length,
           articleCount: articles.length 
      });

      return { 
        success: true, 
        message: `Newsletter sent successfully to ${successCount} of ${subscribers.length} subscribers` 
      };
    }

    return { success: false, message: "Invalid send option" };
  } catch (error) {
    console.error("Send newsletter error:", error);
    return { success: false, message: "Failed to send newsletter" };
  }
}
