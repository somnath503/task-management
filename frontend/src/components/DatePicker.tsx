"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DatePicker({ onClose }: { onClose?: () => void }) {
  // Static state for demonstration; you can connect this to a real date library like date-fns later
  const [currentMonth, setCurrentMonth] = useState("January 2026");
  
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  // Generating a standard 35-day grid for the mockup (includes previous/next month overflow)
  const calendarDays = [
    { day: 30, isCurrentMonth: false }, { day: 1, isCurrentMonth: true }, { day: 2, isCurrentMonth: true }, 
    { day: 3, isCurrentMonth: true }, { day: 4, isCurrentMonth: true }, { day: 5, isCurrentMonth: true }, { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true }, { day: 8, isCurrentMonth: true }, { day: 9, isCurrentMonth: true }, 
    { day: 10, isCurrentMonth: true, isSelected: true }, { day: 11, isCurrentMonth: true }, { day: 12, isCurrentMonth: true }, { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true }, { day: 15, isCurrentMonth: true }, { day: 16, isCurrentMonth: true }, 
    { day: 17, isCurrentMonth: true }, { day: 18, isCurrentMonth: true }, { day: 19, isCurrentMonth: true }, { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true }, { day: 22, isCurrentMonth: true }, { day: 23, isCurrentMonth: true }, 
    { day: 24, isCurrentMonth: true }, { day: 25, isCurrentMonth: true }, { day: 26, isCurrentMonth: true }, { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true }, { day: 29, isCurrentMonth: true }, { day: 30, isCurrentMonth: true }, 
    { day: 31, isCurrentMonth: true }, { day: 1, isCurrentMonth: false }, { day: 2, isCurrentMonth: false }, { day: 3, isCurrentMonth: false },
  ];

  return (
    <div className="absolute top-full z-50 mt-2 w-[280px] rounded-xl border border-theme-border bg-theme-card p-4 shadow-lg">
      
      {/* Month Navigation Header */}
      <div className="mb-4 flex items-center justify-between">
        <button className="rounded-md p-1 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-theme-text">{currentMonth}</span>
        <button className="rounded-md p-1 text-theme-muted hover:bg-theme-border hover:text-theme-text transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-theme-muted">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            onClick={() => {
               // Add real date selection logic here
               if (onClose) onClose();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              date.isSelected
                ? "bg-theme-text text-theme-base font-bold shadow-md"
                : date.isCurrentMonth
                ? "text-theme-text hover:bg-theme-border"
                : "text-theme-muted opacity-50 hover:bg-theme-border hover:opacity-100"
            }`}
          >
            {date.day}
          </button>
        ))}
      </div>
    </div>
  );
}