/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local development — backend serving uploaded files
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      // Production API server — set NEXT_PUBLIC_API_HOSTNAME in Vercel env vars
      // e.g. "api.letschat.example.com"
      ...(process.env.NEXT_PUBLIC_API_HOSTNAME
        ? [
            {
              protocol: "https",
              hostname: process.env.NEXT_PUBLIC_API_HOSTNAME,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
