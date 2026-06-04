import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export — no Node server at runtime (fits Render free 512MB)
  output: "export",
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
