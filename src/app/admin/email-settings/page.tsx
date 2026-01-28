"use client";

import { useState, useEffect } from "react";
import { useState as useStateCallback } from "react";

interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromName: string;
  fromEmail: string;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<SMTPSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/email-settings", {
        method: "GET",
      });
      const data = await response.json();

      if (data.isConfigured) {
        setSettings(data.smtpSettings);
      } else {
        setSettings({
          host: "",
          port: 587,
          secure: false,
          user: "",
          fromName: "Eat Smart Daily",
          fromEmail: "",
        });
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
      setMessage({
        type: "error",
        text: "Failed to fetch email settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings || !password) {
      setMessage({
        type: "error",
        text: "Please fill in all fields including password",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          pass: password,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Email settings saved successfully",
        });
        setPassword("");
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: "Failed to save email settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyConfiguration = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch("/api/admin/email-settings/verify", {
        method: "PUT",
      });
      const data = await response.json();
      setVerificationResult(data);

      if (data.success) {
        setMessage({
          type: "success",
          text: "SMTP configuration verified successfully",
        });
      } else {
        setMessage({
          type: "error",
          text: `Verification failed: ${data.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("Error verifying configuration:", error);
      setMessage({
        type: "error",
        text: "Failed to verify SMTP configuration",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({
        type: "error",
        text: "Please enter a test email address",
      });
      return;
    }

    try {
      setIsSendingTest(true);
      const response = await fetch("/api/admin/email-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Test email sent to ${testEmail}`,
        });
        setTestEmail("");
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to send test email",
        });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      setMessage({
        type: "error",
        text: "Failed to send test email",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600">Loading email settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure SMTP settings for sending emails
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

        {/* Settings Form */}
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-lg shadow mb-8"
        >
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              SMTP Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings?.host || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s!, host: e.target.value }))
                  }
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={settings?.port || 587}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s!,
                      port: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username / Email
                </label>
                <input
                  type="email"
                  value={settings?.user || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s!, user: e.target.value }))
                  }
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your SMTP password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings?.fromName || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s!, fromName: e.target.value }))
                  }
                  placeholder="Eat Smart Daily"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* From Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings?.fromEmail || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s!, fromEmail: e.target.value }))
                  }
                  placeholder="noreply@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Secure */}
              <div className="flex items-center mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.secure || false}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s!,
                        secure: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Use TLS Encryption (Secure)
                  </span>
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Common SMTP Providers:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <strong>Gmail:</strong> smtp.gmail.com (Port 587)
                </li>
                <li>
                  <strong>Outlook:</strong> smtp.office365.com (Port 587)
                </li>
                <li>
                  <strong>SendGrid:</strong> smtp.sendgrid.net (Port 587)
                </li>
                <li>
                  <strong>Mailgun:</strong> smtp.mailgun.org (Port 587)
                </li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              <button
                type="button"
                onClick={handleVerifyConfiguration}
                disabled={isVerifying}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isVerifying ? "Verifying..." : "Verify Configuration"}
              </button>
            </div>
          </div>
        </form>

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-white rounded-lg shadow mb-8 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Verification Result
            </h2>
            <div
              className={`p-4 rounded-lg ${
                verificationResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={
                  verificationResult.success ? "text-green-800" : "text-red-800"
                }
              >
                {verificationResult.success
                  ? "✓ SMTP configuration is valid"
                  : `✗ ${verificationResult.error || "Verification failed"}`}
              </p>
            </div>
          </div>
        )}

        {/* Test Email */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Send Test Email
          </h2>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
            >
              {isSendingTest ? "Sending..." : "Send Test"}
            </button>
          </div>

          <p className="text-gray-600 text-sm mt-2">
            Send a test email to verify your SMTP configuration is working
            correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
