// const withNextIntl = require('next-intl/plugin')(
//   // next-intl 설정 파일 경로
//   './src/i18n.ts',
// );

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker를 위한 standalone 출력
  output: 'standalone',

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
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
  }),

  // Webpack 설정
  webpack: (config, { isServer, webpack }) => {
    // ChromaDB 관련 바이너리 파일 처리
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // 번들 분석기 (개발 시에만)
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
        }),
      );
    }

    // 서버 사이드에서만 사용되는 패키지들을 외부화
    if (isServer) {
      config.externals.push({
        'onnxruntime-node': 'commonjs onnxruntime-node',
        '@huggingface/transformers': 'commonjs @huggingface/transformers',
        '@chroma-core/default-embed': 'commonjs @chroma-core/default-embed',
      });
    }

    // 클라이언트 사이드에서 ChromaDB 관련 모듈 제외
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

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

  // 경로 리다이렉트 (오타/구형 경로 보정)
  async redirects() {
    return [
      { source: '/profiles', destination: '/profile', permanent: false },
      { source: '/my/report', destination: '/my/reports', permanent: false },
      // 학생 기본 랜딩 변경: 과거 '/problems'로 들어오는 링크를 '/my/learning'로 유도
      { source: '/home-student', destination: '/my/learning', permanent: false },
    ];
  },
};

module.exports = nextConfig;
