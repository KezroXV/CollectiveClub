/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
