/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14: keep heavy server-only packages as native Node.js requires
  experimental: {
    serverComponentsExternalPackages: ["nodemailer", "mongoose", "bcryptjs"],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "nodemailer",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
