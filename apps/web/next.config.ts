import type { NextConfig } from "next";
const config: NextConfig = {
  deploymentId: "line-desk-layout-v2",
  allowedDevOrigins: ["test-web.9phuwarin.dev"],
  async rewrites() {
    const api = process.env.API_PROXY_URL || "http://localhost:4099";
    return { beforeFiles: [{ source: "/api/:path*", destination: `${api}/api/:path*` }] };
  },
};
export default config;
