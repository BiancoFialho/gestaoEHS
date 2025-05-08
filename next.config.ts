
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
  webpack: (config, { isServer, webpack: Webpack }) => { // Renomeado para Webpack para clareza
    // For client-side bundle, provide fallbacks for Node.js core modules
    // and prevent Node.js specific modules from being bundled.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        // Outros módulos Node.js que podem precisar de fallback se causarem problemas:
        // crypto: false,
        // stream: false,
        // util: false,
      };

      // More forcefully prevent sqlite3 and its dependencies like 'bindings' from being included in the client bundle.
      if (Webpack) { // Verifica se a instância do Webpack está disponível
        config.plugins.push(
          new Webpack.IgnorePlugin({
            resourceRegExp: /^(sqlite3|bindings|sqlite)$/i, // Usar regex case-insensitive e cobrir variações
            // contextRegExp: /.*/, // Opcional: para aplicar em todos os contextos
          })
        );
      }
    }
    return config;
  },
};

export default nextConfig;

