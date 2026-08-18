"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search, User, Sun, Palette, Save, CheckCircle2, Monitor, Moon, Pointer
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes"; 
import api from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  
  // Use next-themes instead of manual state
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"profile" | "theme" | "color">("profile");

  // Profile State
  const [profile, setProfile] = useState({
    fullName: "Dexter",
    email: "dexter@gmail.com",
    title: "Designer",
    username: "Dexuser"
  });
  const [isSaving, setIsSaving] = useState(false);

  // Appearance State
  const [accentColor, setAccentColor] = useState("Blue");
  const [isPreviewClicked, setIsPreviewClicked] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); // Ensures themes render correctly on the client side
    const savedColor = localStorage.getItem("accentColor") || "Blue";
    setAccentColor(savedColor);

    // Simulated API fetch for profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await api.get("/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Merge incoming data, preserving defaults if a field is completely missing
          if (res.data) setProfile({ ...profile, ...res.data });
        }
      } catch (error) {
        console.log("Using default profile data.");
      }
    };
    fetchProfile();
  }, []);

  // Handle Profile Save
  
  // Handle Profile Save
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Clean API call (token is handled by api.ts automatically)
      await api.patch("/users/me", profile);
      
      // 🚀 THE MAGIC LINE: Tell the ProfileDropdown to re-fetch the data instantly!
      window.dispatchEvent(new Event("profileUpdated"));
      
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
    // Simulate network delay for UI feedback
    setTimeout(() => setIsSaving(false), 1000);
  };

  // Color Definitions for the Animated DP and UI
  const colorOptions = [
    { name: "Blue", gradient: "from-blue-500 to-cyan-400", hex: "#3b82f6" },
    { name: "Purple", gradient: "from-purple-600 to-pink-500", hex: "#a855f7" },
    { name: "Pink", gradient: "from-pink-500 to-rose-400", hex: "#ec4899" },
    { name: "Orange", gradient: "from-orange-500 to-amber-400", hex: "#f97316" },
    { name: "Green", gradient: "from-emerald-500 to-teal-400", hex: "#10b981" },
  ];

  const currentGradient = colorOptions.find(c => c.name === accentColor)?.gradient || "from-blue-500 to-cyan-400";

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-theme-base text-theme-text transition-colors duration-300">
      
      {/* Settings Sidebar */}
      <aside className="flex w-full md:w-[256px] flex-shrink-0 flex-col border-r border-theme-border bg-theme-sidebar p-4 transition-colors duration-300 z-10">
        
        {/* Fixed Back Button using Next/Link */}
        <Link 
          href="/tasks" 
          className="mb-6 md:mb-8 flex items-center gap-2 text-sm font-bold text-theme-text transition-transform hover:-translate-x-1 hover:text-blue-500"
        >
          <ArrowLeft size={16} />
          Back to app
        </Link>

        {/* Search Input - Disabled as requested */}
        {/* <div className="hidden md:flex mb-6 items-center gap-2 rounded-lg border border-theme-border bg-theme-base px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Search size={16} className="text-theme-muted" />
          <input 
            type="text" 
            placeholder="Search settings..." 
            className="w-full bg-transparent text-sm text-theme-text outline-none placeholder:text-theme-muted"
          />
        </div> */}

        {/* Navigation Tabs */}
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === "profile" ? 'bg-theme-border text-theme-text shadow-sm' : 'text-theme-muted hover:bg-theme-border/50 hover:text-theme-text'}`}
          >
            <User size={16} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab("theme")}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === "theme" ? 'bg-theme-border text-theme-text shadow-sm' : 'text-theme-muted hover:bg-theme-border/50 hover:text-theme-text'}`}
          >
            <Sun size={16} /> Theme
          </button>
          <button 
            onClick={() => setActiveTab("color")}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === "color" ? 'bg-theme-border text-theme-text shadow-sm' : 'text-theme-muted hover:bg-theme-border/50 hover:text-theme-text'}`}
          >
            <Palette size={16} /> Accent Color
          </button>
        </nav>
      </aside>

      {/* Main Settings Content Area */}
      <main className="flex-1 overflow-y-auto border-t md:border-t-0 md:border-l border-theme-border bg-theme-base p-6 lg:p-12 transition-colors duration-300">
        <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-theme-text">Profile Settings</h1>
                <button 
                  onClick={handleSaveProfile}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all active:scale-95 bg-gradient-to-tr ${currentGradient} hover:opacity-90`}
                >
                  {isSaving ? <CheckCircle2 size={16} className="animate-pulse" /> : <Save size={16} />}
                  {isSaving ? "Saved!" : "Save Changes"}
                </button>
              </div>

              <div className="rounded-xl border border-theme-border bg-theme-card p-6 shadow-sm transition-colors duration-300">
                
                {/* Animated Profile Picture */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-border py-5 gap-4">
                  <div>
                    <span className="text-sm font-bold text-theme-text">Profile picture</span>
                    <p className="text-xs text-theme-muted mt-1">Avatar dynamically uses your name and accent color.</p>
                  </div>
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg bg-gradient-to-tr ${currentGradient} transition-all duration-500 hover:scale-105`}>
                    <div className="absolute inset-0 rounded-full bg-black/10 mix-blend-overlay animate-pulse" />
                    <span className="relative z-10 text-2xl font-black text-white shadow-sm tracking-widest drop-shadow-md">
                      {/* Added null safety checks for the initial */}
                      {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-border py-5 gap-2">
                  <span className="text-sm font-bold text-theme-text">Email Address</span>
                  <input 
                    type="email"
                    value={profile.email || ""} // Prevent uncontrolled input warning
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full md:w-[280px] rounded-lg border border-theme-border bg-theme-sidebar px-3 py-2 text-sm text-theme-text outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Full Name Input */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-border py-5 gap-2">
                  <span className="text-sm font-bold text-theme-text">Full Name</span>
                  <input 
                    type="text"
                    value={profile.fullName || ""} // Prevent uncontrolled input warning
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    className="w-full md:w-[280px] rounded-lg border border-theme-border bg-theme-sidebar px-3 py-2 text-sm text-theme-text outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Title Input */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-border py-5 gap-2">
                  <div>
                    <p className="text-sm font-bold text-theme-text">Job Title</p>
                    <p className="text-xs text-theme-muted mt-1">Role in the workspace</p>
                  </div>
                  <input 
                    type="text"
                    value={profile.title || ""} // Prevent uncontrolled input warning
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    className="w-full md:w-[280px] rounded-lg border border-theme-border bg-theme-sidebar px-3 py-2 text-sm text-theme-text outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Username Input */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pt-5 gap-2">
                  <div>
                    <p className="text-sm font-bold text-theme-text">Username</p>
                    <p className="text-xs text-theme-muted mt-1">Colleagues will tag you (@name)</p>
                  </div>
                  <input 
                    type="text"
                    value={profile.username || ""} // Prevent uncontrolled input warning
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="w-full md:w-[280px] rounded-lg border border-theme-border bg-theme-sidebar px-3 py-2 text-sm text-theme-text outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-4">
                <h2 className="mb-4 text-lg font-bold text-theme-text">Workspace access</h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10 p-6 shadow-sm transition-colors duration-300 gap-4">
                  <div>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">Leave Workspace</span>
                    <p className="text-xs text-red-500/80 dark:text-red-400/80 mt-1">Remove your account from this organization.</p>
                  </div>
                  
                  {/* FUNCTIONAL BUTTON */}
                  <button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to leave this workspace? You will be logged out.")) {
                        localStorage.removeItem("token");
                        router.push("/login");
                      }
                    }}
                    className="rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-200 hover:shadow dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                  >
                    Leave Workspace
                  </button>
                  
                </div>
              </div>
            </div>
          )}

          {/* ================= THEME TAB (next-themes) ================= */}
          {activeTab === "theme" && (
            <div className="flex flex-col gap-8">
              <h1 className="text-2xl font-bold text-theme-text">App Theme</h1>
              <p className="text-sm text-theme-muted -mt-4">Customize the appearance of Task Management System.</p>

              {mounted && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Light Mode */}
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 p-6 transition-all duration-200 ${theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-theme-border bg-theme-card hover:border-theme-muted'}`}
                  >
                    <Sun size={32} className={theme === 'light' ? 'text-blue-500' : 'text-theme-muted'} />
                    <span className={`text-sm font-bold ${theme === 'light' ? 'text-blue-500 dark:text-blue-400' : 'text-theme-text'}`}>Light Mode</span>
                  </button>

                  {/* Dark Mode */}
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 p-6 transition-all duration-200 ${theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-theme-border bg-theme-card hover:border-theme-muted'}`}
                  >
                    <Moon size={32} className={theme === 'dark' ? 'text-blue-500' : 'text-theme-muted'} />
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-blue-500 dark:text-blue-400' : 'text-theme-text'}`}>Dark Mode</span>
                  </button>

                  {/* System Mode */}
                  
                  <button 
                    onClick={() => setTheme("system")}
                    className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 p-6 transition-all duration-200 ${theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-theme-border bg-theme-card hover:border-theme-muted'}`}
                  >
                    <Monitor size={32} className={theme === 'system' ? 'text-blue-500' : 'text-theme-muted'} />
                    <span className={`text-sm font-bold ${theme === 'system' ? 'text-blue-500 dark:text-blue-400' : 'text-theme-text'}`}>System Settings</span>
                    {theme === 'system' && (
                      <span className="absolute bottom-2 text-[10px] text-theme-muted uppercase tracking-wider">
                        (Current: {systemTheme})
                      </span>
                    )}
                  </button>

                </div>
              )}
            </div>
          )}

          {/* ================= COLOR TAB ================= */}
          {activeTab === "color" && (
            <div className="flex flex-col gap-8">
              <h1 className="text-2xl font-bold text-theme-text">Accent Color</h1>
              <p className="text-sm text-theme-muted -mt-4">Choose a primary color to personalize your interactive elements and profile avatar.</p>

              <div className="rounded-xl border border-theme-border bg-theme-card p-8 shadow-sm">
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setAccentColor(color.name);
                        localStorage.setItem("accentColor", color.name);
                        setIsPreviewClicked(false); // Reset preview button when changing colors
                      }}
                      className="group flex flex-col items-center gap-3 outline-none"
                    >
                      <div 
                        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr ${color.gradient} shadow-md transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${accentColor === color.name ? 'ring-4 ring-offset-2 ring-theme-text dark:ring-offset-gray-900 scale-110' : ''}`}
                      >
                        {accentColor === color.name && <CheckCircle2 size={24} className="text-white drop-shadow-md" />}
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${accentColor === color.name ? 'text-theme-text' : 'text-theme-muted group-hover:text-theme-text'}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Functional Live Preview Area */}
              <div className="mt-4">
                <h3 className="mb-4 text-sm font-bold text-theme-muted uppercase tracking-wider">Live Preview</h3>
                <div className="flex items-center gap-4 rounded-xl border border-theme-border bg-theme-card p-6 shadow-sm">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr ${currentGradient} shadow-md text-white font-bold transition-all duration-500`}>
                    {/* Added null safety checks here to fix the crash */}
                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-theme-text">{profile.fullName || 'User Name'}</h4>
                    <p className="text-xs text-theme-muted">@{profile.username || 'username'} • {profile.title || 'Role'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsPreviewClicked(true);
                      setTimeout(() => setIsPreviewClicked(false), 2000);
                    }}
                    className={`ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-tr ${currentGradient} px-4 py-2 text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${isPreviewClicked ? 'opacity-80 scale-95' : 'hover:opacity-90 hover:scale-105'}`}
                  >
                    {isPreviewClicked ? <CheckCircle2 size={16} /> : <Pointer size={16} />}
                    {isPreviewClicked ? "Looks Great!" : "Test Accent"}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
