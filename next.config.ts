import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 'standalone' is required for the Docker/Azure deployment but is
  // incompatible with Vercel's own build output tracing.
  output: process.env.VERCEL ? undefined : 'standalone',
};

export default nextConfig;
