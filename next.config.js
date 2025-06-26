/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ['kvuilkasrtgyazkvxjal.supabase.co'],
    },
};

module.exports = nextConfig;
