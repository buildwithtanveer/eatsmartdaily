/**
 * Send Welcome Email API
 * Triggered when a new user registers
 */

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { welcomeTemplate } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/email/send-welcome
 * Send welcome email to new user
 */
export async function POST(request: Request) {
  try {
    const { userId, userName, userEmail } = await request.json();

    if (!userId || !userName || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: userId, userName, userEmail" },
        { status: 400 },
      );
    }

    // Generate welcome email
    const emailTemplate = welcomeTemplate(userName, "Eat Smart Daily");

    // Send email
    const success = await sendEmail({
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo: process.env.SMTP_FROM_EMAIL || "noreply@eatsmartdaily.com",
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Welcome email sent successfully",
        userId,
        email: userEmail,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 },
    );
  }
}
