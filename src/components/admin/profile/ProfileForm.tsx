"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/users";
import { Save, User as UserIcon, Briefcase, Globe, Facebook, Twitter, Instagram, Linkedin, Image as ImageIcon } from "lucide-react";
import MediaSelector from "@/components/admin/media/MediaSelector";
import { useState } from "react";

interface ProfileFormProps {
  user: {
    id: number;
    name: string;
    email: string;
    bio?: string | null;
    jobTitle?: string | null;
    socialFacebook?: string | null;
    socialTwitter?: string | null;
    socialInstagram?: string | null;
    socialLinkedin?: string | null;
    image?: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfile, null);
  const [image, setImage] = useState(user.image || "");

  return (
    <form action={action} className="max-w-4xl space-y-8">
      {state?.message && (
        <div className={`p-4 rounded-lg border ${state.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="mb-4">
              <MediaSelector value={image} onChange={setImage} />
              <input type="hidden" name="image" value={image} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-600" />
              Social Profiles
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <Facebook className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  name="socialFacebook"
                  defaultValue={user.socialFacebook || ""}
                  placeholder="Facebook URL"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  name="socialTwitter"
                  defaultValue={user.socialTwitter || ""}
                  placeholder="Twitter URL"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden"
                />
              </div>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  name="socialInstagram"
                  defaultValue={user.socialInstagram || ""}
                  placeholder="Instagram URL"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden"
                />
              </div>
              <div className="relative">
                <Linkedin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  name="socialLinkedin"
                  defaultValue={user.socialLinkedin || ""}
                  placeholder="LinkedIn URL"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <UserIcon size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Professional Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  name="name"
                  defaultValue={user.name}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    name="jobTitle"
                    defaultValue={user.jobTitle || ""}
                    placeholder="e.g. Registered Dietitian Nutritionist"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio / About You</label>
                <textarea
                  name="bio"
                  defaultValue={user.bio || ""}
                  rows={5}
                  placeholder="Write a brief professional bio..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">This bio will appear on your author page and at the bottom of your posts.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md"
              >
                {isPending ? <Save className="animate-spin" size={18} /> : <Save size={18} />}
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
