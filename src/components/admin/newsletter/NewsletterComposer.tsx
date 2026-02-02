"use client";

import { useState, useTransition } from "react";
import { Send, Check, Mail } from "lucide-react";
import { sendNewsletterAction } from "@/app/actions/newsletter";

interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt: Date | null;
  excerpt: string;
  featuredImage: string | null;
}

export default function NewsletterComposer({ posts }: { posts: Post[] }) {
  const [subject, setSubject] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleTogglePost = (id: number) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSend = async (sendTo: "TEST" | "ALL") => {
    setStatus({ type: null, message: "" });
    
    if (!subject) {
      setStatus({ type: "error", message: "Subject is required" });
      return;
    }
    if (selectedPostIds.length === 0) {
      setStatus({ type: "error", message: "Select at least one post" });
      return;
    }
    if (sendTo === "TEST" && !testEmail) {
      setStatus({ type: "error", message: "Test email is required" });
      return;
    }

    if (
      sendTo === "ALL" &&
      !confirm(
        "Are you sure you want to send this newsletter to ALL subscribers?",
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("postIds", JSON.stringify(selectedPostIds));
    formData.append("sendTo", sendTo);
    if (sendTo === "TEST") formData.append("testEmail", testEmail);

    startTransition(async () => {
      const result = await sendNewsletterAction(formData);
      if (result.success) {
        setStatus({
          type: "success",
          message: result.message || "Sent successfully",
        });
      } else {
        setStatus({
          type: "error",
          message: result.message || "Failed to send",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {status.type && (
        <div
          className={`p-4 rounded-md ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {status.message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Compose Newsletter</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g., This Week's Top Nutrition Tips"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Posts
            </label>
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex items-start gap-3 ${selectedPostIds.includes(post.id) ? "bg-emerald-50" : ""}`}
                  onClick={() => handleTogglePost(post.id)}
                >
                  <div
                    className={`w-5 h-5 mt-1 rounded border flex items-center justify-center ${selectedPostIds.includes(post.id) ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}
                  >
                    {selectedPostIds.includes(post.id) && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="text-xs text-gray-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {selectedPostIds.length} posts selected
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Send Options</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <Mail size={18} /> Send Test Email
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 p-2 border rounded-md text-sm outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleSend("TEST")}
                disabled={isPending}
                className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Send Test
              </button>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h3 className="font-medium flex items-center gap-2 mb-3 text-emerald-900">
              <Send size={18} /> Send to All Subscribers
            </h3>
            <p className="text-sm text-emerald-700 mb-3">
              This will send the newsletter to all active subscribers. This
              action cannot be undone.
            </p>
            <button
              onClick={() => handleSend("ALL")}
              disabled={isPending}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? "Sending..." : "Send Newsletter Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
