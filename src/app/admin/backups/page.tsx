"use client";

import { useState, useEffect } from "react";

interface Backup {
  id: number;
  filename: string;
  size: string;
  type: string;
  status: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  editor: {
    id: number;
    name: string;
    email: string;
  };
}

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState("FULL");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/backups");
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error("Error fetching backups:", error);
      setMessage({ type: "error", text: "Failed to fetch backups" });
    } finally {
      setIsLoading(false);
    }
  };

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
        setTimeout(fetchBackups, 1000);
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
    }
  };

  const handleRestore = async (backupId: number) => {
    if (!confirm("⚠️ This will restore all data from this backup. Continue?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backups/${backupId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmDeletion: true }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Restore process started" });
        setTimeout(fetchBackups, 1000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to restore backup",
        });
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      setMessage({ type: "error", text: "Failed to restore backup" });
    }
  };

  const handleDelete = async (backupId: number) => {
    if (!confirm("Are you sure you want to delete this backup?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backups/${backupId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Backup deleted successfully" });
        fetchBackups();
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to delete backup",
        });
      }
    } catch (error) {
      console.error("Error deleting backup:", error);
      setMessage({ type: "error", text: "Failed to delete backup" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatBytes = (bytes: string | number) => {
    const num = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (num === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return Math.round((num / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Backup Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create, view, and restore database backups
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Create Backup Section */}
        <div className="bg-white rounded-lg shadow mb-8 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Create New Backup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="FULL">Full Backup (All Data)</option>
                <option value="POSTS_ONLY">Posts & Content Only</option>
                <option value="DATABASE_ONLY">
                  Database Configuration Only
                </option>
                <option value="INCREMENTAL">Incremental Backup</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Before major update"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isCreating ? "Creating..." : "Create Backup"}
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Backup Types:</strong> Full backups include all data.
              Posts-only is faster for content backups. Database-only captures
              settings. Incremental backups only store changes since the last
              backup.
            </p>
          </div>
        </div>

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Backup History
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-600">
              Loading backups...
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No backups found. Create one now!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      By
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {backup.filename}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {backup.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatBytes(backup.size)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            backup.status,
                          )}`}
                        >
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(backup.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {backup.editor.name}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {backup.status === "COMPLETED" && (
                          <>
                            <button
                              onClick={() => handleRestore(backup.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDelete(backup.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {backup.status === "FAILED" && (
                          <button
                            onClick={() => handleDelete(backup.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Important Notes:
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Regular backups are recommended (daily or weekly)</li>
            <li>• Test restore functionality periodically</li>
            <li>• Store backups in a secure, separate location</li>
            <li>• Restore operations will overwrite current data</li>
            <li>• Keep at least one complete backup at all times</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
