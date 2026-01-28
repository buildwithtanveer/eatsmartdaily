"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/actions/users";
import { Role } from "@prisma/client";
import { ChevronDown } from "lucide-react";

export default function UserRoleSelect({ userId, currentRole }: { userId: number; currentRole: Role }) {
  const [role, setRole] = useState<Role>(currentRole);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setRole(newRole); // Optimistic update
    
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) {
        setRole(currentRole); // Revert on failure
        alert("Failed to update role");
      }
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={role}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          role === "ADMIN"
            ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 focus:ring-purple-500"
            : role === "EDITOR"
            ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 focus:ring-indigo-500"
            : role === "AUTHOR"
            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 focus:ring-blue-500"
            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 focus:ring-gray-500"
        }`}
      >
        <option value="ADMIN">Admin</option>
        <option value="EDITOR">Editor</option>
        <option value="AUTHOR">Author</option>
        <option value="USER">User</option>
      </select>
      <ChevronDown 
        size={12} 
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
          role === "ADMIN" ? "text-purple-700" :
          role === "EDITOR" ? "text-indigo-700" :
          role === "AUTHOR" ? "text-blue-700" : "text-gray-700"
        }`} 
      />
    </div>
  );
}
