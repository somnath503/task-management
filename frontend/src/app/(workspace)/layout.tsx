"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { 
  LayoutGrid, Folder, Search, Menu, X, PanelLeft, ChevronDown, ChevronRight, Plus
} from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(true);

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [headerTaskTitle, setHeaderTaskTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Backlog"); 

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname.startsWith(path);
  
  // Dynamic Route Checks
  const isProjectsPage = pathname.startsWith('/projects');
  const isDetailPage = pathname.split('/').length > 2; // Hides button on details pages

  // Click Outside Listener for the Status Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openTaskModal = (status: string) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
    setIsAddModalOpen(true);
  };

  const handleHeaderAdd = async () => {
    if (headerTaskTitle.trim() === "") return;
    try {
      const token = localStorage.getItem("token");
      
      // Dynamic Submission: Project vs Task
      if (isProjectsPage) {
        await axios.post("http://localhost:3001/projects", {
          name: headerTaskTitle,
          priority: "Normal",
          status: "Planning"
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("http://localhost:3001/tasks", {
          fullName: headerTaskTitle,
          lastName: "Pending Details",
          status: selectedStatus 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setIsAddModalOpen(false);
      setHeaderTaskTitle("");
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to add from header:", error);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-theme-base text-theme-text transition-colors duration-200">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Global Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-theme-border bg-theme-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-theme-text">
                {isProjectsPage ? "Add Project" : "Add Task"}
              </h2>
              {!isProjectsPage && (
                <span className="rounded-full bg-theme-border px-2 py-1 text-xs font-medium text-theme-muted">
                  {selectedStatus === 'Backlog' ? 'To Do' : selectedStatus === 'In Progress' ? 'Doing' : 'Completed'}
                </span>
              )}
            </div>
            <input 
              autoFocus
              type="text"
              value={headerTaskTitle}
              onChange={(e) => setHeaderTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleHeaderAdd()}
              placeholder={isProjectsPage ? "Project Name..." : "What needs to be done?"}
              className="mb-4 w-full rounded-md border border-theme-border bg-theme-base p-3 text-sm text-theme-text outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-theme-muted hover:bg-theme-border hover:text-theme-text">Cancel</button>
              <button onClick={handleHeaderAdd} className="rounded-md bg-theme-text px-4 py-2 text-sm font-medium text-theme-base hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-theme-sidebar transition-all duration-300 ease-in-out md:relative md:overflow-hidden ${isMobileMenuOpen ? "w-[256px] translate-x-0 border-r border-theme-border" : "w-[256px] -translate-x-full border-transparent md:border-theme-border"} ${isDesktopSidebarOpen ? "md:w-[256px] md:translate-x-0 md:border-r" : "md:w-0 md:-translate-x-full md:border-none"}`}>
        <div className="flex h-full w-[256px] flex-shrink-0 flex-col">
          <div className="flex items-center justify-between px-4 pt-4 md:hidden">
            <span className="font-bold text-theme-text">AbleSpace Pro</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-md p-1 text-theme-muted hover:bg-theme-border"><X size={20} /></button>
          </div>
          <ProfileDropdown />
          <div className="mt-6 px-4">
            <button onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)} className="mb-2 flex w-full items-center justify-between px-2 text-xs font-semibold text-theme-text hover:text-theme-muted">
              <span>Workspace</span>
              {isWorkspaceMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <nav className={`flex flex-col gap-1 overflow-hidden transition-all duration-200 ${isWorkspaceMenuOpen ? "max-h-[200px]" : "max-h-0"}`}>
              <Link href="/tasks" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive("/tasks") ? "bg-theme-border text-theme-text" : "text-theme-muted hover:bg-theme-border hover:text-theme-text"}`}>
                <LayoutGrid size={18} /> Tasks
              </Link>
              <Link href="/projects" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive("/projects") ? "bg-theme-border text-theme-text" : "text-theme-muted hover:bg-theme-border hover:text-theme-text"}`}>
                <Folder size={18} /> Projects
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-theme-base">
        <header className="flex h-[64px] flex-shrink-0 items-center justify-between border-b border-theme-border bg-theme-base px-4 transition-colors duration-200 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="block rounded-md text-theme-muted hover:text-theme-text md:hidden" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <div className="hidden items-center gap-3 md:flex">
              <button onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} className="flex h-8 w-8 items-center justify-center rounded-md text-theme-muted transition-colors hover:bg-theme-border hover:text-theme-text"><PanelLeft size={18} /></button>
              <div className="flex items-center gap-2 text-sm text-theme-muted">
                <span className="font-medium text-theme-text capitalize">{pathname.split('/')[1] || 'Dashboard'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {!isDetailPage && (
              <div className="relative" ref={dropdownRef}>
                {isProjectsPage ? (
                  <button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="flex h-9 items-center gap-2 rounded-md bg-theme-text px-4 text-sm font-medium text-theme-base shadow-md transition-transform hover:opacity-90 active:scale-95"
                  >
                    <Plus size={16} /> <span className="hidden sm:inline">Add Project</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} 
                    className="flex h-9 items-center gap-2 rounded-md bg-theme-text px-4 text-sm font-medium text-theme-base shadow-md transition-transform hover:opacity-90 active:scale-95"
                  >
                    <Plus size={16} /> <span className="hidden sm:inline">Add Task</span>
                  </button>
                )}
                
                {isStatusDropdownOpen && !isProjectsPage && (
                  <div className="absolute right-0 top-11 z-50 w-40 rounded-lg border border-theme-border bg-theme-card p-1 shadow-lg">
                    <div className="px-2 py-1.5 text-xs font-semibold text-theme-muted">Select Section</div>
                    <button onClick={() => openTaskModal('Backlog')} className="w-full rounded-md px-2 py-2 text-left text-sm text-theme-text hover:bg-theme-border">To Do</button>
                    <button onClick={() => openTaskModal('In Progress')} className="w-full rounded-md px-2 py-2 text-left text-sm text-theme-text hover:bg-theme-border">Doing</button>
                    <button onClick={() => openTaskModal('Done')} className="w-full rounded-md px-2 py-2 text-left text-sm text-theme-text hover:bg-theme-border">Completed</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}