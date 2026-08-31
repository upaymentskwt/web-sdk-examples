/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@upayments-kw/react', '@upayments-kw/web-sdk'],
};

export default nextConfig;
