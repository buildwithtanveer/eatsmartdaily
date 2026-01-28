/**
 * Email Settings API
 * Handles SMTP configuration and email verification
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  verifySMTPConfiguration,
  sendTestEmail,
  resetTransporter,
} from "@/lib/email-service";

/**
 * GET /api/admin/email-settings
 * Get current email settings
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user as { role: string }).role ||
      (session.user as { role: string }).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await prisma.siteSettings.findFirst();

    if (!settings || !settings.smtpSettings) {
      return NextResponse.json(
        {
          isConfigured: false,
          smtpSettings: null,
          message: "SMTP settings not configured",
        },
        { status: 200 },
      );
    }

    // Parse and return settings (without exposing password)
    const smtpSettings = JSON.parse(settings.smtpSettings);
    const safeSettings = {
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.secure,
      user: smtpSettings.user,
      from: smtpSettings.from,
      // Don't return the password
    };

    return NextResponse.json(
      {
        isConfigured: true,
        smtpSettings: safeSettings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch email settings" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/email-settings
 * Update SMTP settings
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user as { role: string }).role ||
      (session.user as { role: string }).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { host, port, secure, user, pass, fromName, fromEmail } = body;

    // Validate required fields
    if (!host || !user || !pass || !fromEmail) {
      return NextResponse.json(
        { error: "Missing required SMTP settings" },
        { status: 400 },
      );
    }

    const smtpSettings = {
      host,
      port: port || 587,
      secure: secure || false,
      user,
      pass,
      from: {
        name: fromName || "Eat Smart Daily",
        email: fromEmail,
      },
    };

    // Update settings in database
    const settings = await prisma.siteSettings.findFirst();

    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          smtpSettings: JSON.stringify(smtpSettings),
        },
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          siteName: "Eat Smart Daily",
          siteDescription: "Health and Nutrition Blog",
          smtpSettings: JSON.stringify(smtpSettings),
        },
      });
    }

    // Reset transporter to reload new settings
    resetTransporter();

    return NextResponse.json(
      {
        message: "SMTP settings updated successfully",
        settings: {
          host,
          port,
          secure,
          user,
          fromName: smtpSettings.from.name,
          fromEmail,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating email settings:", error);
    return NextResponse.json(
      { error: "Failed to update email settings" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/email-settings/verify
 * Verify SMTP configuration
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user as { role: string }).role ||
      (session.user as { role: string }).role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const verification = await verifySMTPConfiguration();

    return NextResponse.json(verification, { status: 200 });
  } catch (error) {
    console.error("Error verifying SMTP configuration:", error);
    return NextResponse.json(
      { error: "Failed to verify SMTP configuration" },
      { status: 500 },
    );
  }
}
