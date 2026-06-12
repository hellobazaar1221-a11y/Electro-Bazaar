/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    domains: [
      'res.cloudinary.com',
      'storage.googleapis.com',
      'm.media-amazon.com',
      'pisces.bbystatic.com',
      'oasis.opstatics.com',
      'images.unsplash.com',
      'cdn.abacus.ai',
      'd1ncau8tqf99kp.cloudfront.net',
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.filename = 'static/chunks/[name]-[contenthash:8].js';
      config.output.chunkFilename = 'static/chunks/[contenthash:16].js';
    }
    return config;
  },
};

module.exports = nextConfig;
