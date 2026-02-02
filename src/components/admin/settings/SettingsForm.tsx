"use client";

import { updateSettings } from "@/app/actions/settings";
import { useState } from "react";
import { Save, CheckCircle, Globe, Mail, Share2, BarChart3, Image as ImageIcon } from "lucide-react";

type Settings = {
  siteName: string;
  siteDescription: string | null;
  contactEmail: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialPinterest: string | null;
  socialYoutube: string | null;
  googleAnalyticsId: string | null;
  googleSearchConsole: string | null;
  ezoicId: string | null;
  googleAdSenseId: string | null;
  adsTxt: string | null;
  headerLogo: string | null;
  footerLogo: string | null;
  logoSubheading: string | null;
  logoWidth: number;
  logoHeight: number;
  useDefaultLogoSize: boolean;
  spamKeywords: string | null;
  blockedIps: string | null;
};

export default function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [useDefaultSize, setUseDefaultSize] = useState(initialSettings.useDefaultLogoSize ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(null, formData);
    
    setIsSaving(false);
    
    if (result.success) {
      setMessage({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: result.message || "Error saving settings" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 -mx-6 px-6 py-4 flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Global Configuration</h2>
        <div className="flex items-center gap-4">
          {message && (
            <div className={`flex items-center gap-2 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"} animate-in fade-in slide-in-from-right-4`}>
              {message.type === "success" && <CheckCircle size={16} />}
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 shadow-sm transition-all font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Branding Section */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Branding & Logos</h3>
              <p className="text-sm text-gray-500">Manage your site&apos;s visual identity.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Header Logo URL</label>
                <input
                  name="headerLogo"
                  defaultValue={initialSettings.headerLogo || ""}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="/logo.svg or https://..."
                />
                <p className="text-xs text-gray-500">Recommended height: 40px</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Footer Logo URL</label>
                <input
                  name="footerLogo"
                  defaultValue={initialSettings.footerLogo || ""}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="/logo.svg or https://..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Logo Subheading (Tagline)</label>
                <input
                  name="logoSubheading"
                  defaultValue={initialSettings.logoSubheading || ""}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  placeholder="e.g. Healthy Living Made Simple"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    name="useDefaultLogoSize"
                    id="useDefaultLogoSize"
                    checked={useDefaultSize}
                    onChange={(e) => setUseDefaultSize(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                  />
                  <label htmlFor="useDefaultLogoSize" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Use Default Logo Dimensions (150x40)
                  </label>
                </div>

                {!useDefaultSize && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Width (px)</label>
                      <input
                        type="number"
                        name="logoWidth"
                        defaultValue={initialSettings.logoWidth || 150}
                        className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Height (px)</label>
                      <input
                        type="number"
                        name="logoHeight"
                        defaultValue={initialSettings.logoHeight || 40}
                        className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* General Info Section */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">General Information</h3>
              <p className="text-sm text-gray-500">Basic site details and contact info.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Site Name</label>
              <input
                name="siteName"
                defaultValue={initialSettings.siteName}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={initialSettings.contactEmail || ""}
                  className="w-full border border-gray-200 p-2.5 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Site Description</label>
              <textarea
                name="siteDescription"
                defaultValue={initialSettings.siteDescription || ""}
                rows={3}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                placeholder="Brief description of your site for SEO..."
              />
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Social Media Links</h3>
              <p className="text-sm text-gray-500">Connect your social profiles.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Facebook', 'Twitter', 'Instagram', 'Pinterest', 'YouTube'].map((social) => {
              const key = `social${social}` as keyof Settings;
              return (
                <div key={social} className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">{social} URL</label>
                  <input
                    name={key}
                    defaultValue={initialSettings[key] as string || ""}
                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    placeholder={`https://${social.toLowerCase()}.com/...`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Spam Protection Section */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Spam Protection</h3>
              <p className="text-sm text-gray-500">Manage comment moderation filters.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Blacklisted Words</label>
              <textarea
                name="spamKeywords"
                defaultValue={initialSettings.spamKeywords || ""}
                rows={3}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                placeholder="viagra, casino, crypto... (comma separated)"
              />
              <p className="text-xs text-gray-500">Comments containing these words will be automatically flagged as SPAM.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Blocked IP Addresses</label>
              <textarea
                name="blockedIps"
                defaultValue={initialSettings.blockedIps || ""}
                rows={3}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none font-mono text-sm"
                placeholder="192.168.1.1, 10.0.0.1... (comma separated)"
              />
              <p className="text-xs text-gray-500">Users with these IP addresses will be prevented from commenting.</p>
            </div>
          </div>
        </section>

        {/* Analytics & Ads Section */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Analytics & Monetization</h3>
              <p className="text-sm text-gray-500">Track performance and manage ads.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Google Analytics ID</label>
              <input
                name="googleAnalyticsId"
                defaultValue={initialSettings.googleAnalyticsId || ""}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Google Search Console Verification</label>
              <input
                name="googleSearchConsole"
                defaultValue={initialSettings.googleSearchConsole || ""}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="Verification code"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Ezoic ID</label>
              <input
                name="ezoicId"
                defaultValue={initialSettings.ezoicId || ""}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="123456"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Google AdSense Publisher ID</label>
              <input
                name="googleAdSenseId"
                defaultValue={initialSettings.googleAdSenseId || ""}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                placeholder="pub-XXXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500">Include &quot;pub-&quot; prefix</p>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">ads.txt Content</label>
              <textarea
                name="adsTxt"
                defaultValue={initialSettings.adsTxt || ""}
                rows={5}
                className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono text-sm"
                placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
              />
              <p className="text-xs text-gray-500">One entry per line</p>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}