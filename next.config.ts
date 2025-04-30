
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   // Add webpack configuration to externalize server-only modules for the client bundle
  webpack: (config, { isServer }) => {
    // Exclude 'sqlite3' from client-side bundles as it uses Node.js 'fs' module
    if (!isServer) {
       // Ensure externals is an array and add sqlite3
       config.externals = Array.isArray(config.externals) ? config.externals : [];
       config.externals.push('sqlite3');
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;

