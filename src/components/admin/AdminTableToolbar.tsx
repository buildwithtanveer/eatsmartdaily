"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";

interface AdminTableToolbarProps {
  showSearch?: boolean;
  showLimit?: boolean;
  searchPlaceholder?: string;
}

export default function AdminTableToolbar({
  showSearch = true,
  showLimit = true,
  searchPlaceholder = "Search..."
}: AdminTableToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Update search when user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSearch = searchParams.get("search") || "";
      
      if (searchTerm !== currentSearch) {
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        params.set("page", "1"); // Reset to page 1 on search
        router.push(`?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router, searchParams]);

  const handleLimitChange = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit.toString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      {showSearch && (
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
        {showLimit && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Show</span>
            <select
              value={searchParams.get("limit") || "20"}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        )}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white">
          <Filter size={16} />
          Filter
        </button>
      </div>
    </div>
  );
}
