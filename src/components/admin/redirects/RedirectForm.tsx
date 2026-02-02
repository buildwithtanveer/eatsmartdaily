"use client";

import { useState, useTransition } from "react";
import { createRedirect } from "@/app/actions/redirects";
import { Plus, ArrowRight } from "lucide-react";

export default function RedirectForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createRedirect(formData);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        const form = document.getElementById("redirect-form") as HTMLFormElement;
        form.reset();
      } else {
        setMessage({ type: "error", text: result.message });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Plus size={20} className="text-gray-400" />
        Add New Redirect
      </h2>
      <form id="redirect-form" action={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Source Path (Old)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">/</span>
            <input
              name="source"
              placeholder="old-url"
              required
              className="w-full border border-gray-200 pl-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
        
        <div className="hidden md:flex pb-3 text-gray-300">
          <ArrowRight size={20} />
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Destination Path (New)</label>
            <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">/</span>
            <input
              name="destination"
              placeholder="new-url"
              required
              className="w-full border border-gray-200 pl-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
        
        <div className="w-full md:w-40">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
          <select
            name="type"
            className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden bg-white appearance-none cursor-pointer"
          >
            <option value="PERMANENT">301 Permanent</option>
            <option value="TEMPORARY">302 Temporary</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium shadow-sm"
        >
          {isPending ? "Adding..." : "Add Redirect"}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
