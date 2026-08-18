"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Triangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("API_BASE_URL/auth/guest");
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      router.push("/tasks");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to connect to backend. Make sure your NestJS server is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Base Background: Uses theme-base instead of #FFFFFF
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-theme-base transition-colors duration-200">
      
      {/* Pyramid Logo Block */}
      <div className="mb-8 flex h-[24px] w-full max-w-[1200px] items-center justify-center gap-[8px]">
        {/* Inverts logo colors automatically based on theme */}
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-theme-text text-theme-base">
          <Triangle size={14} fill="currentColor" />
        </div>
        <span className="text-sm font-bold text-theme-text">Pyramid</span>
      </div>

      {/* Main Auth Card Block */}
      <div className="flex w-[384px] flex-col gap-[24px] rounded-[32px] border border-theme-border bg-theme-card p-[24px] shadow-sm transition-colors duration-200">
        
        {/* Header Block */}
        <div className="mx-auto flex h-[46px] w-[336px] flex-col justify-between gap-[6px] text-center">
          <h1 className="text-xl font-bold leading-none tracking-tight text-theme-text">
            Let's get back on track
          </h1>
          <p className="text-xs text-theme-muted">
            Enter your email below to login to your account.
          </p>
        </div>

        {/* Buttons Block */}
        <div className="mx-auto flex h-[84px] w-[336px] flex-col gap-[28px]">
          
          {/* Primary Action: Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center rounded-md bg-theme-text text-sm font-medium text-theme-base transition-colors hover:opacity-80 disabled:opacity-70"
          >
            {isLoading ? "Connecting..." : "Continue as Guest"}
          </button>

          {/* Secondary Action: Google Login */}
          <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-theme-border bg-theme-card text-sm font-medium text-theme-text transition-colors hover:bg-theme-sidebar">
            <span className="mr-1 text-lg font-bold leading-none">G</span> Login with Google
          </button>
        </div>
      </div>

      {/* Privacy Policy Block */}
      <div className="mt-6 flex h-[48px] w-[384px] flex-col items-center justify-center gap-[10px] text-center text-xs text-theme-muted">
        <p>
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline transition-colors hover:text-theme-text">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="underline transition-colors hover:text-theme-text">Privacy Policy</a>
        </p>
      </div>
      
    </div>
  );
}