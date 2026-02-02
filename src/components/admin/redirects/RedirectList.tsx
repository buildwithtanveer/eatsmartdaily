"use client";

import { useState, useTransition } from "react";
import { deleteRedirect } from "@/app/actions/redirects";
import { Trash2, ArrowRight, Link as LinkIcon } from "lucide-react";
import { RedirectType } from "@prisma/client";

interface Redirect {
  id: number;
  source: string;
  destination: string;
  type: RedirectType;
  isActive: boolean;
}

export default function RedirectList({ redirects }: { redirects: Redirect[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this redirect?")) return;

    startTransition(async () => {
      const result = await deleteRedirect(id);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.message });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {message && (
        <div className={`p-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-700 border-b border-green-100" : "bg-red-50 text-red-700 border-b border-red-100"}`}>
          {message.text}
        </div>
      )}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">Source</th>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[5%]"></th>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">Destination</th>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Type</th>
            <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {redirects.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-16 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="font-medium">No redirects found</p>
                </div>
              </td>
            </tr>
          ) : (
            redirects.map((redirect) => (
              <tr key={redirect.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="p-4 font-mono text-sm text-gray-600 truncate max-w-xs" title={redirect.source}>
                  {redirect.source}
                </td>
                <td className="p-4 text-gray-300">
                  <ArrowRight size={16} />
                </td>
                <td className="p-4 font-mono text-sm text-green-600 font-medium truncate max-w-xs" title={redirect.destination}>
                  {redirect.destination}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${redirect.type === "PERMANENT" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                    {redirect.type === "PERMANENT" ? "301" : "302"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(redirect.id)}
                    disabled={isPending}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
