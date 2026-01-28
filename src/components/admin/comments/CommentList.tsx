"use client";

import { useState } from "react";
import { approveComment, deleteComment } from "@/app/actions/comments";
import { 
  Check, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  Clock,
} from "lucide-react";
import Link from "next/link";

type Comment = {
  id: number;
  content: string;
  name: string;
  email: string;
  status: "PENDING" | "APPROVED" | "SPAM";
  createdAt: Date;
  post: {
    title: string;
    slug: string;
  };
};

export default function CommentList({ initialComments }: { initialComments: Comment[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    const result = await approveComment(id);
    setLoadingId(null);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setLoadingId(id);
    const result = await deleteComment(id);
    setLoadingId(null);
    if (!result.success) {
      alert(result.message);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50/50">
            <th className="p-4 text-left font-semibold text-gray-600 w-[25%]">Author</th>
            <th className="p-4 text-left font-semibold text-gray-600 w-[35%]">Comment</th>
            <th className="p-4 text-left font-semibold text-gray-600 w-[20%]">Post</th>
            <th className="p-4 text-left font-semibold text-gray-600 w-[10%]">Status</th>
            <th className="p-4 text-right font-semibold text-gray-600 w-[10%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {initialComments.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900">No comments yet</p>
                  <p className="text-sm">Comments posted by users will appear here.</p>
                </div>
              </td>
            </tr>
          ) : (
            initialComments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4 align-top">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitials(comment.name)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{comment.name}</div>
                      <div className="text-sm text-gray-500">{comment.email}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {comment.content}
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="flex items-start gap-2">
                    <Link 
                      href={`/blog/${comment.post.slug}`}
                      target="_blank"
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {comment.post.title}
                    </Link>
                    <ExternalLink className="w-3 h-3 text-gray-400 mt-1 shrink-0" />
                  </div>
                </td>
                <td className="p-4 align-top">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      comment.status === "APPROVED"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : comment.status === "SPAM"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      comment.status === "APPROVED"
                        ? "bg-green-500"
                        : comment.status === "SPAM"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`} />
                    {comment.status.charAt(0) + comment.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="p-4 align-top text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {comment.status !== "APPROVED" && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        disabled={loadingId === comment.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                        title="Approve Comment"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={loadingId === comment.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Delete Comment"
                    >
                      {loadingId === comment.id ? (
                        <span className="w-4 h-4 block border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}