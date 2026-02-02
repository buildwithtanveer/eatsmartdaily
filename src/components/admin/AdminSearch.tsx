"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Search, Loader2, FileText, LayoutGrid, Settings, ChevronRight, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch, SearchResult } from "@/app/actions/search";

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (!query) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearch(query);
        setResults(data);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "PAGE": return <Settings size={14} className="text-gray-500" />;
      case "POST": return <FileText size={14} className="text-blue-500" />;
      case "CATEGORY": return <LayoutGrid size={14} className="text-green-500" />;
      default: return <Hash size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-64 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-300 transition-all mr-2">
        {isPending ? (
          <Loader2 size={16} className="text-gray-400 animate-spin" />
        ) : (
          <Search size={16} className="text-gray-400" />
        )}
        <input
          type="text"
          placeholder="Search (Ctrl+K)"
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-700"
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            setQuery(nextQuery);
            if (!nextQuery) {
              setResults([]);
            }
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[320px]">
          {isPending ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2 max-h-[400px] overflow-y-auto">
              {/* Group by type roughly or just list them */}
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.url)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                >
                  <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 group-hover:border-gray-200 transition-colors`}>
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          )}
          
          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>Press Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
