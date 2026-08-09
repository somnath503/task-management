"use client";

import React, { useState } from "react";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { 
  LayoutGrid, 
  Folder, 
  Search, 
  SlidersHorizontal, 
  Filter, 
  Plus,
  Menu,
  X
} from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Uses global theme-base and theme-text
    <div className="flex h-screen w-full overflow-hidden bg-theme-base text-theme-text transition-colors duration-200">
      
      {/* Mobile Dark Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Section: Uses theme-sidebar and theme-border */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col border-r border-theme-border bg-theme-sidebar transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between px-4 pt-4 md:hidden">
          <span className="font-bold text-theme-text">AbleSpace Pro</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-md p-1 text-theme-muted hover:bg-theme-border"
          >
            <X size={20} />
          </button>
        </div>

        <ProfileDropdown />

        {/* Navigation Menu */}
        <div className="mt-6 px-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-theme-muted">Workspace</p>
          <nav className="flex flex-col gap-1">
            <a 
              href="/tasks" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md bg-theme-border px-3 py-2 text-sm font-medium text-theme-text transition-colors"
            >
              <LayoutGrid size={18} />
              Tasks
            </a>
            <a 
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-theme-muted transition-colors hover:bg-theme-border hover:text-theme-text"
            >
              <Folder size={18} />
              Projects
            </a>
          </nav>
        </div>
      </aside>

      {/* Task Workspace Section */}
      <main className="flex min-w-0 flex-1 flex-col bg-theme-base">
        
        {/* Header Section */}
        <header className="flex h-[64px] flex-shrink-0 items-center justify-between border-b border-theme-border bg-theme-base px-4 transition-colors duration-200 sm:px-8">
          
          <div className="flex items-center gap-3">
            <button 
              className="block rounded-md text-theme-muted hover:text-theme-text md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-theme-text">Tasks</h1>
          </div>

          {/* Top Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-border text-theme-muted shadow-sm transition-colors hover:bg-theme-border hover:text-theme-text">
              <Search size={16} />
            </button>
            <button className="hidden h-9 items-center gap-2 rounded-md border border-theme-border px-3 text-sm font-medium text-theme-muted shadow-sm transition-colors hover:bg-theme-border hover:text-theme-text sm:flex">
              <SlidersHorizontal size={16} />
              Fields
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-md border border-theme-border text-theme-muted shadow-sm transition-colors hover:bg-theme-border hover:text-theme-text">
              <Filter size={16} />
            </button>
            <button className="flex h-9 items-center gap-2 rounded-md bg-theme-text px-4 text-sm font-medium text-theme-base shadow-md transition-transform hover:opacity-90 active:scale-95">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
      
    </div>
  );
}