/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Desabilitar ESLint durante o build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

