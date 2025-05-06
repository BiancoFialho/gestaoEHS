
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
    // For client-side bundle, provide fallbacks for Node.js core modules
    // and ensure server-only packages are not included.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        // sqlite3 and bindings are server-side only,
        // but sometimes imports can still try to resolve them on the client.
        // Marking them as false or using an empty module helps.
        sqlite3: false,
        bindings: false,
      };
    }

    // For server-side bundle, we don't need to do anything special for these typically,
    // but if specific externals are needed for other reasons, they could be added here.
    // However, sqlite3 should generally be bundled with the server or handled by the deployment environment.

    // It's often better to ensure that code using 'sqlite3' and 'bindings'
    // is strictly kept out of client components or client-side imports.
    // If direct imports are causing issues even with the fallback,
    // further investigation into component structure might be needed.

    return config;
  },
};

export default nextConfig;
