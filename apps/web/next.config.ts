import type { NextConfig } from "next";
const config: NextConfig = {
  async rewrites() {
    const api = process.env.API_PROXY_URL || "http://localhost:4099";
    return { beforeFiles: [{ source: "/api/:path*", destination: `${api}/api/:path*` }] };
  },
};
export default config;
