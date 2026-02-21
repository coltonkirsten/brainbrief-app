import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/forgot-password",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/pricing",
        destination: "/#pricing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
