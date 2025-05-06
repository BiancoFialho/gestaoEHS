
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
    // Exclude server-only modules from client-side bundles
    if (!isServer) {
       // Ensure externals is an array
       config.externals = Array.isArray(config.externals) ? config.externals : [];
       config.externals.push('sqlite3');
       config.externals.push('bindings'); // Add bindings here
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;

