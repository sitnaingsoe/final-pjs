/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack သို့မဟုတ် Webpack Dev Server အတွက် Network IP ကို ခွင့်ပြုခြင်း
  allowedDevOrigins: ['10.193.219.51', '192.168.137.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.sgp1.cdn.digitaloceanspaces.com',
      },
    ],
  },
};

module.exports = nextConfig;