"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-white p-3 hover:bg-white/10 rounded transition"
        aria-label="Open Menu"
      >
        <Menu size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute top-0 left-0 w-[85%] max-w-[300px] h-full bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center bg-[#568c2c] text-white">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsOpen(false)} aria-label="Close Menu" className="p-2 hover:bg-white/10 rounded">
                <X size={28} />
              </button>
            </div>

            <div className="p-4 border-b">
               <form action="/search" className="relative">
                  <input 
                    type="text" 
                    name="q" 
                    placeholder="Search..." 
                    className="w-full border p-2 rounded pr-10 text-black text-[16px]"
                  />
                  <button type="submit" className="absolute right-2 top-2 text-gray-500">
                    <Search size={20} />
                  </button>
               </form>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 text-gray-800 font-medium">
              <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>Home</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>About</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
              <Link href="/blog" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>Blog</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
              <Link href="/category/recipes" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>Recipes</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
              <Link href="/category/healthy-eating" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>Healthy Eating</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
              <Link href="/category/diet-tips" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>Diet Tips</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#568c2c] py-3 px-2 border-b border-gray-100 flex items-center justify-between group">
                <span>Contact</span>
                <span className="text-gray-300 group-hover:text-[#568c2c]">&rsaquo;</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
