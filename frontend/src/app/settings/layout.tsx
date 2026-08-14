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
    <div className="flex h-screen w-full overflow-hidden bg-theme-base text-theme-text">
      
      {/* Settings Sidebar */}
      <aside className="flex w-[256px] flex-shrink-0 flex-col border-r border-theme-border bg-theme-sidebar p-4">
        <Link 
          href="/tasks" 
          className="mb-8 flex items-center gap-2 text-sm font-medium text-theme-text transition-colors hover:text-theme-muted"
        >
          <ArrowLeft size={16} />
          Back to app
        </Link>

        {/* Search Input */}
        <div className="mb-6 flex items-center gap-2 rounded-md border border-theme-border bg-theme-base px-3 py-2 shadow-sm">
          <Search size={16} className="text-theme-muted" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-transparent text-sm text-theme-text outline-none placeholder:text-theme-muted"
            readOnly
          />
        </div>

        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-3 rounded-md bg-theme-border px-3 py-2 text-sm font-medium text-theme-text">
            <User size={16} /> Profile
          </button>
          <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-theme-muted transition-colors hover:bg-theme-border hover:text-theme-text">
            <Sun size={16} /> Theme
          </button>
          <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-theme-muted transition-colors hover:bg-theme-border hover:text-theme-text">
            <Square size={16} className="fill-current" /> Color
          </button>
        </nav>
      </aside>

      {/* Main Settings Content Area */}
      <main className="flex-1 overflow-y-auto border-l border-theme-border bg-theme-base p-8 lg:p-12">
        <div className="mx-auto max-w-3xl">
          {children}
        </div>
      </main>
    </div>
  );
}