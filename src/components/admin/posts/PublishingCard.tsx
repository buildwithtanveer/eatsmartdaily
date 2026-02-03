"use client";

import { Settings, ChevronDown, Calendar } from "lucide-react";

interface PublishingCardProps {
  status: string;
  setStatus: (status: string) => void;
  publishedAt: string;
  setPublishedAt: (date: string) => void;
}

export default function PublishingCard({ status, setStatus, publishedAt, setPublishedAt }: PublishingCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
          <Settings size={18} />
        </div>
        <h3 className="font-bold text-gray-900">Publishing</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden appearance-none bg-gray-50 cursor-pointer font-medium text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {(status === "SCHEDULED" || status === "PUBLISHED") && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {status === "SCHEDULED" ? "Schedule Date" : "Publish Date"}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}