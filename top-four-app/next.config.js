/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.topfour.app',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',

        // If not set, it defaults to the staging API
        destination: `${process.env.API_TARGET_URL || 'https://api.topfour.app/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
