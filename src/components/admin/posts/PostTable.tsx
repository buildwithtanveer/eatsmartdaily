"use client";

import { useState, useTransition } from "react";
import { Post, Category, User } from "@prisma/client";
import { Edit, Trash2, Eye, CheckSquare, Square, Filter, Search } from "lucide-react";
import Link from "next/link";
import { togglePostStatus, deletePost, bulkDeletePosts, bulkUpdateStatus } from "@/app/actions/posts";
import { useRouter } from "next/navigation";

interface PostWithRelations extends Post {
  category: Category | null;
  author: User;
}

export default function PostTable({ posts }: { posts: PostWithRelations[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p.id));
    }
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (action: "DELETE" | "PUBLISH" | "DRAFT") => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} ${selectedIds.length} posts?`)) return;

    startTransition(async () => {
      if (action === "DELETE") {
        await bulkDeletePosts(selectedIds);
      } else {
        await bulkUpdateStatus(selectedIds, action === "PUBLISH" ? "PUBLISHED" : "DRAFT");
      }
      setSelectedIds([]);
      router.refresh();
    });
  };

  const handleToggleStatus = (post: Post) => {
    startTransition(async () => {
      await togglePostStatus(post.id, post.status);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      startTransition(async () => {
        await deletePost(id);
      });
    }
  };

  // Filter posts based on search
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search posts..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50/50 p-4 flex flex-wrap items-center gap-4 border-b border-blue-100 backdrop-blur-sm sticky top-0 z-10 animate-in slide-in-from-top-2">
            <span className="text-sm font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-blue-200 hidden sm:block"></div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("PUBLISH")}
                className="text-xs font-bold bg-white text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 disabled:opacity-50 shadow-sm transition-all"
                disabled={isPending}
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction("DRAFT")}
                className="text-xs font-bold bg-white text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-50 disabled:opacity-50 shadow-sm transition-all"
                disabled={isPending}
              >
                Unpublish
              </button>
              <button
                onClick={() => handleBulkAction("DELETE")}
                className="text-xs font-bold bg-white text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 shadow-sm transition-all"
                disabled={isPending}
              >
                Delete
              </button>
            </div>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs text-blue-600 hover:text-blue-800 ml-auto font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="p-4 w-10">
                  <button onClick={handleSelectAll} className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center">
                    {selectedIds.length === posts.length && posts.length > 0 ? (
                      <CheckSquare size={18} className="text-black" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[40%]">Title</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Category</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Author</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%]">Status</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%]">Date</th>
                <th className="p-4 text-right font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-900 text-lg">No posts found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or create a new post.</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm("")}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4">
                      <button onClick={() => handleSelect(post.id)} className="text-gray-400 hover:text-black transition-colors mt-1 flex items-center justify-center">
                        {selectedIds.includes(post.id) ? (
                          <CheckSquare size={18} className="text-black" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 line-clamp-2">{post.title}</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono hidden sm:block truncate max-w-[300px]">{post.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {post.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold border border-gray-200">
                          {post.author.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm text-gray-600 truncate max-w-[100px]">{post.author.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                          post.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                        }`}
                      >
                        {post.status}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap font-medium">
                      {new Date(post.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}