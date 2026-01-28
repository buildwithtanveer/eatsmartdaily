/**
 * Send Comment Notification Email API
 * Triggered when a new comment is posted
 */

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { commentNotificationTemplate } from "@/lib/email-templates";

/**
 * POST /api/email/send-comment-notification
 * Send comment notification email to post author
 */
export async function POST(request: Request) {
  try {
    const {
      authorName,
      authorEmail,
      postTitle,
      postUrl,
      commenterName,
      commentContent,
    } = await request.json();

    if (
      !authorName ||
      !authorEmail ||
      !postTitle ||
      !postUrl ||
      !commenterName ||
      !commentContent
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: authorName, authorEmail, postTitle, postUrl, commenterName, commentContent",
        },
        { status: 400 },
      );
    }

    // Generate comment notification email
    const emailTemplate = commentNotificationTemplate(
      postTitle,
      commenterName,
      commentContent,
      postUrl,
    );

    // Send email
    const success = await sendEmail({
      to: authorEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo: process.env.SMTP_FROM_EMAIL || "noreply@eatsmartdaily.com",
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send comment notification email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Comment notification email sent successfully",
        email: authorEmail,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending comment notification email:", error);
    return NextResponse.json(
      { error: "Failed to send comment notification email" },
      { status: 500 },
    );
  }
}
