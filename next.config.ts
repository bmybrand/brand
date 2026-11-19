import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
