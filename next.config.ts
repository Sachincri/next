import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    formats: ['image/avif', 'image/webp'],
    // Only allow known, trusted image CDN hostnames — never use wildcard "**"
    remotePatterns: [
      { protocol: "https", hostname: "rukminim1.flixcart.com" },
      { protocol: "https", hostname: "rukminim2.flixcart.com" },
      // Cloudinary (common upload CDN)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // AWS S3 buckets
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      // Google Storage
      { protocol: "https", hostname: "storage.googleapis.com" },
      // Unsplash (dev assets)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Limit device sizes to avoid generating too many image variants
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  compress: true,
  poweredByHeader: false,

  experimental: {
    // Tree-shake large icon libraries and UI packages at build time
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts',
      'embla-carousel-react',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  async rewrites() {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1';
    const serverHost = serverUrl.replace(/\/api\/v1\/?$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${serverUrl}/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${serverHost}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
