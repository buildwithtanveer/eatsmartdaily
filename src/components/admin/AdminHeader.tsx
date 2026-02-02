"use client";

import { Bell, Search, Menu, ChevronDown, LogOut, User as UserIcon, Settings, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

import AdminSearch from "@/components/admin/AdminSearch";
import AdminNotifications from "@/components/admin/AdminNotifications";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return null;
    
    const paths = pathname.split('/').filter(p => p);
    // Remove 'admin' if it's the first item since we are already in admin
    // Actually, showing Admin > ... is fine too, but let's keep it clean
    
    return (
      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 ml-4">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const href = `/${paths.slice(0, index + 1).join('/')}`;
          
          // Capitalize first letter
          const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

          return (
            <div key={path} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
              {isLast ? (
                <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{label}</span>
              ) : (
                <Link href={href} className="hover:text-black hover:underline underline-offset-4 decoration-gray-300 transition-all">
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-200" suppressHydrationWarning>
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Trigger (Visible on small screens) */}
        <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu size={20} />
        </button>
        
        {/* Breadcrumbs */}
        {generateBreadcrumbs()}

        {/* Search Bar - Hidden on mobile, pushed to right on desktop if needed, or kept here */}
        {/* Let's move search bar to be after breadcrumbs or replace if small screen */}
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar (Compact) */}
        <AdminSearch />

        <Link 
          href="/" 
          target="_blank"
          className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50" 
          title="View Live Site"
        >
          <ExternalLink size={16} />
          <span>View Site</span>
        </Link>

        <AdminNotifications />

        <div className="h-8 w-px bg-gray-200 hidden md:block" />

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{user?.role || "Admin"}</p>
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full overflow-hidden border border-gray-200 ring-2 ring-white shadow-sm">
              {user?.image ? (
                <Image 
                  src={user.image} 
                  alt="Profile" 
                  width={36} 
                  height={36} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                  <UserIcon size={18} />
                </div>
              )}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900">My Account</p>
                <p className="text-xs text-gray-500 truncate">{user?.name}</p>
              </div>

              <Link 
                href="/admin/profile" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <UserIcon size={16} />
                My Profile
              </Link>
              
              <Link 
                href="/admin/settings" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              
              <div className="my-1 border-t border-gray-50" />
              
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
