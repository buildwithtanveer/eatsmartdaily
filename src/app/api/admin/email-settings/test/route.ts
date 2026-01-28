/**
 * Email Test API
 * Send test emails for verification
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendTestEmail } from "@/lib/email-service";

/**
 * POST /api/admin/email-settings/test
 * Send a test email
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address required" },
        { status: 400 },
      );
    }

    const success = await sendTestEmail(email);

    if (success) {
      return NextResponse.json(
        { message: "Test email sent successfully", email },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Failed to send test email" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 },
    );
  }
}
