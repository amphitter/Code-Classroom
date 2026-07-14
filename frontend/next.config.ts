import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   allowedDevOrigins: [
    "192.168.29.27",
  ],
};

export default nextConfig;
