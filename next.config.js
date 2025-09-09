/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: ['example.com'], // 외부 이미지 도메인 추가 시 사용
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@tanstack/react-query'],
    serverComponentsExternalPackages: ['@prisma/client'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // 컴파일러 설정 (Turbopack 호환성을 위해 조건부 적용)
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      removeConsole: true,
    },
  }),
  
  // 번들 분석기 (개발 시에만)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false, // 빌드 시 ESLint 오류 체크 활성화
  },
  
  // TypeScript 설정
  typescript: {
    ignoreBuildErrors: false, // 빌드 시 TypeScript 오류 체크 활성화
  },
  
  // 성능 최적화
  poweredByHeader: false,
  compress: true,
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
