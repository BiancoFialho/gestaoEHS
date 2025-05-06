
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
  webpack: (config, { isServer, webpack }) => { // Ensure 'webpack' is destructured
    // For client-side bundle, provide fallbacks for Node.js core modules
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false, // General fallback for 'fs'
        path: false, // General fallback for 'path'
      };

      // More forcefully prevent sqlite3, bindings, and sqlite from being included in the client bundle.
      if (webpack) { // webpack instance should be available from Next.js context
        config.plugins.push(
          new webpack.IgnorePlugin({
            resourceRegExp: /^(sqlite3|bindings|sqlite)$/, // Added 'sqlite'
          })
        );
      }
    }
    return config;
  },
};

export default nextConfig;
