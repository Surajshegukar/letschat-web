/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // {
            //     protocol: "https",
            //     hostname: "img.clerk.com", // For Clerk avatars
            // },
            // {
            //     protocol: "https",
            //     hostname: "letschat.s3.**", // All S3 buckets (cloud/public)
            // },
            // {
            //     protocol: "http",
            //     hostname: "letschat.s3.**", // HTTP for local S3 (if any)
            // },
            // {
            //     protocol: "https",
            //     hostname: "letschat-example.vercel.app", // Production frontend URL
            // },
            // {
            //     protocol: "http",
            //     hostname: "letschat-example.vercel.app", // HTTP for localhost
            // },
            // {
            //     protocol: "http",
            //     hostname: "[IP_ADDRESS]", // Local API URL
            // },
            {
                protocol: "http",
                hostname: "localhost",
                port: "5000", // Local API URL
            },
            {
                protocol: "http",
                hostname: "[IP_ADDRESS]",
                port: "5000", // Local API URL
            }
        ],
    },
};

export default nextConfig;
