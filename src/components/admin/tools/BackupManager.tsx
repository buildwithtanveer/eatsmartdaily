"use client";

import { useState } from "react";
import { Download, Loader2, Database } from "lucide-react";

export default function BackupManager() {
  const [isLoading, setIsLoading] = useState(false);

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/backup");
      
      if (!response.ok) {
        throw new Error("Backup failed");
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Backup error:", error);
      alert("Failed to create backup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Database Backup</h2>
            <p className="text-sm text-gray-500 mt-1">
              Export a complete JSON snapshot of your database (users, posts, settings, etc.) for safekeeping.
            </p>
          </div>
        </div>
        <button
          onClick={handleBackup}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:-translate-y-0.5"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {isLoading ? "Generating..." : "Download Backup"}
        </button>
      </div>
    </div>
  );
}
