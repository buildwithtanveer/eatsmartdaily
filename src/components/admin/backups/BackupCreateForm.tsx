"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Database, FileText, Server } from "lucide-react";

export default function BackupCreateForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState("FULL");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          description: description || undefined,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Backup created successfully" });
        setDescription("");
        router.refresh();
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to create backup",
        });
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      setMessage({ type: "error", text: "Failed to create backup" });
    } finally {
      setIsCreating(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
        <div className="flex-1 w-full space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Database size={20} className="text-gray-400" />
            Create New Backup
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Backup Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType("FULL")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${selectedType === "FULL" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                >
                  <Server size={14} /> Full
                </button>
                <button
                  onClick={() => setSelectedType("POSTS_ONLY")}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${selectedType === "POSTS_ONLY" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                >
                  <FileText size={14} /> Posts
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Before update v2.0"
                className="w-full border border-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="w-full md:w-auto bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium shadow-sm flex items-center justify-center gap-2 h-[42px]"
        >
          {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          {isCreating ? "Creating..." : "Start Backup"}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
