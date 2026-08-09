"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, User, Sun, Square } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#FFFFFF] dark:bg-[#1E1F2B]">
      {/* Settings Sidebar */}
      <aside className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#1E1F2B]">
        
        <Link 
          href="/tasks" 
          className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors hover:text-gray-600 dark:text-white"
        >
          <ArrowLeft size={16} />
          Back to app
        </Link>

        {/* Fake Search Input */}
        <div className="mb-6 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
            readOnly
          />
        </div>

        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-3 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-white">
            <User size={16} /> Profile
          </button>
          <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">
            <Sun size={16} /> Theme
          </button>
          <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">
            <Square size={16} className="fill-black text-black dark:fill-white dark:text-white" /> Color
          </button>
        </nav>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}