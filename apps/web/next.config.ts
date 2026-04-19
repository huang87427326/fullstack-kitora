import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages shipped as raw TS/TSX; Next 必须对它们做 transpile
  transpilePackages: ['@kitora/ui', '@kitora/utils', '@kitora/types'],
};

export default nextConfig;
