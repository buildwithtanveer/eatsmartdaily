"use client";

import { Eye } from "lucide-react";

interface VisibilitySettingsProps {
  isFeatured: boolean;
  setIsFeatured: (featured: boolean) => void;
  showInSlider: boolean;
  setShowInSlider: (show: boolean) => void;
  showInPopular: boolean;
  setShowInPopular: (show: boolean) => void;
  allowComments: boolean;
  setAllowComments: (allow: boolean) => void;
}

export default function VisibilitySettings({
  isFeatured,
  setIsFeatured,
  showInSlider,
  setShowInSlider,
  showInPopular,
  setShowInPopular,
  allowComments,
  setAllowComments
}: VisibilitySettingsProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
          <Eye size={18} />
        </div>
        <h3 className="font-bold text-gray-900">Visibility</h3>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm font-medium text-gray-700">Feature this post</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={showInSlider}
            onChange={(e) => setShowInSlider(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm font-medium text-gray-700">Show in Slider</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={showInPopular}
            onChange={(e) => setShowInPopular(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm font-medium text-gray-700">Show in Popular</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={allowComments}
            onChange={(e) => setAllowComments(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm font-medium text-gray-700">Allow Comments</span>
        </label>
      </div>
    </div>
  );
}