/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async redirects() {
    return [
      // Consolidate SEO on the real domain: old vercel.app URLs 301 to ethioschool.et
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ethschools.vercel.app' }],
        destination: 'https://ethioschool.et/:path*',
        permanent: true,
      },
      // Home page is just a landing redirect into the schools directory
      {
        source: '/',
        destination: '/schools',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
