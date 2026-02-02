"use client";

import { useState, useEffect, useTransition } from "react";
import { Mail, MessageSquare } from "lucide-react";
import MessageActions from "./MessageActions";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPagination from "../AdminPagination";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export default function MessageTable({ 
  initialMessages,
  pagination 
}: { 
  initialMessages: Message[];
  pagination: PaginationInfo;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) params.set("search", searchTerm);
      else params.delete("search");
      params.set("page", "1");
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleLimitChange = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit.toString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-black/5"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative">
        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">From</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[40%]">Subject & Message</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Date</th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%]">Status</th>
                <th className="p-4 text-right font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-900 text-lg">No messages found</p>
                      <p className="text-sm text-gray-500">New contact form submissions will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialMessages.map((msg) => (
                  <tr key={msg.id} className={`hover:bg-gray-50/80 transition-colors group ${!msg.read ? "bg-blue-50/20" : ""}`}>
                    <td className="p-4 align-top">
                      <div className="font-semibold text-gray-900">{msg.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {msg.email}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className={`font-medium mb-1 ${!msg.read ? "text-gray-900" : "text-gray-700"}`}>
                        {msg.subject || "(No Subject)"}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                    </td>
                    <td className="p-4 align-top text-sm text-gray-500 font-medium whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("en-US")}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {!msg.read ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          NEW
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          READ
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageActions messageId={msg.id} isRead={msg.read} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <AdminPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
