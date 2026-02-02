"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, RotateCcw, FileBox, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Use a simplified type that matches what we pass from the server
interface Backup {
  id: number;
  filename: string;
  size: string; // Passed as string to avoid BigInt issues
  type: string;
  status: string;
  description?: string | null;
  createdAt: string | Date;
  completedAt?: string | Date | null;
  errorMessage?: string | null;
  editor: {
    id: number;
    name: string;
    email: string;
  };
}

export default function BackupList({ backups }: { backups: Backup[] }) {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRestore = async (backupId: number) => {
    if (!confirm("⚠️ This will restore all data from this backup. Current data will be overwritten. Continue?")) {
      return;
    }

    try {
      setRestoringId(backupId);
      const response = await fetch(`/api/admin/backups/${backupId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmDeletion: true }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Restore process started successfully" });
        router.refresh();
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to start restore",
        });
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      setMessage({ type: "error", text: "Failed to restore backup" });
    } finally {
      setRestoringId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle size={16} className="text-green-600" />;
      case "FAILED": return <XCircle size={16} className="text-red-600" />;
      case "IN_PROGRESS": return <Clock size={16} className="text-blue-600 animate-pulse" />;
      default: return <AlertTriangle size={16} className="text-yellow-600" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-50 text-green-700 border-green-200";
      case "FAILED": return "bg-red-50 text-red-700 border-red-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const formatSize = (bytes: string | number) => {
    const size = Number(bytes);
    if (isNaN(size)) return "0 B";
    if (size === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {message && (
        <div className={`p-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-700 border-b border-green-100" : "bg-red-50 text-red-700 border-b border-red-100"}`}>
          {message.text}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%]">Backup Info</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Type</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Size</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Created By</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <FileBox className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="font-medium">No backups found</p>
                  </div>
                </td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm truncate max-w-[200px]" title={backup.filename}>
                        {backup.filename}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true })}
                      </span>
                      {backup.description && (
                        <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={backup.description}>
                          {backup.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {backup.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-600">
                    {formatSize(backup.size)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      {backup.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {backup.editor?.name || "System"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {backup.status === "COMPLETED" && (
                        <>
                          <a
                            href={`/api/admin/backups/${backup.id}/download`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </a>
                          <button
                            onClick={() => handleRestore(backup.id)}
                            disabled={restoringId === backup.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Restore"
                          >
                            {restoringId === backup.id ? (
                              <RotateCcw size={18} className="animate-spin" />
                            ) : (
                              <RotateCcw size={18} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
