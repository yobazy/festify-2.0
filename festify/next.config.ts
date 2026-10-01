import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets parallel dev servers keep separate caches (NEXT_DIST_DIR=.next-3001).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
      },
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "image-cdn-fa.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "zdbroencbancathizkro.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.ra.co",
      },
    ],
  },
};

export default nextConfig;
