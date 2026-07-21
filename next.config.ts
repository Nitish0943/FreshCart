import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization — allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
    ],
    // Modern formats for smaller sizes
    formats: ["image/avif", "image/webp"],
  },

  // Strip X-Powered-By header
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  // Tree-shake heavy icon libraries
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },
};

export default nextConfig;
