"use client";

import React from "react";

export default function SettingsProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {/* Main Form Box */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#2A2C3D]">
        
        {/* Profile Picture */}
        <div className="flex items-center justify-between border-b border-gray-100 py-4 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile picture</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500"></div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between border-b border-gray-100 py-4 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
          <span className="text-sm text-gray-900 dark:text-white">dexter@gmail.com ✎</span>
        </div>

        {/* Full Name */}
        <div className="flex items-center justify-between border-b border-gray-100 py-4 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name</span>
          <div className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">Dexter</div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-gray-100 py-4 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</p>
            <p className="text-xs text-gray-500">Your job title or role</p>
          </div>
          <div className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">Designer</div>
        </div>

        {/* Username */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</p>
            <p className="text-xs text-gray-500">One word, like a nickname or first name</p>
          </div>
          <div className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">Dexuser</div>
        </div>
      </div>

      {/* Workspace Access Section */}
      <div className="mt-4">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Workspace access</h2>
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#2A2C3D]">
          <span className="text-sm text-gray-500">Remove yourself from the workspace</span>
          <button className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20">
            Leave Workspace
          </button>
        </div>
      </div>
    </div>
  );
}