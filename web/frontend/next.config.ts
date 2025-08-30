/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour les images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration pour Shopify
  async rewrites() {
    return [
      {
        source: "/api/auth/shopify",
        destination: "/api/auth/shopify",
      },
    ];
  },
};

module.exports = nextConfig;
