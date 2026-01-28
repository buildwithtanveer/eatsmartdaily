"use client";

import { useState } from "react";
import { User, Role } from "@prisma/client";
import { Search, Filter, Mail, Calendar, User as UserIcon } from "lucide-react";
import UserRoleSelect from "./UserRoleSelect";
import DeleteUserButton from "./DeleteUserButton";

export default function UserTable({ users }: { users: User[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
              className="appearance-none bg-white pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins</option>
              <option value="EDITOR">Editors</option>
              <option value="AUTHOR">Authors</option>
              <option value="USER">Users</option>
            </select>
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[30%]">
                  User
                </th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[25%]">
                  Email
                </th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">
                  Role
                </th>
                <th className="p-4 text-left font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">
                  Joined
                </th>
                <th className="p-4 text-right font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-900 text-lg">
                        No users found
                      </p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search or filter.
                      </p>
                      {(searchTerm || roleFilter !== "ALL") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setRoleFilter("ALL");
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0 border border-gray-200">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {user.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <UserRoleSelect userId={user.id} currentRole={user.role} />
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString("en-US")}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <DeleteUserButton userId={user.id} />
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
