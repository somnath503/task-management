"use client";

import { MoreHorizontal } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* "To Do" Grouping */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-bold text-theme-text">▾ To Do</span>
        </div>
        
        {/* Table Container using theme tokens */}
        <div className="overflow-hidden rounded-lg border border-theme-border bg-theme-card transition-colors duration-200">
          <table className="w-full text-left text-sm">
            
            {/* Table Header */}
            <thead className="border-b border-theme-border bg-theme-sidebar text-theme-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="divide-y divide-theme-border">
              <tr className="transition-colors hover:bg-theme-border/50">
                <td className="px-4 py-3 font-medium text-theme-text">Design Homepage</td>
                <td className="px-4 py-3 font-medium text-red-500">High</td>
                <td className="px-4 py-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500"></div>
                </td>
                <td className="px-4 py-3 text-theme-muted">12 Sep 2026</td>
                <td className="px-4 py-3 text-right text-theme-muted">
                  <button className="hover:text-theme-text">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
              
              <tr className="transition-colors hover:bg-theme-border/50">
                <td className="px-4 py-3 font-medium text-theme-text">Develop Login Feature</td>
                <td className="px-4 py-3 font-medium text-theme-muted">Low</td>
                <td className="px-4 py-3 font-medium text-theme-text">CN</td>
                <td className="px-4 py-3 text-theme-muted">15 Sep 2026</td>
                <td className="px-4 py-3 text-right text-theme-muted">
                  <button className="hover:text-theme-text">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>

              {/* Inline Add Task Row */}
              <tr>
                <td colSpan={5} className="cursor-pointer px-4 py-3 text-theme-muted transition-colors hover:bg-theme-border/50 hover:text-theme-text">
                  + Add Task
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}