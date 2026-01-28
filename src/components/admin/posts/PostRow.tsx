"use client";

import { togglePostStatus, deletePost } from "@/app/actions/posts";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  createdAt: string | Date;
  category?: {
    name: string;
  };
}

export default function PostRow({ post }: { post: Post }) {
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = () => {
    startTransition(async () => {
        await togglePostStatus(post.id, post.status);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      startTransition(async () => {
        await deletePost(post.id);
      });
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="p-4">
        <div className="font-medium text-gray-900">{post.title}</div>
        <div className="text-xs text-gray-500">
            {post.category ? post.category.name : "Uncategorized"}
        </div>
      </td>
      <td className="p-4">
        <button
          onClick={handleToggleStatus}
          disabled={isPending}
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
            post.status === "PUBLISHED"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}
        >
          {post.status}
        </button>
      </td>
      <td className="p-4 text-sm text-gray-500">
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="text-gray-400 hover:text-gray-600"
            title="View Live"
          >
            <Eye size={18} />
          </Link>
          <Link
            href={`/admin/posts/${post.id}`}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:text-red-800 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
