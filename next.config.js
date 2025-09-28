// Electron içinde file:// protokolü ile çalışırken mutlak /_next yolları çökmemesi için
// assetPrefix'i './' yapıyoruz; böylece oluşturulan script ve css referansları görece (relative) olur.
const nextConfig = {
  images: { unoptimized: true },
  output: 'export',
  assetPrefix: './',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};

module.exports = nextConfig
