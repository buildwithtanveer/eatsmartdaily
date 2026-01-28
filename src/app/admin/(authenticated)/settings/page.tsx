import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();

  const settings = await prisma.siteSettings.findFirst() || {
    siteName: "Eat Smart Daily",
    siteDescription: "",
    contactEmail: "",
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialPinterest: "",
    socialYoutube: "",
    googleAnalyticsId: "",
    googleSearchConsole: "",
    ezoicId: "",
    headerLogo: "",
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm">Configure your website&apos;s global settings and preferences.</p>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SettingsForm initialSettings={settings as any} />
    </div>
  );
}
