/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [process.env.NEXT_PUBLIC_S3_DOMAIN],
    },
};

export default nextConfig;
