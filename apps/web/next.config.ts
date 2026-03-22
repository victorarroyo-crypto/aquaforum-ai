import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: () => `build-${Date.now()}`,
  // Force all pages dynamic — no stale prerender
  experimental: {
    dynamicIO: false,
  },
};

export default nextConfig;
