/**
 * Send Newsletter Email API
 * Triggered to send newsletter to subscribers
 */

import { NextResponse } from "next/server";
import { sendBulkEmail } from "@/lib/email-service";
import { newsletterTemplate } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Article {
  title: string;
  excerpt: string;
  url: string;
}

/**
 * POST /api/email/send-newsletter
 * Send newsletter to all subscribers
 */
export async function POST(request: Request) {
  try {
    const apiKey = process.env.NEWSLETTER_API_KEY;
    if (!apiKey && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;

    // Check authorization (Admin session OR API key)
    const authHeader = request.headers.get("authorization");
    const hasAdminSession = !!session && !!role && role !== "USER";
    const hasValidKey = !!apiKey && authHeader === `Bearer ${apiKey}`;
    if (!hasAdminSession && !hasValidKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articles, subscriberEmail } = await request.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: articles (array of {title, excerpt, url})",
        },
        { status: 400 },
      );
    }

    // If specific subscriber email provided, send to that address only
    if (subscriberEmail) {
      const emailTemplate = newsletterTemplate("Subscriber", articles);

      const success = await sendBulkEmail(
        [subscriberEmail],
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text,
      );

      if (!success) {
        return NextResponse.json(
          { error: "Failed to send newsletter email" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          message: "Newsletter email sent successfully",
          recipientCount: 1,
        },
        { status: 200 },
      );
    }

    // Otherwise, get all newsletter subscribers from database
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active newsletter subscribers found" },
        { status: 400 },
      );
    }

    // Send bulk emails
    const emailTemplate = newsletterTemplate("Subscriber", articles);

    const recipientEmails = subscribers.map((sub) => sub.email);
    const successCount = await sendBulkEmail(
      recipientEmails,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text,
    );

    return NextResponse.json(
      {
        message: "Newsletter sent successfully",
        recipientCount: successCount,
        totalSubscribers: subscribers.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/email/send-newsletter/status
 * Check newsletter sending status
 */
export async function GET(request: Request) {
  try {
    const apiKey = process.env.NEWSLETTER_API_KEY;
    if (!apiKey && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;

    const authHeader = request.headers.get("authorization");
    const hasAdminSession = !!session && !!role && role !== "USER";
    const hasValidKey = !!apiKey && authHeader === `Bearer ${apiKey}`;
    if (!hasAdminSession && !hasValidKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeSubscribers = await prisma.newsletterSubscriber.count({
      where: { isActive: true },
    });

    const totalSubscribers = await prisma.newsletterSubscriber.count();

    return NextResponse.json(
      {
        activeSubscribers,
        totalSubscribers,
        inactiveSubscribers: totalSubscribers - activeSubscribers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching newsletter status:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter status" },
      { status: 500 },
    );
  }
}
