"use client";

import { createUser } from "@/app/actions/users";
import { useState } from "react";
import { Plus, X, User, Mail, Lock, Shield, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function CreateUserForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createUser(null, formData);

    if (result.success) {
      setMessage("User created successfully");
      (e.target as HTMLFormElement).reset();
      // Optional: Close after delay or keep open for more additions
      setTimeout(() => {
        setIsOpen(false);
        setMessage("");
      }, 2000);
    } else {
      setMessage(result.message || "Failed to create user");
    }
    setIsSubmitting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 shadow-sm transition-all flex items-center gap-2 font-medium text-sm group"
      >
        <Plus size={18} className="group-hover:scale-110 transition-transform" /> 
        <span>Add New User</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/5 rounded-lg text-gray-700">
               <User size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Add New User</h3>
              <p className="text-xs text-gray-500">Create a new account with specific permissions</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              message.includes("success") 
                ? "bg-green-50 text-green-700 border border-green-100" 
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.includes("success") ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white transition-all placeholder:text-gray-400 text-sm font-medium"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white transition-all placeholder:text-gray-400 text-sm font-medium"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white transition-all placeholder:text-gray-400 text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Shield size={18} />
                  </div>
                  <select
                    name="role"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white transition-all appearance-none text-sm font-medium cursor-pointer"
                    defaultValue="AUTHOR"
                  >
                    <option value="ADMIN">ADMIN (Full Access)</option>
                    <option value="EDITOR">EDITOR (Manage Content)</option>
                    <option value="AUTHOR">AUTHOR (Write Posts)</option>
                    <option value="USER">USER (Read Only)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 shadow-sm hover:shadow transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create User
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
