/** @type {import('next').NextConfig} */
const nextConfig = {
  // "output: export" builds a static site for Firebase Hosting, but it forbids
  // dynamic API routes (the /api/backend proxy). During local development we
  // need a real server, so only export when explicitly building for deploy.
  ...(process.env.BUILD_EXPORT === "1" ? { output: "export" } : {}),
  reactStrictMode: true,
  images: {
    // The default Next.js image optimizer needs a server.
    // Use unoptimized images with static export.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;