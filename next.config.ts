
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
   // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Exclude server-only modules from client-side bundles
    if (!isServer) {
       // For client-side bundle, provide fallbacks for Node.js core modules
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Ensure fallback object exists
        fs: false,       // 'fs' module is not available in the browser
        path: false,     // 'path' module is not available in the browser
      };
      
      // Ensure externals is an array and add server-only packages
      // This handles if config.externals is undefined or already an array.
      // If it were an object or function, this would replace it with an array.
      config.externals = Array.isArray(config.externals) ? config.externals : [];
      config.externals.push('sqlite3', 'bindings');
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;



