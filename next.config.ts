import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev StrictMode double-mounts effects; keep dev == production single mount
  // so the saga engine / music never spins up twice.
  reactStrictMode: false,
};

export default nextConfig;
