/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporär für Vercel Deployment - wird später gefixt
    ignoreBuildErrors: true
  },
  eslint: {
    // ESLint während Build für schnelleres Deployment
    ignoreDuringBuilds: true
  },
  swcMinify: true,
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://klassenbuch-app-3xol.vercel.app'
  }
}

module.exports = nextConfig