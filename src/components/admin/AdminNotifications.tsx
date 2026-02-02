"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, MessageSquare, CheckCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNotificationCounts, NotificationCounts } from "@/app/actions/notifications";

export default function AdminNotifications() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<NotificationCounts>({ pendingComments: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCounts = async () => {
    try {
      const data = await getNotificationCounts();
      setCounts(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Poll every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refetch when navigating to a new page (ensures counts are updated after actions)
  useEffect(() => {
    fetchCounts();
  }, [pathname]);

  const handleNotificationClick = (type: 'comments') => {
    setIsOpen(false);
    // Optimistically update counts to remove the visited notification type
    setCounts(prev => {
      if (type === 'comments') {
        return {
          ...prev,
          total: Math.max(0, prev.total - prev.pendingComments),
          pendingComments: 0
        };
      }
      return prev;
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors group"
      >
        <Bell size={20} className="group-hover:text-black transition-colors" />
        {!loading && counts.total > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
          <div className="px-4 py-3 border-b border-gray-50 mb-1 flex justify-between items-center">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            {counts.total > 0 && (
               <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{counts.total} New</span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : counts.total === 0 ? (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="py-1">
                {counts.pendingComments > 0 && (
                  <Link 
                    href="/admin/comments?status=PENDING" 
                    className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
                    onClick={() => handleNotificationClick('comments')}
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending Comments</p>
                      <p className="text-xs text-gray-500 mt-0.5">You have {counts.pendingComments} comments waiting for approval.</p>
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-50 mt-1">
             <Link 
               href="/admin/activity" 
               className="block px-4 py-2.5 text-xs text-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
               onClick={() => setIsOpen(false)}
             >
               View Activity Log
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
