import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Limit concurrency to avoid exhausting DB connections during static generation
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
