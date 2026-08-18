"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Settings, LogOut } from "lucide-react";
import api from "@/lib/api";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Profile & Appearance States
  const [profile, setProfile] = useState({ fullName: "Loading...", email: "" });
  const [accentGradient, setAccentGradient] = useState("from-blue-500 to-cyan-400");

  useEffect(() => {
    // 1. Fetch updated profile data from your backend
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) setProfile(res.data);
      } catch (error) {
        console.log("Could not fetch profile, using defaults.");
        setProfile({ fullName: "Guest", email: "guest@ablespace.com" });
      }
    };
    fetchProfile();
    window.addEventListener("profileUpdated", fetchProfile);
    // 2. Fetch the saved accent color for the animated avatar
    const colorOptions = [
      { name: "Blue", gradient: "from-blue-500 to-cyan-400" },
      { name: "Purple", gradient: "from-purple-600 to-pink-500" },
      { name: "Pink", gradient: "from-pink-500 to-rose-400" },
      { name: "Orange", gradient: "from-orange-500 to-amber-400" },
      { name: "Green", gradient: "from-emerald-500 to-teal-400" },
    ];
    const savedColor = localStorage.getItem("accentColor") || "Blue";
    const gradient = colorOptions.find(c => c.name === savedColor)?.gradient || "from-blue-500 to-cyan-400";
    setAccentGradient(gradient);
  }, [isOpen]); // Re-run when opened so it always grabs the latest data if you just changed it in settings

  // Click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mt-4 flex h-[48px] w-full items-center justify-between px-4 transition-colors hover:bg-theme-border"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${accentGradient} text-sm font-bold text-white shadow-sm`}>
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-sm font-bold text-theme-text">{profile.fullName}</span>
        </div>
        <ChevronRight 
          size={16} 
          className={`shrink-0 text-theme-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} 
        />
      </button>

      {/* Clean, Single-Level Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-4 top-[60px] z-50 w-[240px] rounded-xl border border-theme-border bg-theme-card py-2 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex flex-col items-center border-b border-theme-border pb-4 pt-2">
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr ${accentGradient} text-xl font-bold text-white shadow-sm`}>
               {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-theme-text">{profile.fullName}</span>
            <span className="text-xs text-theme-muted">{profile.email}</span>
          </div>
          
          <div className="py-2">
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-theme-text hover:bg-theme-border transition-colors"
            >
              <Settings size={16} className="text-theme-muted" /> Settings
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} className="text-red-500" /> Log out
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}