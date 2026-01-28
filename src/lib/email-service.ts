/**
 * Email Service
 * Handles sending emails through configured SMTP or transactional service
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { prisma } from "@/lib/prisma";
import { captureException } from "@/lib/sentry-config";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  from?: string;
  bcc?: string[];
  cc?: string[];
}

interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
async function initializeTransporter(): Promise<Transporter | null> {
  // Check if SMTP is configured via environment variables
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    try {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (error) {
      console.error("Failed to initialize SMTP transporter:", error);
      if (error instanceof Error) {
        captureException(error, { context: "SMTP initialization" });
      }
    }
  }

  // Check if SMTP settings are configured in database
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings && settings.smtpSettings) {
      const smtpSettings = JSON.parse(settings.smtpSettings);

      if (smtpSettings.host && smtpSettings.user && smtpSettings.pass) {
        return nodemailer.createTransport({
          host: smtpSettings.host,
          port: smtpSettings.port || 587,
          secure: smtpSettings.secure || false,
          auth: {
            user: smtpSettings.user,
            pass: smtpSettings.pass,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to load SMTP settings from database:", error);
  }

  // Fallback: Use test transporter (for development/testing)
  if (process.env.NODE_ENV === "development") {
    try {
      const testTransport = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testTransport.user,
          pass: testTransport.pass,
        },
      });
    } catch (error) {
      console.error("Failed to create test transporter:", error);
    }
  }

  return null;
}

/**
 * Get the current transporter (lazy initialization)
 */
async function getTransporter(): Promise<Transporter | null> {
  if (!transporter) {
    transporter = await initializeTransporter();
  }
  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailTransporter = await getTransporter();

    if (!mailTransporter) {
      console.warn(
        "⚠️  Email transporter not configured. Email not sent:",
        options.subject,
      );
      return false;
    }

    const result = await mailTransporter.sendMail({
      from:
        options.from ||
        process.env.SMTP_FROM_EMAIL ||
        "noreply@eatsmartdaily.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      bcc: options.bcc,
      cc: options.cc,
    });

    console.log("✅ Email sent:", {
      messageId: result.messageId,
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    if (error instanceof Error) {
      captureException(error, {
        context: "email_send",
        to: options.to,
        subject: options.subject,
      });
    }
    return false;
  }
}

/**
 * Send email to multiple recipients
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string,
  text: string,
): Promise<number> {
  let successCount = 0;

  for (const recipient of recipients) {
    const sent = await sendEmail({
      to: recipient,
      subject,
      html,
      text,
    });

    if (sent) {
      successCount++;
    }
  }

  return successCount;
}

/**
 * Verify SMTP configuration
 */
export async function verifySMTPConfiguration(): Promise<{
  isConfigured: boolean;
  message: string;
  details?: Record<string, any>;
}> {
  try {
    const mailTransporter = await getTransporter();

    if (!mailTransporter) {
      return {
        isConfigured: false,
        message: "Email transporter not configured",
      };
    }

    // Try to verify the connection
    await mailTransporter.verify();

    return {
      isConfigured: true,
      message: "SMTP configuration verified successfully",
    };
  } catch (error) {
    return {
      isConfigured: false,
      message: "SMTP configuration verification failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Test email delivery
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  return sendEmail({
    to: toEmail,
    subject: "Test Email - Eat Smart Daily",
    html: `
      <h1>Test Email</h1>
      <p>This is a test email from Eat Smart Daily.</p>
      <p>If you received this email, your SMTP configuration is working correctly!</p>
    `,
    text: "Test Email\n\nThis is a test email from Eat Smart Daily.\n\nIf you received this email, your SMTP configuration is working correctly!",
  });
}

/**
 * Reset transporter (useful for testing)
 */
export function resetTransporter(): void {
  transporter = null;
}
