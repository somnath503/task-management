"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Sun, 
  Moon, 
  Settings, 
  Check, 
  Square
} from "lucide-react";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"main" | "theme" | "color">("main");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTimeout(() => setActiveMenu("main"), 200); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colorModes = [
    { name: "Amber", hex: "bg-amber-500" },
    { name: "Blue", hex: "bg-blue-500" },
    { name: "Pink", hex: "bg-pink-500" },
    { name: "Rose", hex: "bg-rose-500" },
    { name: "Emerald", hex: "bg-emerald-500" },
    { name: "Black", hex: "bg-black dark:bg-white" },
  ];

  const [activeColor, setActiveColor] = useState("Blue");

  return (
    <div className="relative w-full" ref={dropdownRef}>
      
      {/* Trigger Button - Using global hover state and theme-text */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mt-4 flex h-[48px] w-full items-center justify-between px-4 transition-colors hover:bg-theme-border"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 shadow-sm"></div>
          <span className="text-sm font-bold text-theme-text">Dexter</span>
        </div>
        <ChevronRight 
          size={16} 
          className={`text-theme-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} 
        />
      </button>

      {/* Dropdown Panel - Replaced hardcoded bg with bg-theme-card and border-theme-border */}
      {isOpen && (
        <div className="absolute left-4 top-[60px] z-50 w-[240px] rounded-xl border border-theme-border bg-theme-card py-2 shadow-lg">
          
          {/* MAIN MENU */}
          {activeMenu === "main" && (
            <div className="flex flex-col">
              <div className="flex flex-col items-center border-b border-theme-border pb-4 pt-2">
                <div className="mb-2 h-12 w-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 shadow-sm"></div>
                <span className="text-sm font-bold text-theme-text">Dexter</span>
                <span className="text-xs text-theme-muted">Dexter@gmail.com</span>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={() => setActiveMenu("theme")}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-theme-text hover:bg-theme-border"
                >
                  <div className="flex items-center gap-2"><Sun size={16} /> Change Theme</div>
                  <ChevronRight size={16} className="text-theme-muted" />
                </button>
                <button 
                  onClick={() => setActiveMenu("color")}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-theme-text hover:bg-theme-border"
                >
                  <div className="flex items-center gap-2"><Square size={16} className="fill-purple-500 text-purple-500" /> Color Mode</div>
                  <ChevronRight size={16} className="text-theme-muted" />
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-theme-text hover:bg-theme-border"
                >
                  <Settings size={16} /> Settings
                </button>
              </div>
            </div>
          )}

          {/* THEME MENU */}
          {activeMenu === "theme" && (
            <div className="flex flex-col py-2">
              <p className="mb-2 px-4 text-xs font-semibold text-theme-muted">Theme</p>
              <button 
                onClick={() => setTheme("light")}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-theme-text hover:bg-theme-border"
              >
                <div className="flex items-center gap-2"><Sun size={16} /> Light</div>
                {theme === "light" && <Check size={16} className="text-theme-text" />}
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-theme-text hover:bg-theme-border"
              >
                <div className="flex items-center gap-2"><Moon size={16} /> Dark</div>
                {theme === "dark" && <Check size={16} className="text-theme-text" />}
              </button>
            </div>
          )}

          {/* COLOR MODE MENU */}
          {activeMenu === "color" && (
            <div className="flex flex-col py-2">
              <p className="mb-2 px-4 text-xs font-semibold text-theme-muted">Color Mode</p>
              {colorModes.map((color) => (
                <button 
                  key={color.name}
                  onClick={() => setActiveColor(color.name)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-theme-text hover:bg-theme-border"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-[4px] ${color.hex}`}></div>
                    {color.name}
                  </div>
                  {activeColor === color.name && <Check size={16} className="text-theme-text" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}