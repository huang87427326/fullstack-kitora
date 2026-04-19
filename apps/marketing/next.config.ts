import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@kitora/ui', '@kitora/utils', '@kitora/types'],
};

export default nextConfig;
