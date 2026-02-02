/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const SettingsSchema = z.object({
  siteName: z.string().min(2).max(191),
  siteDescription: z.string().max(191).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  socialFacebook: z.string().max(191).optional(),
  socialTwitter: z.string().max(191).optional(),
  socialInstagram: z.string().max(191).optional(),
  socialPinterest: z.string().max(191).optional(),
  socialYoutube: z.string().max(191).optional(),
  googleAnalyticsId: z.string().max(191).optional(),
  googleSearchConsole: z.string().max(191).optional(),
  ezoicId: z.string().max(191).optional(),
  googleAdSenseId: z.string().max(191).optional(),
  adsTxt: z.string().optional(),
  headerLogo: z.string().max(191).optional(),
  footerLogo: z.string().max(191).optional(),
  logoSubheading: z.string().max(191).optional(),
  logoWidth: z.coerce.number().int().optional(),
  logoHeight: z.coerce.number().int().optional(),
  useDefaultLogoSize: z.coerce.boolean().optional(),
  spamKeywords: z.string().optional(),
  blockedIps: z.string().optional(),
});

export async function updateSettings(_prevState: any, formData: FormData) {
  const session = await requireAdmin();
  const user = session?.user as any;

  const validatedFields = SettingsSchema.safeParse({
    siteName: formData.get("siteName") || "",
    siteDescription: formData.get("siteDescription") || "",
    contactEmail: formData.get("contactEmail") || "",
    socialFacebook: formData.get("socialFacebook") || "",
    socialTwitter: formData.get("socialTwitter") || "",
    socialInstagram: formData.get("socialInstagram") || "",
    socialPinterest: formData.get("socialPinterest") || "",
    socialYoutube: formData.get("socialYoutube") || "",
    googleAnalyticsId: formData.get("googleAnalyticsId") || "",
    googleSearchConsole: formData.get("googleSearchConsole") || "",
    ezoicId: formData.get("ezoicId") || "",
    googleAdSenseId: formData.get("googleAdSenseId") || "",
    adsTxt: formData.get("adsTxt") || "",
    headerLogo: formData.get("headerLogo") || "",
    footerLogo: formData.get("footerLogo") || "",
    logoSubheading: formData.get("logoSubheading") || "",
    logoWidth: formData.get("logoWidth"),
    logoHeight: formData.get("logoHeight"),
    useDefaultLogoSize: formData.get("useDefaultLogoSize") === "on",
    spamKeywords: formData.get("spamKeywords") || "",
    blockedIps: formData.get("blockedIps") || "",
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    console.error("Validation failed:", errors);
    return {
      errors: errors,
      message: "Validation failed: " + Object.values(errors).flat().join(", "),
    };
  }

  try {
    // Check if settings exist
    const firstSettings = await prisma.siteSettings.findFirst();

    if (firstSettings) {
      await prisma.siteSettings.update({
        where: { id: firstSettings.id },
        data: validatedFields.data,
      });
    } else {
      await prisma.siteSettings.create({
        data: validatedFields.data,
      });
    }

    await logActivity(Number(user.id), "UPDATE_SETTINGS", "Settings", { ...validatedFields.data });

    revalidatePath("/", "layout");
    return { success: true, message: "Settings updated successfully" };
  } catch (error) {
    console.error("Settings update error:", error);
    return { message: "Failed to update settings: " + (error instanceof Error ? error.message : "Unknown error") };
  }
}
