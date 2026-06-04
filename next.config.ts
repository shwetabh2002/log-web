import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller production server footprint — critical for Render free tier (512MB)
  output: "standalone",
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
