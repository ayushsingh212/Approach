import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep heavy server-only packages as native Node.js requires (not bundled by webpack)
  serverExternalPackages: ["nodemailer", "mongoose", "bcryptjs"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from trying to bundle Node.js built-ins used by nodemailer
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "nodemailer",
      ];
    }
    return config;
  },
};

export default nextConfig;
