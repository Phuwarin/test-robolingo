import type { NextConfig } from "next";
const config: NextConfig = {
  // Refresh asset URLs on dev startup so tunnel/browser caches do not retain older styles.
  deploymentId: process.env.NODE_ENV === "development" ? `line-desk-dev-${Date.now()}` : process.env.NEXT_DEPLOYMENT_ID,
  allowedDevOrigins: ["test-web.9phuwarin.dev"],
  async rewrites() {
    const api = process.env.API_PROXY_URL || "http://localhost:4099";
    return { beforeFiles: [{ source: "/api/:path*", destination: `${api}/api/:path*` }] };
  },
};
export default config;
