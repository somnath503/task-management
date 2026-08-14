"use client";

import React from "react";
import { Pencil } from "lucide-react";

export default function SettingsProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-theme-text">Profile</h1>

      {/* Main Form Box */}
      <div className="rounded-xl border border-theme-border bg-theme-card p-6 shadow-sm">
        
        {/* Profile Picture */}
        <div className="flex items-center justify-between border-b border-theme-border py-4">
          <span className="text-sm font-medium text-theme-text">Profile picture</span>
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 shadow-sm"></div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between border-b border-theme-border py-4">
          <span className="text-sm font-medium text-theme-text">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-theme-text">dexter@gmail.com</span>
            <Pencil size={14} className="cursor-pointer text-theme-muted transition-colors hover:text-theme-text" />
          </div>
        </div>

        {/* Full Name */}
        <div className="flex items-center justify-between border-b border-theme-border py-4">
          <span className="text-sm font-medium text-theme-text">Full name</span>
          <div className="w-[200px] rounded-md border border-theme-border bg-theme-sidebar px-3 py-1.5 text-sm text-theme-muted">
            Dexter
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-theme-border py-4">
          <div>
            <p className="text-sm font-medium text-theme-text">Title</p>
            <p className="text-xs text-theme-muted">Your job title or role</p>
          </div>
          <div className="w-[200px] rounded-md border border-theme-border bg-theme-sidebar px-3 py-1.5 text-sm text-theme-muted">
            Designer
          </div>
        </div>

        {/* Username */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm font-medium text-theme-text">Username</p>
            <p className="text-xs text-theme-muted">One word, like a nickname or first name</p>
          </div>
          <div className="w-[200px] rounded-md border border-theme-border bg-theme-sidebar px-3 py-1.5 text-sm text-theme-muted">
            Dexuser
          </div>
        </div>
      </div>

      {/* Workspace Access Section */}
      <div className="mt-2">
        <h2 className="mb-4 text-lg font-bold text-theme-text">Workspace access</h2>
        <div className="flex items-center justify-between rounded-xl border border-theme-border bg-theme-card p-6 shadow-sm">
          <span className="text-sm text-theme-muted">Remove yourself from the workspace</span>
          <button className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
            Leave Workspace
          </button>
        </div>
      </div>
    </div>
  );
}