import { logger } from '@/lib/monitoring';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// 기본 보안 기능
// ============================================================================

// Rate Limiting 설정
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
};

// 간단한 Rate Limiting 구현
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = rateLimitConfig.windowMs;

  const current = requestCounts.get(ip);

  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= rateLimitConfig.max) {
    return false;
  }

  current.count++;
  return true;
}

// 기본 입력 살균 함수
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/['"]/g, '') // 따옴표 제거
    .trim();
}

// CSRF 보호
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('x-csrf-token');
  const sessionToken = request.cookies.get('next-auth.csrf-token')?.value;

  if (!token || !sessionToken) {
    return false;
  }

  return token === sessionToken;
}

// 입력 데이터 살균
export function sanitizeUserInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeInput(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeUserInput);
  }

  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized;
  }

  return input;
}

// SQL Injection 방지
export function validateSQLInput(input: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

// XSS 방지
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 파일 업로드 보안 검증
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: '파일 크기가 너무 큽니다 (최대 10MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '허용되지 않는 파일 형식입니다' };
  }

  // 파일명 검증 (위험한 문자 제거)
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
  if (sanitizedName !== file.name) {
    return { valid: false, error: '파일명에 허용되지 않는 문자가 포함되어 있습니다' };
  }

  return { valid: true };
}

// ============================================================================
// 고급 보안 기능
// ============================================================================

// Content Security Policy 설정
export const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Next.js 개발 환경용
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': [
    "'self'",
    'https://api.edubridge.com', // 실제 API 도메인으로 변경
    'wss:',
    'ws:',
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
};

// 보안 헤더 생성
export function createSecurityHeaders(): Record<string, string> {
  const cspString = Object.entries(cspPolicy)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');

  return {
    // 기본 보안 헤더
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff', // cspell:disable-line
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',

    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Content Security Policy
    'Content-Security-Policy': cspString,

    // Cross-Origin 정책
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',

    // 추가 보안 헤더
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',

    // 서버 정보 숨기기
    Server: 'EduBridge',
    'X-Powered-By': '',
  };
}

// 보안 미들웨어
export function securityMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // 보안 헤더 추가
  const securityHeaders = createSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS 헤더 (필요한 경우)
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token',
    );
  }

  return response;
}

// 입력 검증 및 살균
export class InputValidator {
  // SQL Injection 방지 (고급)
  static validateSQLInput(input: string): boolean {
    const dangerousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|SCRIPT>)\b)/i,
      /(--|\/\*|\*\/|xp_|sp_|@@)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(UNION\s+SELECT)/i,
      /(CONCAT|CHAR|ASCII|SUBSTRING)/i,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(input));
  }

  // XSS 방지 (고급)
  static sanitizeHTML(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // 파일 업로드 검증 (고급)
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    // 파일 크기 검증
    if (file.size > maxSize) {
      return { valid: false, error: '파일 크기가 너무 큽니다 (최대 10MB)' };
    }

    // 파일 타입 검증
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: '허용되지 않는 파일 형식입니다' };
    }

    // 파일명 검증 (위험한 문자 제거)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedName !== file.name) {
      return { valid: false, error: '파일명에 허용되지 않는 문자가 포함되어 있습니다' };
    }

    return { valid: true };
  }

  // 이메일 검증
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // 비밀번호 강도 검증
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다');
    }

    if (!/\d/.test(password)) {
      errors.push('숫자를 포함해야 합니다');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// 보안 로깅
export class SecurityLogger {
  static logSecurityEvent(
    event: string,
    details: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      resource?: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    },
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...details,
      service: 'edubridge-security', // cspell:disable-line
    };

    // 실제 운영 환경에서는 보안 로그를 별도 시스템으로 전송
    logger.warn(`[SECURITY] ${JSON.stringify(logEntry)}`);

    // 심각한 보안 이벤트는 즉시 알림
    if (details.severity === 'critical') {
      this.sendSecurityAlert(logEntry);
    }
  }

  private static sendSecurityAlert(logEntry: any) {
    // 실제 구현에서는 Slack, 이메일, SMS 등으로 알림 전송
    console.error(`[CRITICAL SECURITY ALERT] ${JSON.stringify(logEntry)}`);
  }
}

// CSRF 보호 (고급)
export class CSRFProtection {
  static generateToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  static validateToken(request: NextRequest, sessionToken?: string): boolean {
    const token = request.headers.get('x-csrf-token');

    if (!token || !sessionToken) {
      return false;
    }

    return token === sessionToken;
  }
}

// 기본 보안 헤더 설정 (하위 호환성)
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff', // cspell:disable-line
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
