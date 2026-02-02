"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, Database, AlertCircle, CheckCircle, Clock, Save } from "lucide-react";
import { getBackupSettings, updateBackupSettings } from "@/app/actions/backup";

export default function BackupManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  
  // Automation Settings State
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    getBackupSettings().then((s) => {
      setAutoEnabled(s.autoBackupEnabled);
      setFrequency(s.autoBackupFrequency);
      setSettingsLoaded(true);
    });
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      await updateBackupSettings(autoEnabled, frequency);
      alert("Backup schedule updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      setStatus("running");
      setProgress(5); // Initial progress

      const response = await fetch("/api/admin/backups", {
        method: "POST",
        body: JSON.stringify({ type: "FULL" })
      });
      
      if (!response.ok) {
        throw new Error("Backup failed to start");
      }

      const { backupId } = await response.json();

      // Poll for status
      const interval = setInterval(async () => {
        try {
          const check = await fetch(`/api/admin/backups/${backupId}?check=true`);
          if (!check.ok) return;

          const data = await check.json();
          setProgress(data.progress || 0);

          if (data.status === "COMPLETED") {
            clearInterval(interval);
            setStatus("completed");
            setIsLoading(false);
            setProgress(100);
            
            // Trigger download
            const downloadUrl = `/api/admin/backups/${backupId}`;
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else if (data.status === "FAILED") {
            clearInterval(interval);
            setStatus("error");
            setIsLoading(false);
            alert("Backup failed: " + (data.errorMessage || "Unknown error"));
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000);

    } catch (error) {
      console.error("Backup error:", error);
      setStatus("error");
      setIsLoading(false);
      alert("Failed to create backup. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Backup Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manual Backup</h2>
              <p className="text-sm text-gray-500 mt-1">
                Export a complete JSON snapshot of your database immediately.
              </p>
              {status === "running" && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-1">Processing... {progress}%</p>
                </div>
              )}
              {status === "completed" && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Backup completed successfully
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Backup failed
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleBackup}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:-translate-y-0.5"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {isLoading ? "Backing up..." : "Download Backup"}
          </button>
        </div>
      </div>

      {/* Automation Settings Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Automated Schedule</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure automatic backups to run in the background.
            </p>
            
            {settingsLoaded ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={autoEnabled}
                    onChange={(e) => setAutoEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Automation</span>
                </label>

                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={!autoEnabled}
                  className="block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all text-sm ml-auto"
                >
                  {isSavingSettings ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Schedule
                </button>
              </div>
            ) : (
               <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                 <Loader2 className="animate-spin" size={16} /> Loading settings...
               </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500">
              <p><strong>Note:</strong> Automated backups require an external trigger (like Vercel Cron or a system task) to hit <code>/api/cron/backup</code> periodically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
