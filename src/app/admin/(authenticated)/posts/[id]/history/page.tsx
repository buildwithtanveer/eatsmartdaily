"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PostVersion {
  id: number;
  postId: number;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
  createdBy: number;
  createdAt: string;
  changeDescription?: string;
  editor: {
    id: number;
    name?: string;
    email: string;
  };
}

export default function PostHistoryPage() {
  const params = useParams();
  const postId = params.id as string;
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PostVersion | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [postId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/posts/${postId}/versions`);
      if (!res.ok) throw new Error("Failed to fetch versions");
      const data = await res.json();
      setVersions(data.versions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch versions");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: number) => {
    if (
      !confirm(
        "Are you sure you want to restore this version? Current changes will be saved as a new version.",
      )
    ) {
      return;
    }

    try {
      setRestoring(versionId);
      const res = await fetch(
        `/api/admin/posts/${postId}/versions/${versionId}/restore`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Failed to restore version");
      setError(null);
      fetchVersions();
      alert("Version restored successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restore version",
      );
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (versionId: number) => {
    if (!confirm("Are you sure you want to delete this version?")) {
      return;
    }

    try {
      setDeleting(versionId);
      const res = await fetch(
        `/api/admin/posts/${postId}/versions/${versionId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete version");
      setError(null);
      fetchVersions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete version");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatContent = (content: string, maxLength = 100) => {
    const stripped = content.replace(/<[^>]*>/g, "").trim();
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength) + "..."
      : stripped;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post Version History</h1>
          <p className="text-gray-500 mt-1">
            View and restore previous versions of this post
          </p>
        </div>
        <Link href={`/admin/posts/${postId}/edit`}>
          <Button variant="outline">Back to Editor</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Loading versions...</p>
          </CardContent>
        </Card>
      ) : versions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">
              No versions yet. Start editing to create version history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {versions.map((version) => (
              <Card
                key={version.id}
                className={`cursor-pointer transition-colors ${
                  selectedVersion?.id === version.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-400"
                }`}
                onClick={() => {
                  setSelectedVersion(version);
                  setShowPreview(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{version.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="space-y-1">
                          <p>
                            <strong>Date:</strong>{" "}
                            {formatDate(version.createdAt)}
                          </p>
                          <p>
                            <strong>Editor:</strong>{" "}
                            {version.editor.name || version.editor.email}
                          </p>
                          <p>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                version.status === "PUBLISHED"
                                  ? "bg-green-100 text-green-800"
                                  : version.status === "DRAFT"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {version.status}
                            </span>
                          </p>
                          {version.changeDescription && (
                            <p>
                              <strong>Changes:</strong>{" "}
                              {version.changeDescription}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            {formatContent(version.content, 150)}
                          </p>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVersion(version);
                        setShowPreview(true);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(version.id);
                      }}
                      disabled={restoring === version.id}
                    >
                      {restoring === version.id ? "Restoring..." : "Restore"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(version.id);
                      }}
                      disabled={deleting === version.id}
                    >
                      {deleting === version.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preview Modal */}
          {showPreview && selectedVersion && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedVersion.title}</CardTitle>
                      <CardDescription>
                        {formatDate(selectedVersion.createdAt)} by{" "}
                        {selectedVersion.editor.name ||
                          selectedVersion.editor.email}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowPreview(false)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {selectedVersion.excerpt && (
                      <p className="italic text-gray-600 mb-4">
                        {selectedVersion.excerpt}
                      </p>
                    )}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedVersion.content,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
