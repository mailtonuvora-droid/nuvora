import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DODO_API_KEY: process.env.DODO_API_KEY,
  },
};

export default nextConfig;
