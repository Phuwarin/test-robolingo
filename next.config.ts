import type { NextConfig } from 'next';
const config:NextConfig={
 distDir:process.env.APP_ROLE==='web'?'.next-web':'.next',
 async rewrites(){return {beforeFiles:process.env.API_PROXY_URL?[{source:'/api/:path*',destination:`${process.env.API_PROXY_URL}/api/:path*`}]:[]};}
};
export default config;
