import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly enable gzip compression for components and static files
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Target static files like images, fonts, icons in the public directory
        source: '/(.*).(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            // Set max-age to 1 year (31536000 seconds). This applies an expiration policy to static assets.
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
