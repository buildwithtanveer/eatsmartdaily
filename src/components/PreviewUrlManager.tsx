"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, RotateCcw, Trash2 } from "lucide-react";

interface PreviewUrlManagerProps {
  postId: number;
  previewToken?: string | null;
  previewExpiresAt?: string | null;
}

export function PreviewUrlManager({
  postId,
  previewToken: initialToken,
  previewExpiresAt: initialExpiry,
}: PreviewUrlManagerProps) {
  const [previewToken, setPreviewToken] = useState<string | null>(
    initialToken || null,
  );
  const [previewExpiresAt, setPreviewExpiresAt] = useState<string | null>(
    initialExpiry || null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expiresInHours, setExpiresInHours] = useState(48);
  const [copied, setCopied] = useState(false);

  const previewUrl = previewToken
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/preview/${previewToken}`
    : null;

  const isExpired = previewExpiresAt && new Date(previewExpiresAt) < new Date();

  const handleGenerateToken = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/posts/${postId}/preview-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInHours }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate token");
      }

      const data = await res.json();
      setPreviewToken(data.previewToken);
      setPreviewExpiresAt(data.expiresAt);
      setSuccess("Preview link generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate token");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!confirm("Are you sure you want to revoke this preview link?")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/posts/${postId}/preview-token`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to revoke token");
      }

      setPreviewToken(null);
      setPreviewExpiresAt(null);
      setSuccess("Preview link revoked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke token");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Preview Link Sharing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Share a secure preview link with editors and reviewers before
          publishing. The link will expire after the specified time period.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {previewToken ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-600 font-semibold mb-2">
                PREVIEW URL
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previewUrl!}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded bg-white font-mono"
                />
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Expires:</strong>{" "}
                {previewExpiresAt
                  ? new Date(previewExpiresAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Unknown"}
              </p>
              {isExpired && (
                <p className="text-red-600 font-semibold mt-2">
                  ⚠️ This link has expired
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateToken}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RotateCcw size={16} />
                {loading ? "Generating..." : "Generate New Link"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRevokeToken}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Revoke
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Expiration
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4 hours</option>
                <option value={24}>1 day</option>
                <option value={48}>2 days</option>
                <option value={168}>1 week</option>
                <option value={720}>30 days</option>
              </select>
            </div>

            <Button
              onClick={handleGenerateToken}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Preview Link"}
            </Button>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <p className="font-semibold mb-2">💡 Tips:</p>
          <ul className="space-y-1 list-disc pl-4">
            <li>Share the preview link to get feedback before publishing</li>
            <li>Preview links are unique and expire automatically</li>
            <li>Published posts do not require preview links</li>
            <li>Preview pages are excluded from search engines</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
