// Electron içinde file:// protokolü ile çalışırken mutlak /_next yolları çökmemesi için
// production export aşamasında assetPrefix'i './' yapıyoruz. Geliştirmede ('next dev')
// './' kullanmak next/font ile hata (assetPrefix must start with slash) ürettiğinden dev'de kaldırıyoruz.
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Sadece prod build'te statik export + relative asset prefix
  ...(isProd ? { output: 'export', assetPrefix: './' } : {})
};

module.exports = nextConfig
