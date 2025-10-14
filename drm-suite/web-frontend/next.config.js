/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // エラー検知（後で段階的に修正）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 画像最適化設定
  images: {
    // 最新の画像フォーマット対応
    formats: ['image/avif', 'image/webp'],
    // レスポンシブ画像のデバイスサイズ
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // 小さい画像のサイズ設定
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // キャッシュ時間（秒）
    minimumCacheTTL: 3600,
    // リモート画像のパターン（新しい形式）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3用
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig;
