/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.10.108'],
  images: { domains: [] },
  async rewrites() {
    return [{ source: '/auth/v1/:path*', destination: 'http://192.168.10.108:9999/:path*' }]
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]}]
  },
}
module.exports = nextConfig
