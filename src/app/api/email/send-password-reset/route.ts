/**
 * Send Password Reset Email API
 * Triggered when user requests password reset
 */

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { passwordResetTemplate } from "@/lib/email-templates";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * POST /api/email/send-password-reset
 * Send password reset email
 */
export async function POST(request: Request) {
  try {
    const apiKey = process.env.EMAIL_API_KEY;
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

    const { userName, userEmail, resetLink } = await request.json();

    if (!userName || !userEmail || !resetLink) {
      return NextResponse.json(
        {
          error: "Missing required fields: userName, userEmail, resetLink",
        },
        { status: 400 },
      );
    }

    // Generate password reset email
    const emailTemplate = passwordResetTemplate(userName, resetLink, 24);

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
        { error: "Failed to send password reset email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Password reset email sent successfully",
        email: userEmail,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 },
    );
  }
}
