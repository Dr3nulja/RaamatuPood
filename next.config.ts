import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration for remote patterns
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  // IMPORTANT: For future Next.js versions
  // When allowedDevOrigins becomes available in stable release:
  // Uncomment the line below to resolve cross-origin warnings
  // allowedDevOrigins: [
  //   "localhost:3000",
  //   "127.0.0.1:3000",
  //   "192.168.90.181:3000",
  //   "192.168.90.181:3001",
  // ],
};

export default nextConfig;
