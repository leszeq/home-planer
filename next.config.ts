import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'atyoodbklymmxebrafpn.supabase.co',
      },
    ],
  },
};

export default nextConfig;
