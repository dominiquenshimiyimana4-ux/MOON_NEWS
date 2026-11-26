/** @type {import('next').NextConfig} */
const nextConfig = {
  // Moon News uses Next.js server features (Route Handlers, SSR, and
  // request-time analytics), so production builds must remain server-capable.
  // Static export is intentionally not enabled by default.
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    // Keep images unoptimized so the app also works with serverless/edge
    // deployments without requiring the Next.js image optimizer service.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
