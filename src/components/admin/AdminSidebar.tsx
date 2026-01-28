"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  UtensilsCrossed,
  Tags,
  MessageSquare,
  Image as ImageIcon,
  Megaphone,
  Users,
  Settings,
  Mail,
  Activity,
  Shuffle,
  Wrench,
} from "lucide-react";
import { Role } from "@prisma/client";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { name: "Posts", href: "/admin/posts", icon: FileText, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { name: "Recipes", href: "/admin/recipes", icon: UtensilsCrossed, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { name: "Categories", href: "/admin/categories", icon: Tags, roles: ["ADMIN", "EDITOR"] },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare, roles: ["ADMIN", "EDITOR"] },
  { name: "Messages", href: "/admin/messages", icon: Mail, roles: ["ADMIN", "EDITOR"] },
  { name: "Media", href: "/admin/media", icon: ImageIcon, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { name: "Ads Management", href: "/admin/ads", icon: Megaphone, roles: ["ADMIN", "EDITOR"] },
  { name: "Newsletter", href: "/admin/newsletter", icon: Megaphone, roles: ["ADMIN", "EDITOR"] },
  { name: "Users", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
  { name: "Activity Log", href: "/admin/activity", icon: Activity, roles: ["ADMIN"] },
  { name: "Redirects", href: "/admin/redirects", icon: Shuffle, roles: ["ADMIN", "EDITOR"] },
  { name: "Tools", href: "/admin/tools", icon: Wrench, roles: ["ADMIN", "EDITOR"] },
  { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-72 bg-[#1e1e2d] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 border-r border-gray-800 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
      {/* Logo Area */}
      <div className="p-8 pb-4" suppressHydrationWarning>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-bold text-xl">
            E
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            EatSmart<span className="text-gray-400 font-light">Daily</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Role</span>
            <span className="text-sm font-bold text-white tracking-wide" suppressHydrationWarning>{role}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xl group ${
                isActive
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={20} className={`${isActive ? "text-black" : "text-gray-500 group-hover:text-white"} transition-colors`} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 text-xs text-gray-500 text-center">
        &copy; {new Date().getFullYear()} Eat Smart Daily
      </div>
    </aside>
  );
}
