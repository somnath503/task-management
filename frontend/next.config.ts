import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Bypasses VS Code strict type checking for this property
  eslint: {
    ignoreDuringBuilds: true,
  },
  // @ts-ignore - Bypasses VS Code strict type checking for this property
  typescript: {
    // 🚀 WARNING: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;