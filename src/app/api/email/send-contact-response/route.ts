/**
 * Send Contact Response Email API
 * Triggered when admin responds to contact form
 */

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { contactResponseTemplate } from "@/lib/email-templates";

/**
 * POST /api/email/send-contact-response
 * Send response email to contact form submitter
 */
export async function POST(request: Request) {
  try {
    const { visitorName, visitorEmail, responseMessage, siteUrl } =
      await request.json();

    if (!visitorName || !visitorEmail || !responseMessage) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: visitorName, visitorEmail, responseMessage",
        },
        { status: 400 },
      );
    }

    // Generate contact response email
    const emailTemplate = contactResponseTemplate(visitorName, responseMessage);

    // Send email
    const success = await sendEmail({
      to: visitorEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo: process.env.SMTP_FROM_EMAIL || "noreply@eatsmartdaily.com",
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send contact response email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Contact response email sent successfully",
        email: visitorEmail,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending contact response email:", error);
    return NextResponse.json(
      { error: "Failed to send contact response email" },
      { status: 500 },
    );
  }
}
